import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, message } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 🪶 Ví dụ: lưu tạm vào file JSON / database / gửi mail, tuỳ bạn.
    console.log("💌 New suggestion from:", name);
    console.log("Message:", message);

    // Sau này bạn có thể thêm lưu vào MongoDB hoặc Supabase:
    // await db.suggestions.insert({ name, message, createdAt: new Date() });

    return NextResponse.json({ success: true, message: "Suggestion received!" });
  } catch (error) {
    console.error("Error in /api/suggestions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
