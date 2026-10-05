import { Skeleton } from "@/components/ui/skeleton";

export function RestaurantSkeleton() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-6 pb-16 sm:px-6 lg:px-8">
      {/* Header Banner skeleton */}
      <Skeleton className="h-[260px] w-full rounded-2xl sm:h-[320px] lg:h-[360px]" />

      <div className="mt-6 space-y-6">
        {/* Info card skeleton */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-5" />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Menu toolbar skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        </div>

        {/* Tab pills */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-xl" />
          ))}
        </div>

        {/* Food Card Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="flex min-h-[408px] flex-col rounded-2xl border border-border bg-card p-0 overflow-hidden">
              <Skeleton className="h-52 w-full" />
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}