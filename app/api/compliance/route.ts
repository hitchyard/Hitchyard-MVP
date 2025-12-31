import { NextRequest, NextResponse } from "next/server";
import { fetchCarrierCompliance } from "@/app/actions/fetchCarrierCompliance";

export async function POST(req: NextRequest) {
  try {
    const { mcNumber } = await req.json();
    if (!mcNumber) {
      return NextResponse.json({ success: false, error: "mcNumber is required" }, { status: 400 });
    }

    const result = await fetchCarrierCompliance(mcNumber);
    const status = result.success ? 200 : result.error?.includes("not configured") ? 500 : 400;
    return NextResponse.json(result, { status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Unexpected error" }, { status: 500 });
  }
}
