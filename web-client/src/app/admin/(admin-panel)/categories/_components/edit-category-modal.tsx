"use client";

import { adminService, CategoryResponse } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { CheckCircle, Loader2, X } from "lucide-react";
import { useState } from "react";

interface Props {
  category: CategoryResponse;
  onClose: () => void;
  onUpdated?: () => void;
}

const EditCategoryForm: React.FC<Props> = ({
  category,
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState(category.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category.image || null,
  );
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { getToken } = useAuth();

  const handleSubmit = async () => {
    if (loading) return;

    if (!name.trim()) {
      setNameError("Vui lòng nhập tên danh mục.");
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Không có token xác thực.");
      }

      let finalImageMinioUrl = category.image;

      // If user uploaded a new image
      if (imageFile) {
        const signedUrlResponse = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: imageFile.name,
            contentType: imageFile.type,
            folder: "categories",
          }),
        });

        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse
            .json()
            .catch(() => null);
          throw new Error(
            errorData?.error ||
              "Không thể lấy URL tải lên từ máy chủ.",
          );
        }

        const { url: signedUrl, publicUrl } =
          await signedUrlResponse.json();
        if (!signedUrl || !publicUrl) {
          throw new Error("Không nhận được URL hợp lệ từ máy chủ.");
        }

        finalImageMinioUrl = publicUrl;

        const minioUploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: imageFile,
          headers: {
            "Content-Type": imageFile.type,
          },
        });

        if (!minioUploadResponse.ok) {
          throw new Error(
            `Tải ảnh lên lưu trữ thất bại: ${minioUploadResponse.statusText}`,
          );
        }
      }

      // Update category
      await adminService.Category.updateCategory(token, category.id, {
        name: name.trim(),
        image: finalImageMinioUrl,
      });

      setSuccess(true);

      if (onUpdated) {
        onUpdated();
      }

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Đã xảy ra lỗi không xác định.";
      setServerError(errorMessage);
      console.error("Error in updateCategory:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl overflow-hidden">
      {/* Modal Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/70">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Chỉnh Sửa Danh Mục
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cập nhật tên và hình ảnh đại diện cho danh mục
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng hộp thoại"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-5 overflow-y-auto flex-1">
        {success && (
          <div
            className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium animate-fade-in"
            role="status"
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Cập nhật danh mục thành công! Đang đóng...</span>
          </div>
        )}

        {serverError && (
          <div
            className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium animate-fade-in"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <FormField
          label="Tên danh mục"
          description="Tên danh mục hiển thị trên hệ thống"
          error={nameError}
          required
        >
          <Input
            id="editCategoryName"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) setNameError(null);
            }}
            placeholder="Ví dụ: Trà sữa, Cà phê"
            disabled={loading}
            className="h-10 rounded-xl"
          />
        </FormField>

        <FileUpload
          label="Hình ảnh danh mục"
          description="Tải ảnh mới nếu muốn thay thế ảnh hiện tại (tối đa 2MB)"
          value={imagePreview}
          onChange={(file, preview) => {
            setImageFile(file);
            setImagePreview(preview);
            setServerError(null);
          }}
          maxSizeMB={2}
          isUploading={loading}
          disabled={loading}
        />
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t border-border/70 bg-muted/20">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || success || !name.trim()}
          className="font-semibold shadow-2xs min-w-32"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Đang lưu...
            </>
          ) : (
            "Lưu Thay Đổi"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditCategoryForm;
