/**
 * NavigationItems Component
 *
 * Renders the main navigation items with dropdown functionality.
 * Handles both desktop and mobile navigation layouts.
 */

"use client";

import {
  NavigationItemsProps,
  NavItem,
  SubNavItem,
} from "@/app/(main)/_components/navigation/types";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * SubNavItem Component - Renders a single dropdown navigation item
 */
const SubNavItemComponent = ({
  item,
  onNavigate,
}: {
  item: SubNavItem;
  onNavigate?: () => void;
}) => (
  <Link
    href={item.path}
    role="menuitem"
    onClick={onNavigate}
    className="
      block rounded-md p-3 transition-colors
      hover:bg-accent
      touch-manipulation
    "
  >
    <div className="flex max-w-xs gap-3 text-base">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
        {item.icon}
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-foreground">
          {item.title}
        </span>
        <p className="mt-1 text-sm font-normal leading-5 text-muted-foreground">
          {item.desc}
        </p>
      </span>
    </div>
  </Link>
);

export default function NavigationItems({
  navigation,
  dropdownState,
  setDropdownState,
  className,
  onNavigate,
}: NavigationItemsProps) {
  const dropdownRef = useRef<HTMLUListElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownState({ isActive: false, idx: dropdownState.idx });
      }
    };

    if (!dropdownState.isActive) return;

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownState.idx, dropdownState.isActive, setDropdownState]);

  const toggleDropdown = (idx: number) => {
    setDropdownState({
      idx,
      isActive:
        dropdownState.idx === idx ? !dropdownState.isActive : true,
    });
  };

  const isItemActive = (item: NavItem) => {
    if (item.isDropdown) {
      return (
        item.navs?.some((nav) => pathname.startsWith(nav.path)) ??
        false
      );
    }

    return (
      item.path !== "#" &&
      (pathname === item.path || pathname.startsWith(`${item.path}/`))
    );
  };

  return (
    <ul ref={dropdownRef} className={cn("flex gap-2", className)}>
      {navigation.map((item: NavItem, idx: number) => (
        <li className="flex-none" key={`nav-item-${idx}`}>
          {item.isDropdown ? (
            // Dropdown navigation item
            <div className="relative">
              <button
                type="button"
                className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg
                  px-3 py-2 text-base font-semibold text-foreground transition-colors
                  hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2
                  active:bg-accent
                  ${isItemActive(item) ? "bg-primary/10 text-primary" : ""}
                `}
                onClick={() => toggleDropdown(idx)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setDropdownState({ isActive: false, idx });
                  }
                }}
                aria-expanded={
                  dropdownState.idx === idx && dropdownState.isActive
                }
                aria-haspopup="menu"
                aria-controls={`navigation-dropdown-${idx}`}
              >
                {item.title}
                <span
                  className={`transition-transform motion-reduce:transition-none ${
                    dropdownState.idx === idx &&
                    dropdownState.isActive
                      ? "rotate-180"
                      : "rotate-0"
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </span>
              </button>

              {/* Dropdown menu */}
              {item.isDropdown &&
                dropdownState.idx === idx &&
                dropdownState.isActive && (
                  <div
                    id={`navigation-dropdown-${idx}`}
                    className="z-10 mt-2 w-full rounded-xl border border-border bg-card shadow-floating motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 lg:absolute lg:left-0 lg:top-full lg:mt-3 lg:w-80"
                  >
                    <ul
                      className="mx-auto flex flex-col gap-1 p-2"
                      role="menu"
                    >
                      {item.navs?.map((navItem, subIdx: number) => (
                        <li
                          key={`subnav-${idx}-${subIdx}`}
                          className="group"
                          role="none"
                        >
                          <SubNavItemComponent
                            item={navItem}
                            onNavigate={() => {
                              setDropdownState({
                                isActive: false,
                                idx,
                              });
                              onNavigate?.();
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          ) : (
            // Regular navigation link
            <Link
              href={item.path}
              onClick={onNavigate}
              aria-current={isItemActive(item) ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-lg px-3 py-2 text-base
                font-semibold text-foreground transition-colors hover:bg-accent hover:text-primary
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                active:bg-accent
                ${isItemActive(item) ? "bg-primary/10 text-primary" : ""}
              `}
            >
              {item.title}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
