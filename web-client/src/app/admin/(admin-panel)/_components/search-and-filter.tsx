import { Search, X } from "lucide-react";
import { ReactNode } from "react";

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  additionalFilters?: ReactNode;
}

/**
 * Component thanh tìm kiếm và bộ lọc chuẩn hóa cho Admin & Owner.
 */
const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  additionalFilters,
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4">
    {/* Search Input with Icon & Clear */}
    <div className="relative w-full sm:w-80 md:w-96">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="w-full h-10 pl-9 pr-9 rounded-xl border border-input bg-background text-sm text-foreground shadow-2xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          aria-label="Xóa từ khóa tìm kiếm"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>

    {/* Additional Filters & Actions */}
    {additionalFilters && (
      <div className="flex flex-wrap items-center gap-2">
        {additionalFilters}
      </div>
    )}
  </div>
);

export default SearchAndFilters;
