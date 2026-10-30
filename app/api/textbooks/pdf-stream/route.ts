import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { s3, s3HasCredentials, BUCKET_NAME } from "@/lib/s3";
import {
  verifyPdfStreamToken,
  resolveLocalProtectedPdfPath,
  signedPdfUrl,
} from "@/lib/protectedPdf";

// Keep individual chunk responses well below AWS Lambda / Amplify's 6 MB payload limit.
const MAX_CHUNK_BYTES = 4 * 1024 * 1024; // 4 MB
const MAX_SINGLE_BYTES = 5 * 1024 * 1024; // 5 MB

function parseRangeHeader(
  rangeHeader: string | null
): { start: number; end: number } | null {
  if (!rangeHeader) return null;
  const match = /^bytes=(\d+)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;
  const start = parseInt(match[1], 10);
  if (!Number.isFinite(start) || start < 0) return null;
  const rawEnd = match[2] ? parseInt(match[2], 10) : start + MAX_CHUNK_BYTES - 1;
  const requestedEnd =
    Number.isFinite(rawEnd) && rawEnd >= start
      ? rawEnd
      : start + MAX_CHUNK_BYTES - 1;
  const end = Math.min(requestedEnd, start + MAX_CHUNK_BYTES - 1);
  return { start, end };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") || "";
    const verified = verifyPdfStreamToken(token);
    if (!verified) {
      return NextResponse.json(
        { error: "Invalid or expired PDF stream token." },
        { status: 401 }
      );
    }

    const { folder, fileName } = verified;
    const rangeHeader = req.headers.get("range");
    const parsedRange = parseRangeHeader(rangeHeader);

    // 1. Try S3 when credentials are configured
    if (s3HasCredentials) {
      try {
        const key = `${folder}/${fileName}`;
        if (parsedRange) {
          const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Range: `bytes=${parsedRange.start}-${parsedRange.end}`,
          });
          const s3Res = await s3.send(command);
          if (s3Res.Body) {
            const bytes = await s3Res.Body.transformToByteArray();
            const actualEnd = parsedRange.start + bytes.byteLength - 1;
            const contentRange =
              s3Res.ContentRange ||
              `bytes ${parsedRange.start}-${actualEnd}/*`;
            return new Response(Buffer.from(bytes), {
              status: 206,
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
                "Accept-Ranges": "bytes",
                "Content-Range": contentRange,
                "Content-Length": String(bytes.byteLength),
                "Cache-Control": "private, max-age=1800",
              },
            });
          }
        } else {
          // Non-range request: fetch up to MAX_SINGLE_BYTES first to inspect total size
          const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Range: `bytes=0-${MAX_SINGLE_BYTES - 1}`,
          });
          const s3Res = await s3.send(command);
          if (s3Res.Body) {
            const bytes = await s3Res.Body.transformToByteArray();
            const totalMatch = /\/(\d+)$/.exec(s3Res.ContentRange || "");
            const totalSize = totalMatch
              ? parseInt(totalMatch[1], 10)
              : bytes.byteLength;
            if (bytes.byteLength >= totalSize) {
              return new Response(Buffer.from(bytes), {
                status: 200,
                headers: {
                  "Content-Type": "application/pdf",
                  "Content-Disposition": "inline",
                  "Accept-Ranges": "bytes",
                  "Content-Length": String(bytes.byteLength),
                  "Cache-Control": "private, max-age=1800",
                },
              });
            }
            // File exceeds single Lambda response budget and caller did not send Range; redirect to signed S3 URL
            const fallbackSigned = await signedPdfUrl(folder, fileName);
            if (fallbackSigned) {
              return NextResponse.redirect(fallbackSigned, 302);
            }
          }
        }
      } catch (s3Err: any) {
        if (s3Err?.$metadata?.httpStatusCode === 416) {
          return new Response(null, { status: 416 });
        }
        console.warn(
          "pdf-stream S3 fetch failed, trying local fallback:",
          s3Err?.message || s3Err
        );
      }
    }

    // 2. Local filesystem fallback (dev / local s3-upload directory)
    const localPath = resolveLocalProtectedPdfPath(folder, fileName);
    if (!localPath) {
      return NextResponse.json(
        { error: "PDF file not found." },
        { status: 404 }
      );
    }

    const stat = fs.statSync(localPath);
    const totalSize = stat.size;

    if (parsedRange) {
      if (parsedRange.start >= totalSize) {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${totalSize}`,
          },
        });
      }
      const end = Math.min(parsedRange.end, totalSize - 1);
      const chunkLength = end - parsedRange.start + 1;
      const buffer = Buffer.allocUnsafe(chunkLength);
      const fd = fs.openSync(localPath, "r");
      try {
        fs.readSync(fd, buffer, 0, chunkLength, parsedRange.start);
      } finally {
        fs.closeSync(fd);
      }

      return new Response(buffer, {
        status: 206,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "Accept-Ranges": "bytes",
          "Content-Range": `bytes ${parsedRange.start}-${end}/${totalSize}`,
          "Content-Length": String(chunkLength),
          "Cache-Control": "private, max-age=1800",
        },
      });
    }

    const fullBuffer = fs.readFileSync(localPath);
    return new Response(fullBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes",
        "Content-Length": String(totalSize),
        "Cache-Control": "private, max-age=1800",
      },
    });
  } catch (err) {
    console.error("❌ Error in /api/textbooks/pdf-stream:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

