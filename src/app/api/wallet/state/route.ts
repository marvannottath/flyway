import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureEnterpriseDataForUser } from "@/lib/enterprise";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const queryUserId = req.nextUrl.searchParams.get("userId");
    const userId = queryUserId || sessionCookie || "usr_client_ca_02";

    // Ensure all enterprise data (CRM, HR, Workflows) is provisioned
    await ensureEnterpriseDataForUser(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
            usageLogs: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        country: true,
        companyName: true,
      },
    });

    return NextResponse.json({
      user,
      wallet: user.wallet,
      allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
