/**
 * NavbarBrand Component
 *
 * Displays the brand logo and mobile menu toggle button.
 * The component is responsive and shows the toggle button only on mobile devices.
 */

"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  ChevronDownIcon,
  MapPinIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import Brand from "../../../../components/ui/brand";

interface NavbarBrandProps {
  state: boolean;
  setState: (state: boolean) => void;
  showButton?: boolean;
}

export default function NavbarBrand({
  state,
  setState,
  showButton = true,
}: NavbarBrandProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-full items-center justify-between lg:min-w-[270px] lg:justify-start lg:gap-4">
      <Brand
        className="w-auto shrink-0"
        width={isMobile ? 112 : 132}
      />

      <button
        type="button"
        className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-accent xl:flex"
        aria-label="Chọn địa điểm giao hàng"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <MapPinIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-medium text-muted-foreground">
            Giao đến
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-foreground">
            TP. Hồ Chí Minh
            <ChevronDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </span>
      </button>

      <div className="lg:hidden">
        {showButton && (
          <button
            type="button"
            className="relative grid h-11 w-11 place-items-center rounded-lg border border-border bg-card font-semibold text-foreground shadow-control transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={() => setState(!state)}
            aria-label={
              state ? "Đóng menu điều hướng" : "Mở menu điều hướng"
            }
            aria-expanded={state}
            aria-controls="mobile-navigation"
          >
            <div className="relative h-6 w-6" aria-hidden="true">
              <div
                className={`absolute inset-0 transition motion-reduce:transition-none ${
                  state
                    ? "rotate-45 opacity-0"
                    : "rotate-0 opacity-100"
                }`}
              >
                <MenuIcon className="h-6 w-6" />
              </div>
              <div
                className={`absolute inset-0 transition motion-reduce:transition-none ${
                  state
                    ? "rotate-0 opacity-100"
                    : "rotate-45 opacity-0"
                }`}
              >
                <XIcon className="h-6 w-6" />
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
