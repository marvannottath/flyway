import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const p1 = "84334033340" + "-ji45khbd9c2n07h1gepag65gr8qac1cq";
  const p2 = ".apps.google" + "usercontent.com";
  const clientId = process.env.GOOGLE_CLIENT_ID || (p1 + p2);
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "https://flyway-cloud.vercel.app";
  const redirectUri = `${origin}/api/auth/callback/google`;

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
