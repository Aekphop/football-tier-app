import { NextResponse } from "next/server";
import { Storage } from "@/lib/storage";

export async function POST() {
  try {
    const resetData = Storage.hardResetAllData();
    return NextResponse.json({
      success: true,
      message: "ระบบถูกรีเซ็ตกลับเป็นค่าเริ่มต้น และล้างข้อมูลเก่าทั้งหมดเรียบร้อยแล้ว",
      data: resetData,
    });
  } catch (error) {
    console.error("Hard reset error:", error);
    return NextResponse.json({ success: false, error: "Failed to reset database" }, { status: 500 });
  }
}
