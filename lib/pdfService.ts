// @ts-ignore
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Caches for font buffers to prevent reading files on every generation
let cachedRegularBuffer: Buffer | null = null;
let cachedBoldBuffer: Buffer | null = null;
let customFontsLoaded = false;

async function getFontBuffer(name: string, url: string): Promise<Buffer> {
  if (name === "Roboto-Regular.ttf" && cachedRegularBuffer) return cachedRegularBuffer;
  if (name === "Roboto-Bold.ttf" && cachedBoldBuffer) return cachedBoldBuffer;

  const tmpDir = typeof process !== 'undefined' && process.env.AWS_LAMBDA_FUNCTION_NAME 
    ? "/tmp" 
    : path.join(process.cwd(), "scratch");
  
  if (!fs.existsSync(tmpDir)) {
    try {
      fs.mkdirSync(tmpDir, { recursive: true });
    } catch (e) {}
  }

  const cachePath = path.join(tmpDir, name);
  if (fs.existsSync(cachePath)) {
    try {
      const buffer = fs.readFileSync(cachePath);
      if (name === "Roboto-Regular.ttf") cachedRegularBuffer = buffer;
      if (name === "Roboto-Bold.ttf") cachedBoldBuffer = buffer;
      return buffer;
    } catch (err) {
      console.error(`Failed to read cached font ${name}:`, err);
    }
  }

  // Explicit static file references to force Next.js build-time asset tracing
  const regularStaticPath = path.join(process.cwd(), "lib/fonts/Roboto-Regular.ttf");
  const boldStaticPath = path.join(process.cwd(), "lib/fonts/Roboto-Bold.ttf");

  if (name === "Roboto-Regular.ttf" && fs.existsSync(regularStaticPath)) {
    try {
      const buffer = fs.readFileSync(regularStaticPath);
      cachedRegularBuffer = buffer;
      return buffer;
    } catch (e) {}
  }
  if (name === "Roboto-Bold.ttf" && fs.existsSync(boldStaticPath)) {
    try {
      const buffer = fs.readFileSync(boldStaticPath);
      cachedBoldBuffer = buffer;
      return buffer;
    } catch (e) {}
  }

  // Also check public/fonts or root folder
  const localPath = path.join(process.cwd(), "public", "fonts", name);
  if (fs.existsSync(localPath)) {
    try {
      const buffer = fs.readFileSync(localPath);
      if (name === "Roboto-Regular.ttf") cachedRegularBuffer = buffer;
      if (name === "Roboto-Bold.ttf") cachedBoldBuffer = buffer;
      return buffer;
    } catch (err) {
      console.error(`Failed to read local font ${name}:`, err);
    }
  }

  // Fallback to fetch
  console.log(`Downloading font ${name} from ${url}...`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download font ${name} from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  try {
    fs.writeFileSync(cachePath, buffer);
  } catch (err) {
    console.error(`Failed to write cache font ${name}:`, err);
  }

  if (name === "Roboto-Regular.ttf") cachedRegularBuffer = buffer;
  if (name === "Roboto-Bold.ttf") cachedBoldBuffer = buffer;
  return buffer;
}

async function registerCustomFonts(doc: any) {
  try {
    const regularBuffer = await getFontBuffer(
      "Roboto-Regular.ttf",
      "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Regular.ttf"
    );
    const boldBuffer = await getFontBuffer(
      "Roboto-Bold.ttf",
      "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Bold.ttf"
    );

    doc.registerFont("Roboto-Regular", regularBuffer);
    doc.registerFont("Roboto-Bold", boldBuffer);
    customFontsLoaded = true;
  } catch (err) {
    console.error("❌ Failed to register custom fonts, falling back to Helvetica:", err);
    customFontsLoaded = false;
  }
}

function getFont(isBold: boolean): string {
  if (customFontsLoaded) {
    return isBold ? "Roboto-Bold" : "Roboto-Regular";
  }
  return isBold ? "Helvetica-Bold" : "Helvetica";
}

function ensureStandardFonts() {
  const fonts = ["Helvetica.afm", "Helvetica-Bold.afm"];
  const destDirs = [
    path.resolve(".next/dev/server/vendor-chunks/data"),
    path.resolve(".next/server/vendor-chunks/data"),
    path.resolve(".next/server/chunks/data"),
    path.resolve(".next/server/pages/data"),
  ];

  for (const font of fonts) {
    const sourcePath = path.resolve("node_modules/pdfkit/js/data", font);
    if (!fs.existsSync(sourcePath)) continue;

    for (const destDir of destDirs) {
      try {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        const destPath = path.join(destDir, font);
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(sourcePath, destPath);
        }
      } catch (err) {
        // ignore errors writing to non-existent or read-only directories
      }
    }
  }
}

