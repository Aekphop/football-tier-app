import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET() {
  try {
    const settings = Storage.getSettings();
    const status = Storage.isVotingOpen();
    return NextResponse.json({
      success: true,
      data: settings,
      status,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      votingStartTime,
      votingEndTime,
      isLocked,
      preventSelfVoting,
      allowEditVote,
      votingPasscode,
      requireApproval,
      approvedUsers,
      bannedUsers,
      adminEmails,
      customization,
    } = body;

    const updated = Storage.updateSettings({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(votingStartTime !== undefined && { votingStartTime }),
      ...(votingEndTime !== undefined && { votingEndTime }),
      ...(isLocked !== undefined && { isLocked: Boolean(isLocked) }),
      ...(preventSelfVoting !== undefined && { preventSelfVoting: Boolean(preventSelfVoting) }),
      ...(allowEditVote !== undefined && { allowEditVote: Boolean(allowEditVote) }),
      ...(votingPasscode !== undefined && { votingPasscode: String(votingPasscode).trim() }),
      ...(requireApproval !== undefined && { requireApproval: Boolean(requireApproval) }),
      ...(approvedUsers !== undefined && { approvedUsers }),
      ...(bannedUsers !== undefined && { bannedUsers }),
      ...(adminEmails !== undefined && { adminEmails }),
      ...(customization !== undefined && { customization }),
    });

    const status = Storage.isVotingOpen();

    return NextResponse.json({
      success: true,
      data: updated,
      status,
    });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
