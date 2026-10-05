import { authenticatedActor } from "@/lib/server/media-auth";
import {
  keyFromPublicUrl,
  mediaConfig,
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
  if (
    !["admin", "super_admin", "administrator"].includes(actor.role)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
  const raw = body.urls ?? body.files ?? body.url ?? body.file;
  const items: unknown[] = Array.isArray(raw) ? raw : [raw];
  if (
    !items.length ||
    items.length > 50 ||
    items.some((item) => typeof item !== "string")
  ) {
    return NextResponse.json(
      { error: "Provide 1 to 50 file URLs" },
      { status: 400 },
    );
  }
  const keys = items.map((item) =>
    keyFromPublicUrl(
      item as string,
      storage.publicEndpoint,
      storage.bucket,
    ),
  );
  if (keys.some((key) => !key))
    return NextResponse.json(
      { error: "Invalid MinIO file URL" },
      { status: 400 },
    );

  let deletedCount = 0;
  const errors: string[] = [];
  for (const key of keys as string[]) {
    try {
      await storage.client.removeObject(storage.bucket, key);
      deletedCount++;
    } catch {
      errors.push(key);
    }
  }
  if (errors.length)
    return NextResponse.json(
      { success: false, deletedCount, errors },
      { status: 502 },
    );
  return NextResponse.json({ success: true, deletedCount });
}
