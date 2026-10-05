"use client";

import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import {
  Fragment,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onOpenChange}
      >
        {/* Overlay with blur and fade */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {children}
        </div>
      </Dialog>
    </Transition>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  side?: "left" | "right";
}

export function SheetContent({
  children,
  className = "",
  side = "right",
}: SheetContentProps) {
  const isRight = side === "right";

  return (
    <Transition.Child
      as={Fragment}
      enter="transform transition ease-in-out duration-300"
      enterFrom={isRight ? "translate-x-full" : "-translate-x-full"}
      enterTo="translate-x-0"
      leave="transform transition ease-in-out duration-200"
      leaveFrom="translate-x-0"
      leaveTo={isRight ? "translate-x-full" : "-translate-x-full"}
    >
      <Dialog.Panel
        className={cn(
          "pointer-events-auto fixed inset-y-0 flex w-[min(90vw,24rem)] flex-col bg-card text-card-foreground shadow-floating",
          isRight ? "right-0 rounded-l-2xl" : "left-0 rounded-r-2xl",
          className,
        )}
      >
        {children}
      </Dialog.Panel>
    </Transition.Child>
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return (
    <Dialog.Title
      as="h2"
      className={cn("text-lg font-bold text-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <Dialog.Description
      as="p"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
