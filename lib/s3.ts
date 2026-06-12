import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types";
import { pipeline } from "stream/promises";

const REGION = "ap-south-1";
const BUCKET_NAME = "lurnexa";

const s3Config: any = {
  region: REGION,
};

const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || process.env.MY_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || process.env.MY_AWS_SECRET_ACCESS_KEY;
const sessionToken = process.env.AWS_SESSION_TOKEN || process.env.S3_SESSION_TOKEN || process.env.MY_AWS_SESSION_TOKEN;

if (accessKeyId && secretAccessKey) {
  s3Config.credentials = {
    accessKeyId,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {}),
  };
}

export const s3 = new S3Client(s3Config);

/* =========================
   UPLOAD FILE
========================= */
export async function uploadFileToS3(
  filePath: string,
  id: string,
  folder = "editorial_board_photos"
) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }

  const ext = path.extname(filePath);
  const key = `${folder}/${id}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fs.createReadStream(filePath),
    ContentType: mime.lookup(filePath) || "application/octet-stream",
  });

  await s3.send(command);

  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

/* =========================
   DOWNLOAD FILE
========================= */
export async function downloadFileFromS3(
  folder: string,
  fileName: string,
  downloadDir = "./downloads"
) {
  fs.mkdirSync(downloadDir, { recursive: true });

  const localPath = path.join(downloadDir, fileName);

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${folder}/${fileName}`,
  });

  const response = await s3.send(command);

  await pipeline(
    response.Body as NodeJS.ReadableStream,
    fs.createWriteStream(localPath)
  );

  return localPath;
}
