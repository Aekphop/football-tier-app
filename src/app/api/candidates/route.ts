import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET() {
  try {
    const candidates = Storage.getCandidates();
    return NextResponse.json({ success: true, data: candidates });
  } catch (error) {
    console.error("Candidates GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch candidates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, nickname, number, position, team, avatarUrl } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const newCandidate = Storage.addCandidate({
      name,
      nickname: nickname || "",
      number: number ? Number(number) : undefined,
      position: position || "Player",
      team: team || "",
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}`,
    });

    return NextResponse.json({ success: true, data: newCandidate });
  } catch (error) {
    console.error("Candidate POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to add candidate" }, { status: 500 });
  }
}
