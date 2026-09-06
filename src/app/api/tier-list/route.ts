import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";
import { calculateTierListSummary } from "@/lib/tierCalculator";

export async function GET() {
  try {
    const candidates = Storage.getCandidates();
    const votes = Storage.getVotes();
    const settings = Storage.getSettings();
    const status = Storage.isVotingOpen();

    const summary = calculateTierListSummary(candidates, votes);

    return NextResponse.json({
      success: true,
      data: summary,
      settings: {
        title: settings.title,
        description: settings.description,
        isLocked: settings.isLocked,
        votingStartTime: settings.votingStartTime,
        votingEndTime: settings.votingEndTime,
      },
      status,
    });
  } catch (error) {
    console.error("Tier list GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate tier list" }, { status: 500 });
  }
}
