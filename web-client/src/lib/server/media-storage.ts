import { Client } from "minio";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const UPLOAD_LIFETIME_MS = 15 * 60 * 1000;

export type ImageType = "image/jpeg" | "image/png" | "image/webp";
export type MediaFolder =
  | "user-avatars"
  | "food-images"
  | "promotion-images"
  | "categories"
  | "blog-covers";

const EXTENSIONS: Record<ImageType, readonly string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
};

export function mediaConfig() {
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;
  const publicEndpoint = process.env.MINIO_PUBLIC_ENDPOINT?.replace(
    /\/+$/,
    "",
  );
  if (!accessKey || !secretKey || !bucket || !publicEndpoint) {
    throw new Error("MinIO configuration is incomplete");
  }
  const port = Number(process.env.MINIO_PORT || 9000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid MinIO port");
  }
  return {
    bucket,
    publicEndpoint,
    secretKey,
    client: new Client({
      endPoint: process.env.MINIO_ENDPOINT || "localhost",
      port,
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey,
      secretKey,
    }),
  };
}

export function imageType(value: string): ImageType | null {
  return Object.prototype.hasOwnProperty.call(EXTENSIONS, value)
    ? (value as ImageType)
    : null;
}

export function imageMatchesType(
  bytes: Buffer,
  type: ImageType,
): boolean {
  if (type === "image/jpeg")
    return (
      bytes.length >= 3 &&
      bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))
    );
  if (type === "image/png")
    return (
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(
          Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
          ]),
        )
    );
  return (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}

export function allowedFolder(
  role: string,
  folder: string,
): folder is MediaFolder {
  const normalized = role.toLowerCase();
  if (
    ["admin", "super_admin", "administrator"].includes(normalized)
  ) {
    return [
      "user-avatars",
      "food-images",
      "promotion-images",
      "categories",
      "blog-covers",
    ].includes(folder);
  }
  if (["merchant", "owner"].includes(normalized))
    return folder === "food-images" || folder === "user-avatars";
  if (["user", "customer", "shipper"].includes(normalized))
    return folder === "user-avatars";
  return false;
}

export function createUploadGrant(
  userId: string,
  folder: MediaFolder,
  fileName: string,
  type: ImageType,
  secret: string,
) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension || !EXTENSIONS[type].includes(extension))
    return null;
  const key = `${folder}/${encodeURIComponent(userId)}/${randomUUID()}.${extension === "jpeg" ? "jpg" : extension}`;
  const expires = Date.now() + UPLOAD_LIFETIME_MS;
  const payload = `${userId}\n${key}\n${type}\n${expires}`;
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return { key, expires, signature };
}

export function verifyUploadGrant(
  userId: string,
  key: string,
  type: ImageType,
  expires: number,
  signature: string,
  secret: string,
): boolean {
  if (
    !Number.isSafeInteger(expires) ||
    expires <= Date.now() ||
    expires > Date.now() + UPLOAD_LIFETIME_MS
  )
    return false;
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  const payload = `${userId}\n${key}\n${type}\n${expires}`;
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function publicMediaUrl(
  endpoint: string,
  bucket: string,
  key: string,
): string {
  return `${endpoint}/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function keyFromPublicUrl(
  input: string,
  endpoint: string,
  bucket: string,
): string | null {
  try {
    const base = new URL(`${endpoint}/${bucket}/`);
    const url = new URL(input);
    if (
      url.origin !== base.origin ||
      !url.pathname.startsWith(base.pathname) ||
      url.search ||
      url.hash
    )
      return null;
    const key = decodeURIComponent(
      url.pathname.slice(base.pathname.length),
    );
    return /^(user-avatars|food-images|promotion-images|categories|blog-covers)\/[^/]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(
      key,
    )
      ? key
      : null;
  } catch {
    return null;
  }
}
