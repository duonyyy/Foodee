import { ChevronRight, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RestaurantLinkProps {
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string; // Optional restaurant avatar URL
  restaurantDescription?: string; // Optional restaurant description
}

const RestaurantLink = ({
  restaurantId,
  restaurantName,
  restaurantImage,
  restaurantDescription = "Xem thêm món ăn từ nhà hàng này",
}: RestaurantLinkProps) => {
  return (
    <section className="h-full rounded-lg border border-border bg-card/75 p-5 shadow-sm backdrop-blur">
      <div className="mb-4">
        <p className="text-sm font-black uppercase text-primary">
          Từ nhà hàng
        </p>
        <h2 className="mt-1 text-2xl font-black text-foreground">
          Ghé quán để xem thêm
        </h2>
      </div>
      <Link
        href={`/restaurant/${restaurantId}`}
        className="group block rounded-lg border border-border bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-white hover:shadow-lg"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {restaurantImage ? (
                <Image
                  src={restaurantImage}
                  alt={restaurantName}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <Store className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-foreground">
                {restaurantName}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {restaurantDescription}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </Link>
    </section>
  );
};

export default RestaurantLink;
