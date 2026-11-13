import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${origin}/api/auth/callback/google`;

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
