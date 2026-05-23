import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-provider-ini";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const REGION = "ap-south-1";
const BUCKET_NAME = "lurnexa";

const s3 = new S3Client({
  region: REGION,
  credentials: fromIni(),
});

/**
 * Uploads an image to S3 and returns its URL
 */
async function uploadImageToS3(filePath, folder = "editorial_board_photos") {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }

  const fileExt = path.extname(filePath);
  const fileName = crypto.randomUUID(); // safer than manual uuid
  const key = `${folder}/${fileName}${fileExt}`;

  const fileStream = fs.createReadStream(filePath);

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: "image/*", // adjust if png/webp
      })
    );
  } catch (err) {
    throw new Error(`S3 upload failed: ${err}`);
  }

  const url = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
  return url;
}

(async () => {
  try {
    const url = await uploadImageToS3("ceo.jpg");
    console.log("Image URL:", url);
  } catch (err) {
    console.error(err);
  }
})();