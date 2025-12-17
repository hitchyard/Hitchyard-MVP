// =================================================================
// API ENDPOINT: VETTING DATA FOR DIFY VETTING AGENT
// =================================================================
// Purpose: Expose fetchVettingData server action as HTTP endpoint for Dify
// Security: Requires valid Supabase session via cookies

import { NextRequest, NextResponse } from "next/server";
import { fetchVettingData } from "@/app/actions/fetchVettingData";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const result = await fetchVettingData(userId);

    if (!result.success) {
      const statusCode = result.error?.includes("Unauthorized") ? 401 
                       : result.error?.includes("Forbidden") ? 403
                       : 400;
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
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

/**
 * GET endpoint for testing/debugging
 * Usage: GET /api/vetting-data?userId=uuid-here
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const result = await fetchVettingData(userId);

    if (!result.success) {
      const statusCode = result.error?.includes("Unauthorized") ? 401 
                       : result.error?.includes("Forbidden") ? 403
                       : 400;
      
      return NextResponse.json(
        { success: false, error: result.error },
        { status: statusCode }
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
