import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const queryUserId = req.nextUrl.searchParams.get("userId");
    const userId = sessionCookie || queryUserId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ keys });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { name = "Production API Key", userId: explicitUserId } = await req.json();
    const userId = explicitUserId || sessionCookie;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate secure API key: fly_live_<32 alphanumeric chars>
    const randomBytes = crypto.randomBytes(24).toString("base64url");
    const fullKey = `fly_live_${randomBytes}`;
    const keyPrefix = `${fullKey.slice(0, 12)}...`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyPrefix,
        keyHash: fullKey,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      key: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        fullKey, // Only returned on creation
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("flyway_session")?.value;
    const { keyId } = await req.json();

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.apiKey.deleteMany({
      where: { id: keyId, userId: sessionCookie },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
