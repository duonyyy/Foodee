import { Skeleton } from "@/components/ui/skeleton";

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Back link skeleton */}
        <Skeleton className="mb-6 h-9 w-44 rounded-full" />

        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {/* Left column: image & trust badges */}
          <div className="space-y-5">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl md:aspect-square" />
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Right column: info & action */}
          <div className="space-y-4">
            <div className="space-y-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-10 w-4/5 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>

              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />

              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Reviews skeleton */}
        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.86fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </main>
    </div>
  );
};

export default LoadingState;

