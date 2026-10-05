import { authenticatedActor } from "@/lib/server/media-auth";
import {
  allowedFolder,
  createUploadGrant,
  imageMatchesType,
  imageType,
  MAX_IMAGE_BYTES,
  mediaConfig,
  publicMediaUrl,
  verifyUploadGrant,
} from "@/lib/server/media-storage";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const actor = await authenticatedActor(req);
  if (!actor)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  let storage;
  try {
    storage = mediaConfig();
  } catch {
    return NextResponse.json(
      { error: "Storage configuration error" },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const folder = String(body.folder || "");
  const fileName = String(body.fileName || "");
  const type = imageType(
    String(body.fileType || body.contentType || ""),
  );
  if (!allowedFolder(actor.role, folder))
    return NextResponse.json(
      { error: "Folder is not allowed" },
      { status: 403 },
    );
  if (!type || !fileName || fileName.length > 255)
    return NextResponse.json(
      { error: "Invalid image type or name" },
      { status: 400 },
    );
  const grant = createUploadGrant(
    actor.id,
    folder,
    fileName,
    type,
    storage.secretKey,
  );
  if (!grant)
    return NextResponse.json(
      { error: "Image extension does not match content type" },
      { status: 400 },
    );

  const query = new URLSearchParams({
    key: grant.key,
    type,
    expires: String(grant.expires),
    signature: grant.signature,
  });
  return NextResponse.json({
    url: `/api/media/upload?${query}`,
    publicUrl: publicMediaUrl(
      storage.publicEndpoint,
      storage.bucket,
      grant.key,
    ),
    fileName: grant.key.split("/").pop(),
    expiresInSeconds: 900,
  });
}

export async function PUT(req: Request) {
  const actor = await authenticatedActor(req);
  if (!actor)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  let storage;
  try {
    storage = mediaConfig();
  } catch {
    return NextResponse.json(
      { error: "Storage configuration error" },
      { status: 503 },
    );
  }

  const params = new URL(req.url).searchParams;
  const key = params.get("key") || "";
  const type = imageType(params.get("type") || "");
  const expires = Number(params.get("expires"));
  const signature = params.get("signature") || "";
  const segments = key.split("/");
  const folder = segments[0];
  if (
    !type ||
    !allowedFolder(actor.role, folder) ||
    segments.length !== 3 ||
    segments[1] !== encodeURIComponent(actor.id) ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/.test(
      segments[2],
    ) ||
    !verifyUploadGrant(
      actor.id,
      key,
      type,
      expires,
      signature,
      storage.secretKey,
    )
  )
    return NextResponse.json(
      { error: "Invalid or expired upload URL" },
      { status: 403 },
    );
  if (req.headers.get("content-type")?.split(";")[0] !== type)
    return NextResponse.json(
      { error: "Content type mismatch" },
      { status: 400 },
    );
  const length = Number(req.headers.get("content-length"));
  if (length > MAX_IMAGE_BYTES)
    return NextResponse.json(
      { error: "Image exceeds 5 MB" },
      { status: 413 },
    );
  const reader = req.body?.getReader();
  if (!reader)
    return NextResponse.json(
      { error: "Missing image" },
      { status: 400 },
    );
  const chunks: Buffer[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_IMAGE_BYTES) {
      await reader.cancel();
      return NextResponse.json(
        { error: "Image exceeds 5 MB" },
        { status: 413 },
      );
    }
    chunks.push(Buffer.from(value));
  }
  const bytes = Buffer.concat(chunks);
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES)
    return NextResponse.json(
      { error: "Invalid image size" },
      { status: 413 },
    );
  if (!imageMatchesType(bytes, type))
    return NextResponse.json(
      { error: "Image content does not match type" },
      { status: 400 },
    );

  try {
    await storage.client.putObject(
      storage.bucket,
      key,
      bytes,
      bytes.length,
      { "Content-Type": type },
    );
    return NextResponse.json({
      publicUrl: publicMediaUrl(
        storage.publicEndpoint,
        storage.bucket,
        key,
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "MinIO upload failed" },
      { status: 502 },
    );
  }
}
