import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function getConfig() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    throw new Error("Cloudflare R2 is not configured. See SETUP.md.");
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

// Cached across invocations like src/lib/prisma.ts's client, so we don't rebuild the S3 client per request.
let client: S3Client | undefined;

function getClient({
  accountId,
  accessKeyId,
  secretAccessKey,
}: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
}) {
  client ??= new S3Client({
    region: "auto",
    // R2's S3-compatible endpoint — see https://developers.cloudflare.com/r2/api/s3/api/.
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

// Uploads a generated thumbnail image to R2 (server-only — credentials never reach the client) and
// returns its public URL. The bucket must be configured for public access (r2.dev or a custom
// domain) since thumbnails are rendered client-side with a plain <img>.
export async function uploadThumbnailImage({
  userId,
  data,
  contentType,
}: {
  userId: string;
  data: Buffer;
  contentType: string;
}): Promise<string> {
  const config = getConfig();
  const extension = EXTENSION_BY_CONTENT_TYPE[contentType] ?? "png";
  // Random, non-guessable key — the bucket is publicly readable, so this is the only access control.
  const key = `thumbnails/${userId}/${randomUUID()}.${extension}`;

  await getClient(config).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    }),
  );

  return `${config.publicBaseUrl.replace(/\/$/, "")}/${key}`;
}
