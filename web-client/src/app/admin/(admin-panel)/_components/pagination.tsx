import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  pageSizeOptions?: number[];
  selectedCount?: number;
  totalItems?: number;
}

/**
 * Component hiển thị phân trang chuẩn hóa cho Admin & Owner.
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  selectedCount,
  totalItems,
}) => {
  const safeTotalPages = Math.max(1, totalPages || 1);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/60 text-sm">
      {/* Page Size & Selected Items info */}
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span>Hiển thị</span>
          <select
            title="Số hàng mỗi trang"
            aria-label="Chọn số hàng hiển thị trên mỗi trang"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>mục/trang</span>
        </div>

        {totalItems !== undefined && (
          <span className="hidden md:inline text-muted-foreground">
            (Tổng cộng:{" "}
            <strong className="text-foreground">{totalItems}</strong>{" "}
            mục)
          </span>
        )}

        {selectedCount !== undefined && selectedCount > 0 && (
          <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            Đã chọn: {selectedCount}
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Trang trước"
          className="h-8 px-3 gap-1"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        <span className="text-xs sm:text-sm font-medium px-2 text-foreground">
          Trang{" "}
          <strong className="font-semibold">{currentPage}</strong> /{" "}
          {safeTotalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= safeTotalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Trang sau"
          className="h-8 px-3 gap-1"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
