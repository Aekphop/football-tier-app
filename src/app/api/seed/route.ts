import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function POST() {
  try {
    Storage.seedDemoData();
    return NextResponse.json({ success: true, message: "Reset to default demo data successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to seed demo data" }, { status: 500 });
  }
}
