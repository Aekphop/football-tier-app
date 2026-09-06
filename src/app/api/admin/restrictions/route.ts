import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET() {
  try {
    const settings = Storage.getSettings();
    const candidates = Storage.getCandidates();
    return NextResponse.json({
      success: true,
      restrictions: settings.votingRestrictions || {},
      candidates,
    });
  } catch (error) {
    console.error("Restrictions GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch restrictions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restrictions } = body;

    if (!restrictions || typeof restrictions !== "object") {
      return NextResponse.json({ success: false, error: "Invalid restrictions payload" }, { status: 400 });
    }

    const updatedSettings = Storage.updateVotingRestrictions(restrictions);

    return NextResponse.json({
      success: true,
      data: updatedSettings.votingRestrictions,
      message: "บันทึกกติกาใครห้ามโหวตใครเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Restrictions POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to save restrictions" }, { status: 500 });
  }
}