interface QuotationItem {
  book_name: string;
  quantity: number;
}

interface QuotationRequestData {
  id: string;
  institution_name: string;
  authorized_person: string;
  contact_number: string;
  email: string;
  created_at: string;
  items: QuotationItem[];
}

export async function generateQuotationRequestPdf(data: QuotationRequestData): Promise<Buffer> {
  // Ensure standard fonts are copied into the bundle folder (legacy fallback)
  ensureStandardFonts();

  const defaultFontPath = path.join(process.cwd(), "lib/fonts/Roboto-Regular.ttf");
  // @ts-ignore
  const doc = new PDFDocument({ 
    margin: 50, 
    size: "A4",
    font: fs.existsSync(defaultFontPath) ? defaultFontPath : undefined
  });
  await registerCustomFonts(doc);

  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: any) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: any) => reject(err));

      // Header
      doc
        .fillColor("#000000")
        .fontSize(22)
        .font(getFont(true))
        .text("Book Quotation Request", { align: "center" });

      doc
        .fontSize(10)
        .font(getFont(false))
        .text(`Reference ID: ${data.id}`, { align: "center" });

      doc.moveDown(1);
      
      // Horizontal Line
      doc
        .strokeColor("#000000")
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(1.5);

      // Client Details Section
      doc.fontSize(14).font(getFont(true)).text("Client Details");
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1Width = 150;
      const rowHeight = 22;

      const details = [
        ["Institution Name", data.institution_name],
        ["Authorized Person", data.authorized_person],
        ["Contact Number", data.contact_number],
        ["Email Address", data.email],
        ["Date Requested", data.created_at],
      ];

      details.forEach((row, index) => {
        const y = tableTop + index * rowHeight;
        
        doc
          .rect(50, y, col1Width, rowHeight)
          .stroke();
        doc
          .rect(50 + col1Width, y, 495 - col1Width, rowHeight)
          .stroke();

        doc
          .font(getFont(true))
          .fontSize(10)
          .text(row[0], 55, y + 6);

        doc
          .font(getFont(false))
          .fontSize(10)
          .text(row[1], 55 + col1Width, y + 6);
      });

      doc.moveDown(2.5);

      // Requested Books Section
      doc.fontSize(14).font(getFont(true)).text("Requested Books");
      doc.moveDown(0.5);

      const booksTableTop = doc.y;
      const bookColWidth = 350;
      const qtyColWidth = 145;

      doc
        .rect(50, booksTableTop, bookColWidth, rowHeight)
        .fillAndStroke("#000000", "#000000");
      doc
        .rect(50 + bookColWidth, booksTableTop, qtyColWidth, rowHeight)
        .fillAndStroke("#000000", "#000000");

      doc
        .fillColor("#ffffff")
        .font(getFont(true))
        .fontSize(10)
        .text("Book Name", 55, booksTableTop + 6)
        .text("Quantity", 55 + bookColWidth, booksTableTop + 6);

      doc.fillColor("#000000");

      data.items.forEach((item, index) => {
        const y = booksTableTop + (index + 1) * rowHeight;

        doc
          .rect(50, y, bookColWidth, rowHeight)
          .stroke();
        doc
          .rect(50 + bookColWidth, y, qtyColWidth, rowHeight)
          .stroke();

        doc
          .font(getFont(false))
          .fontSize(10)
          .text(item.book_name, 55, y + 6);

        doc
          .font(getFont(false))
          .fontSize(10)
          .text(item.quantity.toString(), 55 + bookColWidth, y + 6);
      });

      const footerY = Math.max(doc.y + 50, 720);
      doc
        .fontSize(10)
        .font(getFont(false))
        .text("Generated by Book Quotation System", 50, footerY, {
          align: "center",
          width: 495,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

interface QuotationItemDetails {
  book_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ClientQuotationData {
  quotation_number: string;
  created_at: string;
  valid_until: string;
  institution_name: string;
  authorized_person: string;
  email: string;
  contact_number: string;
  items: QuotationItemDetails[];
  total_amount: number;
  is_confirmed_letter?: boolean;
  client_stamp?: string | null;
}

export async function generateClientQuotationPdf(data: ClientQuotationData): Promise<Buffer> {
  // Try to find the stamped signature image
  let sigImgPath = path.join(process.cwd(), "Book Quotation", "static", "img", "stamped_signature.png");
  if (!fs.existsSync(sigImgPath)) {
    sigImgPath = path.join(process.cwd(), "public", "img", "stamped_signature.png");
  }

  // Fetch client stamp if it's a URL or path
  let clientStampBuffer: Buffer | null = null;
  if (data.is_confirmed_letter && data.client_stamp) {
    try {
      if (data.client_stamp.startsWith("http")) {
        const res = await fetch(data.client_stamp);
        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          clientStampBuffer = Buffer.from(arrayBuffer);
        }
      } else if (fs.existsSync(data.client_stamp)) {
        clientStampBuffer = fs.readFileSync(data.client_stamp);
      } else {
        // Try relative path
        const relativePath = path.join(process.cwd(), "public", data.client_stamp);
        if (fs.existsSync(relativePath)) {
          clientStampBuffer = fs.readFileSync(relativePath);
        }
      }
    } catch (err) {
      console.error("❌ Error loading client stamp image:", err);
    }
  }

  const defaultFontPath = path.join(process.cwd(), "lib/fonts/Roboto-Regular.ttf");
  // @ts-ignore
  const doc = new PDFDocument({ 
    margin: 50, 
    size: "A4",
    font: fs.existsSync(defaultFontPath) ? defaultFontPath : undefined
  });
  await registerCustomFonts(doc);

  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: any) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err: any) => reject(err));

      // 1. Company Name
      doc
        .fillColor("#000000")
        .fontSize(16)
        .font(getFont(true))
        .text("LURNEXA PUBLICATIONS", { align: "center" });

      doc
        .fontSize(13)
        .font(getFont(true))
        .text(data.is_confirmed_letter ? "CONFIRMED QUOTATION" : "FORMAL QUOTATION", {
          align: "center",
        });

      doc.moveDown(0.2);
      
      // Divider
      doc
        .strokeColor("#000000")
        .lineWidth(1.5)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.8);

      // Quote details at top right
      const rightAlignY = doc.y;
      doc
        .fontSize(10)
        .font(getFont(false))
        .text(`Quote No: ${data.quotation_number}`, 350, rightAlignY, { align: "right", width: 195 })
        .text(`Date: ${data.created_at}`, 350, rightAlignY + 14, { align: "right", width: 195 })
        .text(`Valid Until: ${data.valid_until}`, 350, rightAlignY + 28, { align: "right", width: 195 });

      // Address blocks (To/From depending on is_confirmed_letter) - starts below "Valid Until" line
      const addressesStartY = rightAlignY + 48;
      doc.text("", 50, addressesStartY); // reset x
      
      const companyDetails = [
        "Lurnexa Publications",
        "Door No. 8-135, Ramulavari Gudi Center,",
        "Near Panchayati Office Gorantla, Gorantla, Guntur",
        "522034 Andhra Pradesh, India",
        "Phone: +91-93478 34904",
      ];

      const clientDetails = [
        `Institution Name: ${data.institution_name}`,
        `Contact Name: ${data.authorized_person}`,
        `Email Address: ${data.email}`,
        `Phone Number: ${data.contact_number}`,
      ];

      if (data.is_confirmed_letter) {
        // From Client
        doc.fontSize(11).font(getFont(true)).text("FROM:", 50, addressesStartY);
        doc.fontSize(9).font(getFont(false));
        clientDetails.forEach((line, i) => {
          doc.text(line, 50, addressesStartY + 15 + i * 13);
        });

        // To Company
        const toY = addressesStartY + 80;
        doc.fontSize(11).font(getFont(true)).text("TO:", 50, toY);
        doc.fontSize(9).font(getFont(false));
        companyDetails.forEach((line, i) => {
          doc.text(line, 50, toY + 15 + i * 13);
        });

        doc.y = toY + 15 + companyDetails.length * 13;
        doc.moveDown(1.5);
      } else {
        // From Company
        doc.fontSize(11).font(getFont(true)).text("FROM:", 50, addressesStartY);
        doc.fontSize(9).font(getFont(false));
        companyDetails.forEach((line, i) => {
          doc.text(line, 50, addressesStartY + 15 + i * 13);
        });

        // To Client
        const toY = addressesStartY + 95;
        doc.fontSize(11).font(getFont(true)).text("TO:", 50, toY);
        doc.fontSize(9).font(getFont(false));
        clientDetails.forEach((line, i) => {
          doc.text(line, 50, toY + 15 + i * 13);
        });

        doc.y = toY + 15 + clientDetails.length * 13;
        doc.moveDown(1.5);
      }

      // 2. Items Table
      doc.fontSize(11).font(getFont(true)).text("Items Breakdown", 50, doc.y);
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const rowHeight = 22;
      const cols = [
        { title: "Sl.No", width: 40, align: "center" },
        { title: "Book Name", width: 225, align: "left" },
        { title: "No. of Copies", width: 75, align: "center" },
        { title: "Unit Price (Rs.)", width: 75, align: "right" },
        { title: "Total Price (Rs.)", width: 80, align: "right" },
      ];

      // Draw table headers
      let currentX = 50;
      cols.forEach((col) => {
        doc
          .rect(currentX, tableTop, col.width, rowHeight)
          .stroke();
        doc
          .font(getFont(true))
          .fontSize(9)
          .text(
            col.title,
            currentX + 5,
            tableTop + 6,
            { width: col.width - 10, align: col.align }
          );
        currentX += col.width;
      });

      doc.fillColor("#000000");

      data.items.forEach((item, index) => {
        const y = tableTop + (index + 1) * rowHeight;
        let cellX = 50;

        const cells = [
          (index + 1).toString(),
          item.book_name,
          item.quantity.toString(),
          Number(item.unit_price).toFixed(2),
          Number(item.total_price).toFixed(2),
        ];

        cells.forEach((cellText, colIndex) => {
          const col = cols[colIndex];
          doc
            .rect(cellX, y, col.width, rowHeight)
            .stroke();
          doc
            .font(getFont(false))
            .fontSize(9)
            .text(
              cellText,
              cellX + 5,
              y + 6,
              { width: col.width - 10, align: col.align }
            );
          cellX += col.width;
        });
      });

      // Total Row
      const totalY = tableTop + (data.items.length + 1) * rowHeight;
      doc
        .rect(50, totalY, 415, rowHeight)
        .stroke();
      doc
        .rect(465, totalY, 80, rowHeight)
        .stroke();

      doc
        .font(getFont(true))
        .fontSize(9)
        .text("Total Amount:", 55, totalY + 6, { width: 405, align: "right" });

      doc
        .text(`Rs. ${Number(data.total_amount).toFixed(2)}`, 470, totalY + 6, {
          width: 70,
          align: "right",
        });

      // Signatures Area
      const sigsY = Math.max(doc.y + 60, 670);
      
      // Draw signature labels/lines
      doc
        .strokeColor("#000000")
        .lineWidth(0.5);

      if (data.is_confirmed_letter && clientStampBuffer) {
        try {
          doc.image(clientStampBuffer, 80, sigsY - 60, { width: 120, height: 50 });
        } catch (imgErr) {
          console.error("Failed to place client stamp image:", imgErr);
        }
        doc.moveTo(60, sigsY).lineTo(220, sigsY).stroke();
        doc
          .font(getFont(true))
          .fontSize(9)
          .text("Client Signature/Stamp", 60, sigsY + 5, { align: "center", width: 160 });
      }

      if (fs.existsSync(sigImgPath)) {
        try {
          doc.image(sigImgPath, 370, sigsY - 60, { width: 120, height: 50 });
        } catch (imgErr) {
          console.error("Failed to place authorized signature image:", imgErr);
        }
      }
      doc.moveTo(350, sigsY).lineTo(510, sigsY).stroke();
      doc
        .font(getFont(true))
        .fontSize(9)
        .text("Authorized Signature", 350, sigsY + 5, { align: "center", width: 160 });

      // Footer notice
      doc
        .fontSize(9)
        .font(getFont(false))
        .fillColor("#6b7280")
        .text(
          "Thank you for your business. If you have any questions concerning this quotation, please contact us.",
          50,
          740,
          { align: "center", width: 495 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
