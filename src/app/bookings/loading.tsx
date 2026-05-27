import { LoadingSkeleton } from "@/components/feedback-state";

export default function BookingsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="skeleton-shimmer h-8 w-56 rounded-full" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div className="skeleton-shimmer h-12 rounded-full" key={item} />)}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <LoadingSkeleton rows={1} />
        <LoadingSkeleton rows={4} />
      </div>
    </main>
  );
}

