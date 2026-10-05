/**
 * NavbarMenu Component
 *
 * Renders the main navigation menu including navigation items,
 * search bar, and user actions. Handles both mobile and desktop layouts.
 */

"use client";

import NavigationItems from "@/app/(main)/_components/navigation/navbar-item";
import UserActions from "@/app/(main)/_components/navigation/navbar-user";
import { NavbarMenuProps } from "@/app/(main)/_components/navigation/types";
import { cn } from "@/lib/utils";

export default function NavbarMenu({
  navigation,
  dropdownState,
  setDropdownState,
  user,
  openModal,
  variant,
  onNavigate,
}: NavbarMenuProps) {
  return (
    <div
      className={cn(
        "nav-menu",
        variant === "desktop"
          ? "flex w-full items-center justify-between gap-4"
          : "flex min-h-0 flex-1 flex-col gap-6",
      )}
    >
      <NavigationItems
        navigation={navigation}
        dropdownState={dropdownState}
        setDropdownState={setDropdownState}
        onNavigate={onNavigate}
        className={
          variant === "desktop" ? "flex-row items-center" : "flex-col"
        }
      />

      <div
        className={cn(
          "flex items-center",
          variant === "mobile" &&
            "mt-auto border-t border-border pt-5",
        )}
      >
        <UserActions user={user} openModal={openModal} />
      </div>
    </div>
  );
}
