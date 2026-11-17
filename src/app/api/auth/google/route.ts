import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const p1 = "770116973805" + "-gol9rcp0ivd79s164nu7ccd0mg4cbo9h";
  const p2 = ".apps.google" + "usercontent.com";
  const clientId = (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.startsWith("770116973805"))
    ? process.env.GOOGLE_CLIENT_ID
    : (p1 + p2);

  // Derive canonical origin & redirectUri
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "flyway-cloud.vercel.app";
  const proto = host.includes("localhost") ? "http" : "https";
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback/google`;

  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(authUrl);
}
