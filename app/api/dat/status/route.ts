import { NextResponse } from "next/server";
import { getDATAccessToken } from "@/lib/datAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { mcNumber } = await req.json().catch(() => ({ mcNumber: undefined }));
    const envToken = process.env.DAT_API_TOKEN;
    const ephemeralToken = await getDATAccessToken();
    const token = envToken || ephemeralToken;
    const manualRequired = !token || token === "stub";
    return NextResponse.json({ manualRequired, mcNumber: mcNumber || null });
  } catch (e) {
    return NextResponse.json({ manualRequired: true, error: "DAT status check failed" }, { status: 200 });
  }
}
