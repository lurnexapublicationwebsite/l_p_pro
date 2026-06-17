import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Supported image extensions
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
]);

export async function GET() {
  try {
    const galleryPath = path.join(process.cwd(), "public", "gallery");

    // Check if path exists
    if (!fs.existsSync(galleryPath)) {
      return NextResponse.json({ folders: {} });
    }

    const foldersData: Record<string, string[]> = {};

    // Read directory contents
    const items = fs.readdirSync(galleryPath);

    for (const item of items) {
      const itemPath = path.join(galleryPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        const files = fs.readdirSync(itemPath);
        const images = files
          .filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.has(ext);
          })
          .map((file) => `/gallery/${item}/${file}`);

        // Only include folders that are specified or have images (we can also include empty folders)
        foldersData[item] = images;
      }
    }

    return NextResponse.json({ folders: foldersData });
  } catch (error: any) {
    console.error("Error loading gallery images:", error);
    return NextResponse.json(
      { error: "Failed to load gallery images", details: error.message },
      { status: 500 }
    );
  }
}
