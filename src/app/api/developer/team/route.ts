import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const queryUserId = req.nextUrl.searchParams.get("userId");
    const userId = sessionCookie || queryUserId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { email, name, role = "DEVELOPER", userId: explicitUserId } = await req.json();
    const userId = explicitUserId || sessionCookie;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const member = await prisma.teamMember.create({
      data: {
        userId,
        email: email.toLowerCase().trim(),
        name: name || email.split("@")[0],
        role: role.toUpperCase(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { memberId } = await req.json();

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.teamMember.deleteMany({
      where: { id: memberId, userId: sessionCookie },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
