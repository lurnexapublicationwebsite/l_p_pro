import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const pdfsDir = path.join(process.cwd(), "public", "published_books", "pdfs");
    
    if (!fs.existsSync(pdfsDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(pdfsDir)
      .filter(file => file.endsWith(".pdf"));

    return NextResponse.json({ files });
  } catch (error) {
    console.error("❌ Error reading published books directory:", error);
    return NextResponse.json({ files: [] }, { status: 500 });
  }
}
