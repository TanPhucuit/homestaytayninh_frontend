import { LoadingSkeleton } from "@/components/feedback-state";

export default function BookingsLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="h-8 w-56 animate-pulse rounded-full bg-[#eadfd3]" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <LoadingSkeleton rows={1} />
        <LoadingSkeleton rows={4} />
      </div>
    </main>
  );
}

