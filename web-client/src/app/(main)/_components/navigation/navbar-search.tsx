/**
 * SearchBar Component
 *
 * Provides a search input for finding courses and content.
 * The component is responsive and adapts to different screen sizes.
 */

"use client";

import { SearchBarProps } from "@/app/(main)/_components/navigation/types";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

export default function SearchBar({
  windowDimensions,
}: SearchBarProps) {
  // State for search input
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  const isVisible = !(
    windowDimensions.width < 1190 && windowDimensions.width > 1024
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  if (!isVisible) return <></>;

  return (
    <form
      className={`
        flex h-11 w-full items-center rounded-lg border bg-card text-base
        shadow-sm transition-all duration-200 ease-in-out
        ${isFocused 
          ? "border-primary ring-2 ring-primary/15" 
          : "border-border hover:border-primary/40"
        }
      `}
      onSubmit={handleSubmit}
      role="search"
    >
      <SearchIcon className={`
        h-5 w-5 ml-3 mr-2
        ${isFocused ? "text-primary" : "text-muted-foreground"}
        ${searchQuery ? "text-primary/70" : ""}
        transition-colors duration-200
      `} />
      
      <input
        className="w-full bg-transparent py-2 pr-3 text-foreground outline-none appearance-none placeholder:text-muted-foreground"
        type="text"
        placeholder="Tìm món ăn, nhà hàng..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Tìm món ăn"
      />
    </form>
  );
}
