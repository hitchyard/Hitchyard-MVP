import { NextResponse } from "next/server";
import { runHitchyardQualification } from "@/app/actions/fullQualificationAction";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { mcNumber, ein } = await req.json();
    if (!mcNumber) return NextResponse.json({ error: "MC# is required" }, { status: 400 });
    if (!ein) return NextResponse.json({ error: "EIN is required" }, { status: 400 });

    const result = await runHitchyardQualification(mcNumber, ein);

    return NextResponse.json({
      status: result.status,
      details: result.prefill,
      instructions: result.prefill?.INSTRUCTIONS || "No specific instructions.",
      score: result.score,
      datManualRequired: result.datManualRequired,
    });
  } catch (error) {
    console.error("Dify Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
