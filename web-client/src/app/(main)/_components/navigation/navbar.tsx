/**
 * Navbar Component
 *
 * Main navigation component for the application.
 * Provides responsive navigation with dropdowns, search, and user actions.
 *
 * Features:
 * - Responsive design for mobile and desktop
 * - Dropdown menus for navigation categories
 * - User authentication status handling
 * - Search functionality
 * - Cart and notification integration
 */

"use client";

import NavbarBrand from "@/app/(main)/_components/navigation/navbar-brand";
import { navigation } from "@/app/(main)/_components/navigation/navbar-data";
import NavbarMenu from "@/app/(main)/_components/navigation/navbar-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { useAuthModal } from "@/context/modal-context";
import useScreen from "@/hooks/use-screen";
import { XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [state, setState] = useState(false);
  const [dropdownState, setDropdownState] = useState({
    isActive: false,
    idx: 0,
  });

  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const windowDimensions = useScreen();
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setState(false);
    setDropdownState({ isActive: false, idx: 0 });
  }, [pathname]);

  const isDesktop = windowDimensions.width >= 1024;
  useEffect(() => {
    if (isDesktop && state) {
      setState(false);
    }
  }, [isDesktop, state]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="h-1 w-full bg-primary" />
        <nav className="relative" aria-label="Điều hướng chính">
          <div className="mx-auto h-[calc(var(--app-header-height)-0.25rem)] max-w-screen-2xl px-4 lg:flex lg:items-center lg:gap-x-5 lg:px-8">
            <NavbarBrand state={state} setState={setState} />
            <div className="hidden min-w-0 flex-1 lg:block">
              <NavbarMenu
                navigation={navigation}
                dropdownState={dropdownState}
                setDropdownState={setDropdownState}
                user={user}
                openModal={openModal}
                variant="desktop"
              />
            </div>
          </div>
        </nav>
      </header>

      <Sheet open={state} onOpenChange={setState}>
        <SheetContent side="left" className="p-0 lg:hidden">
          <div
            id="mobile-navigation"
            className="flex h-full min-h-0 flex-col p-5"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <SheetTitle>Điều hướng Foodee</SheetTitle>
                <SheetDescription className="mt-1">
                  Khám phá món ngon và quản lý tài khoản.
                </SheetDescription>
              </div>
              <button
                type="button"
                onClick={() => setState(false)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Đóng menu điều hướng"
              >
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavbarMenu
                navigation={navigation}
                dropdownState={dropdownState}
                setDropdownState={setDropdownState}
                user={user}
                openModal={openModal}
                variant="mobile"
                onNavigate={() => setState(false)}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
