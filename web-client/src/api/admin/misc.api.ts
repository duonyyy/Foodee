import { apiRequest } from "../base-api";

interface RoleResponse {
  role: string;
  permissions: string[];
}

export const getMyRole = (token?: string): Promise<RoleResponse> =>
  apiRequest<RoleResponse>("/role/user-role-and-permission", "GET", {
    token,
  });

export const uploadCoverImage = async (
  token?: string,
  imageFile?: File,
): Promise<{ imageUrl: string }> => {
  const minioRes = await fetch("/api/media/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      fileName: imageFile?.name,
      fileType: imageFile?.type,
      folder: "blog-covers",
      isPublic: true,
    }),
  });

  if (!minioRes.ok) {
    const errorData = await minioRes.json().catch(() => ({}));
    throw new Error(
      errorData.error || "Failed to get signed upload URL",
    );
  }

  const { url, publicUrl } = await minioRes.json();
  const uploadHeaders: Record<string, string> = {
    "Content-Type": imageFile?.type ?? "",
  };

  const uploadRes = await fetch(url, {
    method: "PUT",
    headers: {
      ...uploadHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: imageFile,
  });
  if (!uploadRes.ok)
    throw new Error("Failed to upload image to storage");

  return { imageUrl: publicUrl };
};
