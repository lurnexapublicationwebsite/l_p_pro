import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

const WATERMARK_TEXT = 'Lurnexa Publications Vol. 01- Issue 01- April 2026';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath) {
      return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
    }

    // Sanitize: only allow files from /pdfs/ or /climate_paper.pdf in public
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (!normalizedPath.startsWith('/pdfs/') && normalizedPath !== '/climate_paper.pdf') {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    // Resolve the file from the public directory
    const absolutePath = path.join(process.cwd(), 'public', normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the original PDF
    const originalPdfBytes = fs.readFileSync(absolutePath);
    const pdfDoc = await PDFDocument.load(originalPdfBytes);

    // Embed font for watermark
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Embed regular font for footer
    const footerFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const footerFontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      // === DIAGONAL WATERMARK ===
      const diagonal = Math.sqrt(width * width + height * height);
      const fontSize = Math.min(diagonal / WATERMARK_TEXT.length * 1.5, 28);
      const textWidth = font.widthOfTextAtSize(WATERMARK_TEXT, fontSize);

      const angleDeg = Math.atan2(height, width) * (180 / Math.PI);
      const angleRad = angleDeg * (Math.PI / 180);

      const centerX = width / 2;
      const centerY = height / 2;

      const x = centerX - (textWidth / 2) * Math.cos(angleRad);
      const y = centerY - (textWidth / 2) * Math.sin(angleRad);

      page.drawText(WATERMARK_TEXT, {
        x,
        y,
        size: fontSize,
        font: font,
        color: rgb(0.7, 0.7, 0.7),
        rotate: degrees(angleDeg),
        opacity: 0.25,
      });

      // === PROFESSIONAL FOOTER LICENSE BAR ===
      const footerMargin = 30;
      const footerY = 22;
      const lineY = footerY + 14;
      const footerFontSize = 7.5;

      // Draw a thin separator line above the footer
      page.drawLine({
        start: { x: footerMargin, y: lineY },
        end: { x: width - footerMargin, y: lineY },
        thickness: 0.5,
        color: rgb(0.75, 0.75, 0.75),
        opacity: 0.8,
      });

      // Footer text parts
      const copyrightText = '© 2026 Lurnexa Publications.';
      const licenseText = ' This work is licensed under Lurnexa Publications — Global Journal for Progressive Innovation & Research (GJPIR).';
      const rightsText = ' All rights reserved.';

      // Draw copyright in bold
      const copyrightWidth = footerFontBold.widthOfTextAtSize(copyrightText, footerFontSize);
      page.drawText(copyrightText, {
        x: footerMargin,
        y: footerY,
        size: footerFontSize,
        font: footerFontBold,
        color: rgb(0.3, 0.3, 0.3),
      });

      // Draw license text in regular
      const licenseWidth = footerFont.widthOfTextAtSize(licenseText, footerFontSize);
      page.drawText(licenseText, {
        x: footerMargin + copyrightWidth,
        y: footerY,
        size: footerFontSize,
        font: footerFont,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Draw "All rights reserved." in bold
      page.drawText(rightsText, {
        x: footerMargin + copyrightWidth + licenseWidth,
        y: footerY,
        size: footerFontSize,
        font: footerFontBold,
        color: rgb(0.3, 0.3, 0.3),
      });
    }

    // Serialize the watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();

    // Extract filename for the download
    const filename = path.basename(normalizedPath);

    return new NextResponse(Buffer.from(watermarkedPdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': watermarkedPdfBytes.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error watermarking PDF:', error);
    return NextResponse.json({ error: 'Failed to process PDF' }, { status: 500 });
  }
}
