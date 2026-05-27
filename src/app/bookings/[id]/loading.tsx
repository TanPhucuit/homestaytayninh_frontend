import { LoadingSkeleton } from "@/components/feedback-state";

export default function BookingDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="skeleton-shimmer h-8 w-64 rounded-full" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <LoadingSkeleton rows={3} />
        <LoadingSkeleton rows={1} />
      </div>
    </main>
  );
}

