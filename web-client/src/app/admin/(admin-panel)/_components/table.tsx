import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EmptyState,
  ErrorState,
} from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  MoreVertical,
} from "lucide-react";
import { ReactNode, useState } from "react";

type SortDirection = "asc" | "desc" | null;

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  sortable?: boolean;
  renderCell?: (value: unknown, row: T) => ReactNode;
}

interface Action {
  label: string;
  onClick: (id: string) => void;
  icon?: ReactNode;
  variant?: "default" | "destructive";
  isDangerous?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface TableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  renderRow?: (row: T, index: number) => ReactNode;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectItem?: (id: string, isSelected: boolean) => void;
  onSelectAll?: (isSelected: boolean) => void;
  showActions?: boolean;
  actions?: Action[];
  coloredStatus?: boolean;
  onSort?: (field: keyof T, direction: SortDirection) => void;
  sortField?: keyof T | null;
  sortDirection?: SortDirection;
  // Phase 4 additions
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  error?: string | null;
  onRetry?: () => void;
  mobileCardRender?: (row: T, index: number) => ReactNode;
}

/**
 * Component bảng dữ liệu nâng cao chuẩn hóa cho Admin & Owner.
 * Hỗ trợ:
 * - Skeleton loading state
 * - Empty state & Error state có nút Thử lại (retry)
 * - Tự động hiển thị thẻ StatusBadge chuẩn hóa
 * - Xác nhận thao tác nguy hiểm bằng AlertDialog
 * - Tự động chuyển đổi sang giao diện Card trên mobile (< 768px)
 * - Hiển thị số lượng hàng được chọn (selected count)
 */
