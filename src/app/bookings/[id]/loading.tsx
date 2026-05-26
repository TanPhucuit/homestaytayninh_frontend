import { LoadingSkeleton } from "@/components/feedback-state";

export default function BookingDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-64 animate-pulse rounded-full bg-[#eadfd3]" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <LoadingSkeleton rows={3} />
        <LoadingSkeleton rows={1} />
      </div>
    </main>
  );
}

