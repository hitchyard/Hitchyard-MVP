// =================================================================
// API ENDPOINT: CARRIER HISTORY FOR DIFY MATCHMAKING AGENT
// =================================================================
// Purpose: Expose fetchCarrierHistory server action as HTTP endpoint for Dify
// Security: Requires valid Supabase session via cookies

import { NextRequest, NextResponse } from "next/server";
import { fetchCarrierHistory } from "@/app/actions/fetchCarrierHistory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carrierId } = body;

    if (!carrierId) {
      return NextResponse.json(
        { success: false, error: "carrierId is required" },
        { status: 400 }
      );
    }

    const result = await fetchCarrierHistory(carrierId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error?.includes("Unauthorized") ? 401 : 400 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