const Table = <T extends { id: string }>({
  columns,
  data,
  renderRow,
  selectable = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  showActions = false,
  actions = [],
  coloredStatus = false,
  onSort,
  sortField: externalSortField = null,
  sortDirection: externalSortDirection = null,
  isLoading = false,
  loadingRowCount = 5,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  error = null,
  onRetry,
  mobileCardRender,
}: TableProps<T>) => {
  // Internal state for sorting if not controlled externally
  const [internalSortField, setInternalSortField] = useState<
    keyof T | null
  >(null);
  const [internalSortDirection, setInternalSortDirection] =
    useState<SortDirection>(null);
  const [sortAnimation, setSortAnimation] = useState<string | null>(
    null,
  );

  // State for dangerous action confirmation dialog
  const [pendingConfirm, setPendingConfirm] = useState<{
    action: Action;
    rowId: string;
  } | null>(null);

  // Use external sort state if provided, otherwise use internal
  const sortField =
    externalSortField !== undefined
      ? externalSortField
      : internalSortField;
  const sortDirection =
    externalSortDirection !== undefined
      ? externalSortDirection
      : internalSortDirection;

  // Handle column header click for sorting
  const handleSort = (field: keyof T) => {
    setSortAnimation(String(field));
    setTimeout(() => setSortAnimation(null), 300);

    let newDirection: SortDirection = "asc";
    if (sortField === field) {
      if (sortDirection === "asc") newDirection = "desc";
      else if (sortDirection === "desc") newDirection = null;
    }

    if (onSort) {
      onSort(field, newDirection);
    } else {
      setInternalSortField(newDirection === null ? null : field);
      setInternalSortDirection(newDirection);
    }
  };

  // Sort data if using internal sorting
  const sortedData = [...data];
  if (!onSort && sortField && sortDirection) {
    sortedData.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (
        typeof aValue === "function" ||
        typeof bValue === "function"
      ) {
        return 0;
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  // Check if all items are selected
  const allSelected =
    data.length > 0 && selectedItems.length === data.length;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const isActionDangerous = (action: Action): boolean => {
    if (action.isDangerous !== undefined) return action.isDangerous;
    if (action.variant === "destructive") return true;
    const lowerLabel = action.label.toLowerCase();
    return (
      lowerLabel.includes("xóa") ||
      lowerLabel.includes("delete") ||
      lowerLabel.includes("khóa") ||
      lowerLabel.includes("ban")
    );
  };

  const handleActionClick = (action: Action, rowId: string) => {
    if (isActionDangerous(action)) {
      setPendingConfirm({ action, rowId });
    } else {
      action.onClick(rowId);
    }
  };

  const executeConfirmAction = () => {
    if (pendingConfirm) {
      pendingConfirm.action.onClick(pendingConfirm.rowId);
      setPendingConfirm(null);
    }
  };

  // Render cell content helper
  const getCellContent = (column: Column<T>, row: T) => {
    let value: unknown;
    if (typeof column.accessor === "function") {
      value = column.accessor(row);
    } else {
      value = row[column.accessor];
    }

    if (column.renderCell) {
      return column.renderCell(value, row);
    }

    let content = <>{value as ReactNode}</>;

    // Apply StatusBadge if needed
    if (
      coloredStatus &&
      (column.header.toLowerCase().includes("status") ||
        column.header.toLowerCase().includes("trạng thái")) &&
      typeof value === "string"
    ) {
      content = <StatusBadge status={value} size="sm" />;
    }

    // Special case for User column with avatar
    if (
      column.header === "User" &&
      typeof value === "string" &&
      "email" in row
    ) {
      const email = (row as unknown as { email?: string }).email;
      content = (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://avatar.vercel.sh/${email}`}
              alt={value}
            />
            <AvatarFallback>{getInitials(value)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">
              {email}
            </div>
          </div>
        </div>
      );
    }

    return content;
  };

  // Default row rendering for desktop
  const defaultRenderRow = (row: T, index: number) => {
    const isSelected = selectedItems.includes(row.id);

    return (
      <tr
        key={row.id}
        className={`${
          isSelected
            ? "bg-primary/5"
            : index % 2 === 0
              ? "bg-card"
              : "bg-muted/30"
        } hover:bg-muted/60 transition-colors`}
      >
        {selectable && (
          <td className="w-10 px-4 py-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) =>
                onSelectItem?.(row.id, !!checked)
              }
              aria-label={`Chọn hàng ${row.id}`}
            />
          </td>
        )}

        {columns.map((column, colIndex) => (
          <td
            key={colIndex}
            className={`px-4 py-4 text-sm text-foreground ${column.className || ""}`}
          >
            {getCellContent(column, row)}
          </td>
        ))}

        {showActions && actions.length > 0 && (
          <td className="w-12 px-4 py-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Thao tác cho hàng ${row.id}`}
                  title="Thao tác"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {actions.map((action, actionIndex) => {
                  const isDestructive = isActionDangerous(action);
                  return (
                    <DropdownMenuItem
                      key={actionIndex}
                      onClick={() =>
                        handleActionClick(action, row.id)
                      }
                      className={`flex items-center gap-2 cursor-pointer ${
                        isDestructive
                          ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                          : ""
                      }`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        )}
      </tr>
    );
  };

  // Default mobile card rendering
  const defaultMobileCard = (row: T) => {
    const isSelected = selectedItems.includes(row.id);
    const primaryCol = columns[0];
    const otherCols = columns.slice(1);

    return (
      <div
        key={row.id}
        className={`p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3 transition-colors ${
          isSelected ? "ring-2 ring-primary/40 bg-primary/5" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {selectable && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onSelectItem?.(row.id, !!checked)
                }
                aria-label={`Chọn hàng ${row.id}`}
              />
            )}
            <div className="font-semibold text-foreground truncate">
              {primaryCol
                ? getCellContent(primaryCol, row)
                : `#${row.id.slice(-6)}`}
            </div>
          </div>

          {showActions && actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Thao tác cho hàng ${row.id}`}
                  title="Thao tác"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {actions.map((action, actionIndex) => (
                  <DropdownMenuItem
                    key={actionIndex}
                    onClick={() => handleActionClick(action, row.id)}
                    className={`flex items-center gap-2 cursor-pointer ${
                      isActionDangerous(action)
                        ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                        : ""
                    }`}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
          {otherCols.map((col, cIdx) => (
            <div key={cIdx} className="space-y-0.5">
              <span className="text-muted-foreground font-medium">
                {col.header}
              </span>
              <div className="text-foreground font-medium break-words">
                {getCellContent(col, row)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const displayData = onSort ? data : sortedData;

  return (
    <div className="w-full space-y-3">
      {/* Selected Items Banner */}
      {selectable && selectedItems.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs sm:text-sm text-primary font-medium animate-fade-in">
          <span>
            Đã chọn {selectedItems.length} trên tổng số {data.length}{" "}
            mục
          </span>
          <button
            type="button"
            onClick={() => onSelectAll?.(false)}
            className="hover:underline font-semibold"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      {/* Error State */}
      {error ? (
        <ErrorState
          title="Đã xảy ra lỗi khi tải dữ liệu"
          description={error}
          actionLabel={onRetry ? "Thử lại" : undefined}
          onAction={onRetry}
        />
      ) : isLoading ? (
        /* Loading Skeleton View */
        <div>
          {/* Mobile Loading Skeleton */}
          <div className="md:hidden space-y-3">
            {Array.from({ length: loadingRowCount }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border bg-card space-y-3"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-8 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Loading Skeleton Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  {selectable && (
                    <th className="w-10 px-4 py-3">
                      <Skeleton className="h-4 w-4" />
                    </th>
                  )}
                  {columns.map((c, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase"
                    >
                      {c.header}
                    </th>
                  ))}
                  {showActions && <th className="w-12 px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Array.from({ length: loadingRowCount }).map(
                  (_, rowIdx) => (
                    <tr key={rowIdx}>
                      {selectable && (
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-4" />
                        </td>
                      )}
                      {columns.map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-4">
                          <Skeleton className="h-4 w-3/4" />
                        </td>
                      ))}
                      {showActions && (
                        <td className="px-4 py-4">
                          <Skeleton className="h-4 w-4 ml-auto" />
                        </td>
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : displayData.length === 0 ? (
        /* Empty State */
        <EmptyState
          title={emptyTitle || "Không có dữ liệu"}
          description={
            emptyDescription ||
            "Không tìm thấy dữ liệu nào phù hợp với điều kiện hiển thị hiện tại."
          }
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        /* Data Available */
        <div>
          {/* Mobile Card Layout (< 768px) */}
          <div
            className="md:hidden space-y-3"
            role="region"
            aria-label="Danh sách dữ liệu dạng thẻ"
          >
            {displayData.map((row, index) =>
              mobileCardRender
                ? mobileCardRender(row, index)
                : defaultMobileCard(row),
            )}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  {selectable && (
                    <th className="w-10 px-4 py-3">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) =>
                          onSelectAll?.(!!checked)
                        }
                        aria-label="Chọn tất cả các hàng"
                      />
                    </th>
                  )}

                  {columns.map((col, index) => {
                    const isSortableColumn =
                      col.sortable !== false &&
                      typeof col.accessor === "string";
                    const isActiveSortColumn =
                      sortField === col.accessor;
                    const isAnimating =
                      sortAnimation === String(col.accessor);

                    return (
                      <th
                        key={index}
                        className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                          isSortableColumn
                            ? "cursor-pointer select-none hover:text-foreground transition-colors"
                            : ""
                        } ${col.className || ""} ${isAnimating ? "bg-muted" : ""}`}
                        onClick={() =>
                          isSortableColumn &&
                          handleSort(col.accessor as keyof T)
                        }
                        aria-sort={
                          isActiveSortColumn
                            ? sortDirection === "asc"
                              ? "ascending"
                              : sortDirection === "desc"
                                ? "descending"
                                : "none"
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {isSortableColumn && (
                            <div
                              className={`transition-transform duration-200 ${isAnimating ? "scale-125" : ""}`}
                            >
                              {isActiveSortColumn ? (
                                sortDirection === "asc" ? (
                                  <ArrowUp
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden="true"
                                  />
                                ) : sortDirection === "desc" ? (
                                  <ArrowDown
                                    className="h-3.5 w-3.5 text-primary"
                                    aria-hidden="true"
                                  />
                                ) : null
                              ) : (
                                <ArrowUp
                                  className="h-3 w-3 opacity-30 group-hover:opacity-70"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}

                  {showActions && actions.length > 0 && (
                    <th className="w-12 px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {displayData.map((row, index) =>
                  renderRow
                    ? renderRow(row, index)
                    : defaultRenderRow(row, index),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dangerous Action Confirmation Modal */}
      <AlertDialog
        open={!!pendingConfirm}
        onOpenChange={(open) => !open && setPendingConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle
                className="h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <AlertDialogTitle>
                {pendingConfirm?.action.confirmTitle ||
                  `Xác nhận ${pendingConfirm?.action.label.toLowerCase()}`}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {pendingConfirm?.action.confirmDescription ||
                `Bạn có chắc chắn muốn thực hiện thao tác "${pendingConfirm?.action.label}" đối với mục này? Thao tác này có thể không thể hoàn tác.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Table;
export type { Action, Column, SortDirection };
