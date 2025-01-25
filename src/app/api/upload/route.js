import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto", // R2 uses "auto" as the region
  endpoint:
    "https://2ec066eb0b9603465f67c7b83dacb00c.r2.cloudflarestorage.com/9071743513",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY, // Store in .env
    secretAccessKey: process.env.R2_SECRET_KEY, // Store in .env
  },
});

export async function POST(req) {
  try {
    const { fileName, fileType } = await req.json();
    const bucketName = process.env.R2_SECRET_KEY;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
      ACL: "public-read", // Optional: Make the file publicly accessible
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    }); // Expires in 1 hour

    return Response.json({ url: signedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return Response.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
