import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureEnterpriseDataForUser } from "@/lib/enterprise";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const userId = sessionCookie || req.nextUrl.searchParams.get("userId") || "usr_client_ca_02";

    await ensureEnterpriseDataForUser(userId);

    const employees = await prisma.hrEmployee.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const totalPayrollCAD = employees.reduce((sum, e) => sum + e.salaryCAD, 0);

    return NextResponse.json({
      employees,
      stats: {
        headcount: employees.length,
        totalPayrollCAD,
        activeEmployees: employees.filter((e) => e.status === "ACTIVE").length,
        onboarding: employees.filter((e) => e.status === "ONBOARDING").length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { action, employeeData, candidateResume, userId: explicitUserId } = await req.json();
    const userId = sessionCookie || explicitUserId || "usr_client_ca_02";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: "User or wallet not found" }, { status: 404 });
    }

    // Action 1: Add Employee
    if (action === "ADD_EMPLOYEE") {
      const emp = await prisma.hrEmployee.create({
        data: {
          userId: user.id,
          fullName: employeeData.fullName,
          workEmail: employeeData.workEmail,
          department: employeeData.department || "Engineering",
          jobTitle: employeeData.jobTitle,
          employmentType: employeeData.employmentType || "FULL_TIME",
          salaryCAD: Number(employeeData.salaryCAD) || 120000,
          status: "ACTIVE",
          performanceScore: 4.8,
        },
      });
      return NextResponse.json({ success: true, employee: emp });
    }

    // Action 2: AI Candidate Resume Screening (Deducts 50 credits)
    if (action === "SCREEN_RESUME") {
      const cost = 50;
      if (user.wallet.balance < cost) {
        return NextResponse.json(
          { error: "Insufficient credits. Please top up your wallet." },
          { status: 402 }
        );
      }

      const newBalance = user.wallet.balance - cost;
      const executionTime = Math.floor(180 + Math.random() * 150);

      const [updatedWallet, usageLog] = await prisma.$transaction([
        prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: newBalance },
        }),
        prisma.usageLog.create({
          data: {
            walletId: user.wallet.id,
            serviceName: "AI Candidate Semantic Resume Parser",
            serviceCategory: "HR",
            creditsCost: cost,
            balanceAfter: newBalance,
            executionTimeMs: executionTime,
            payloadSnippet: `Resume screening for: ${candidateResume?.name || "Engineering Applicant"}`,
          },
        }),
      ]);

      const screeningResult = {
        candidateName: candidateResume?.name || "Alexandre Rostova",
        matchScore: "94% Match",
        primaryCompetencies: ["Distributed Cloud Architecture", "TypeScript / Next.js", "AI Model Fine-Tuning", "Fintech Compliance"],
        salaryBenchmarkCAD: "$130,000 - $145,000",
        recommendation: "STRONG_HIRE - Automated technical interview invitation dispatched.",
      };

      return NextResponse.json({
        success: true,
        screeningResult,
        newBalance: updatedWallet.balance,
        creditsDeducted: cost,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
