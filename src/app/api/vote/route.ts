import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const candidateId = searchParams.get("candidateId");

    if (userId && candidateId) {
      const userVote = Storage.getUserVoteForCandidate(userId, candidateId);
      const isSelf = Storage.isSelfVote(candidateId, userId);
      const isApproved = Storage.isUserApproved(userId);

      return NextResponse.json({
        success: true,
        data: userVote || null,
        isSelfVote: isSelf,
        isApproved,
      });
    }

    if (candidateId) {
      const candidateVotes = Storage.getVotesByCandidate(candidateId);
      return NextResponse.json({ success: true, data: candidateVotes });
    }

    const allVotes = Storage.getVotes();
    return NextResponse.json({ success: true, data: allVotes });
  } catch (error) {
    console.error("Vote GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch votes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const status = Storage.isVotingOpen();
    if (!status.isOpen) {
      return NextResponse.json(
        {
          success: false,
          error: `ไม่สามารถบันทึกคะแนนได้: ${status.reason}`,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { candidateId, userId, userEmail, scores, passcode } = body;

    if (!candidateId || !userId || !scores) {
      return NextResponse.json(
        { success: false, error: "ข้อมูลไม่ครบถ้วน (candidateId, userId, scores)" },
        { status: 400 }
      );
    }

    // Validate that scores are 1-5
    const validatedScores: Record<string, number> = {};
    for (const [key, val] of Object.entries(scores)) {
      const numVal = Number(val);
      if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) {
        validatedScores[key] = numVal;
      }
    }

    const result = Storage.saveVote(
      candidateId,
      userId,
      userEmail || "anonymous@voter.com",
      validatedScores,
      passcode
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "ไม่สามารถบันทึกผลโหวตได้" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "บันทึกการโหวตเรียบร้อยแล้ว (ไม่สามารถแก้ไขได้)",
      data: result.data,
    });
  } catch (error) {
    console.error("Vote POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit vote" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    Storage.resetAllVotes();
    return NextResponse.json({ success: true, message: "Reset all votes successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to reset votes" }, { status: 500 });
  }
}
