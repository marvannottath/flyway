import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureEnterpriseDataForUser } from "@/lib/enterprise";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const userId = sessionCookie || req.nextUrl.searchParams.get("userId") || "usr_client_ca_02";

    await ensureEnterpriseDataForUser(userId);

    const automations = await prisma.workflowAutomation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const activeCount = automations.filter((a) => a.status === "ACTIVE").length;
    const totalRuns = automations.reduce((sum, a) => sum + a.runCount, 0);

    return NextResponse.json({
      automations,
      stats: {
        totalAutomations: automations.length,
        activeCount,
        totalRuns,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { action, automationId, newAutomation, userId: explicitUserId } = await req.json();
    const userId = sessionCookie || explicitUserId || "usr_client_ca_02";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: "User or wallet not found" }, { status: 404 });
    }

    // Action 1: Create New Workflow
    if (action === "CREATE") {
      const auto = await prisma.workflowAutomation.create({
        data: {
          userId: user.id,
          name: newAutomation.name,
          category: newAutomation.category || "CRM",
          triggerEvent: newAutomation.triggerEvent || "On Inbound Webhook",
          actionPlan: newAutomation.actionPlan || "Execute multi-step AI verification node",
          creditCost: Number(newAutomation.creditCost) || 25,
          status: "ACTIVE",
        },
      });
      return NextResponse.json({ success: true, automation: auto });
    }

    // Action 2: Trigger / Execute Automation Now (deducts credits)
    if (action === "RUN_NOW") {
      const auto = await prisma.workflowAutomation.findUnique({ where: { id: automationId } });
      if (!auto) return NextResponse.json({ error: "Automation not found" }, { status: 404 });

      const cost = auto.creditCost;
      if (user.wallet.balance < cost) {
        return NextResponse.json(
          { error: `Insufficient credits. Need ${cost} credits.` },
          { status: 402 }
        );
      }

      const newBalance = user.wallet.balance - cost;
      const executionTime = Math.floor(110 + Math.random() * 190);

      const [updatedWallet, updatedAuto] = await prisma.$transaction([
        prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: newBalance },
        }),
        prisma.workflowAutomation.update({
          where: { id: automationId },
          data: {
            runCount: { increment: 1 },
            lastRunAt: new Date(),
          },
        }),
        prisma.usageLog.create({
          data: {
            walletId: user.wallet.id,
            serviceName: `Automated Pipeline: ${auto.name}`,
            serviceCategory: auto.category,
            creditsCost: cost,
            balanceAfter: newBalance,
            executionTimeMs: executionTime,
            payloadSnippet: `Triggered: ${auto.triggerEvent} -> ${auto.actionPlan}`,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        automation: updatedAuto,
        newBalance: updatedWallet.balance,
        creditsDeducted: cost,
        executionTimeMs: executionTime,
      });
    }

    // Action 3: Toggle status (ACTIVE <-> PAUSED)
    if (action === "TOGGLE_STATUS") {
      const auto = await prisma.workflowAutomation.findUnique({ where: { id: automationId } });
      if (!auto) return NextResponse.json({ error: "Automation not found" }, { status: 404 });

      const updated = await prisma.workflowAutomation.update({
        where: { id: automationId },
        data: {
          status: auto.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
        },
      });
      return NextResponse.json({ success: true, automation: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
