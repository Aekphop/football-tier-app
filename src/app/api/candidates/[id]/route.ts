import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = Storage.getCandidateById(params.id);
    if (!candidate) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: candidate });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch candidate" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = Storage.updateCandidate(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update candidate" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = Storage.deleteCandidate(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Candidate not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete candidate" }, { status: 500 });
  }
}
