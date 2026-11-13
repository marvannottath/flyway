import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "");
    const userId = sessionCookie || authHeader;

    if (!userId) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: {
          include: {
            transactions: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
            usageLogs: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
