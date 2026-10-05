import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Brand = ({
  className,
  variant = "dark",
}: {
  className?: string;
  width?: number;
  variant?: "light" | "dark";
}) => (
  <Link
    href="/"
    className={cn(
      "group flex h-12 items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className,
    )}
    aria-label="Foodee trang chủ"
  >
    <span
      className={cn(
        "relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-primary/10 shadow-sm ring-1 ring-primary/15 transition-transform group-hover:scale-105",
        variant === "light" && "bg-white",
      )}
    >
      <Image
        src="/mascot_background_removed.png"
        alt=""
        fill
        sizes="48px"
        className="object-cover object-center"
        priority
      />
    </span>
    <span className="leading-none">
      <span className="block text-2xl font-extrabold tracking-normal text-foreground">
        Foodee
      </span>
      <span className="mt-1 block text-xs font-semibold uppercase text-primary">
        Fresh delivery
      </span>
    </span>
  </Link>
);

export default Brand;
