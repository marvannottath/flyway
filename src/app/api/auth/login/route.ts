import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureEnterpriseDataForUser } from "@/lib/enterprise";

export async function POST(req: NextRequest) {
  try {
    const { email, name, provider = "google", country = "CA", companyName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { wallet: true },
    });

    if (!user) {
      // Create new user with initialized wallet
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name || email.split("@")[0],
          companyName: companyName || `${name || email.split("@")[0]}'s Org`,
          country: country || "CA",
          role: "USER",
          stripeCustomerId: `cus_gen_${Date.now()}`,
          wallet: {
            create: {
              balance: 500, // 500 free trial credits for new Google signups
              currency: country === "US" ? "USD" : "CAD",
              lifetimeSpentCents: 0,
              lifetimeCreditsGranted: 500,
            },
          },
        },
        include: { wallet: true },
      });
    }

    // Automatically ensure full enterprise CRM, HR, and Workflows are provisioned
    await ensureEnterpriseDataForUser(user.id);

    const res = NextResponse.json({
      success: true,
      user,
      message: `Signed in as ${user.email}`,
    });

    // Set auth cookie (safe for localhost HTTP and production HTTPS)
    const isHttps = req.nextUrl.protocol === "https:";
    res.cookies.set("flyway_session", user.id, {
      httpOnly: false,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("Auth login error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
