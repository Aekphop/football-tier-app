import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function GET() {
  try {
    const users = Storage.getUsers();
    const settings = Storage.getSettings();
    return NextResponse.json({
      success: true,
      data: users,
      approvedEmails: settings.approvedUsers || [],
      bannedEmails: settings.bannedUsers || [],
      requireApproval: settings.requireApproval,
      passcode: settings.votingPasscode,
    });
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, approve, ban, user } = body;

    if (action === "toggleApproval" && email !== undefined && approve !== undefined) {
      const updatedSettings = Storage.toggleUserApproval(email, Boolean(approve));
      return NextResponse.json({ success: true, data: updatedSettings });
    }

    if (action === "toggleBan" && email !== undefined && ban !== undefined) {
      const updatedSettings = Boolean(ban)
        ? Storage.banUser(email)
        : Storage.unbanUser(email);
      return NextResponse.json({ success: true, data: updatedSettings });
    }

    if (user) {
      const registered = Storage.registerUser(user);
      return NextResponse.json({ success: true, data: registered });
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to process user request" }, { status: 500 });
  }
}
