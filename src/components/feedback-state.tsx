import Link from "next/link";
import { FlashState } from "@/lib/flash";

export function FlashMessage({ flash }: { flash?: FlashState | null }) {
  if (!flash) return null;
  const tone = flash.type === "success"
    ? "border-[#c8ebd0] bg-[#eef8f1] text-[#2f4d3a]"
    : "border-[#ffdad6] bg-[#fff8f7] text-[#93000a]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`} role={flash.type === "error" ? "alert" : "status"}>
      {flash.message}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon = "-"
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: string;
}) {
  return (
    <div className="card flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[#466550]/10 text-2xl font-bold text-[#466550]">{icon}</div>
      <h2 className="mt-4 text-2xl font-bold text-[#466550]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#75675f]">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-5">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="card p-5">
          <div className="skeleton-shimmer h-5 w-40 rounded-full" />
          <div className="skeleton-shimmer mt-4 h-4 w-full rounded-full" />
          <div className="skeleton-shimmer mt-3 h-4 w-3/4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function MediaCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: rows }).map((_, index) => (
        <article className="card overflow-hidden" key={index}>
          <div className="skeleton-shimmer aspect-[16/10] w-full" />
          <div className="p-5">
            <div className="skeleton-shimmer h-6 w-3/4 rounded-full" />
            <div className="skeleton-shimmer mt-4 h-4 w-full rounded-full" />
            <div className="skeleton-shimmer mt-3 h-4 w-2/3 rounded-full" />
            <div className="mt-5 flex gap-2">
              <div className="skeleton-shimmer h-7 w-20 rounded-full" />
              <div className="skeleton-shimmer h-7 w-24 rounded-full" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-card p-4">
      <div className="skeleton-shimmer h-6 w-52 rounded-full" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, row) => (
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))` }} key={row}>
            {Array.from({ length: columns }).map((__, column) => (
              <div className="skeleton-shimmer h-10 rounded-xl" key={column} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton-shimmer h-6 w-44 rounded-full" />
      <div className="mt-6 flex h-48 items-end gap-3">
        {[48, 72, 56, 90, 64, 82].map((height, index) => (
          <div className="skeleton-shimmer flex-1 rounded-t-xl" style={{ height: `${height}%` }} key={index} />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton({
  title = "Đang tải dữ liệu",
  rows = 3,
  variant = "cards"
}: {
  title?: string;
  rows?: number;
  variant?: "cards" | "media" | "dashboard" | "detail";
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="mb-8">
        <div className="skeleton-shimmer h-4 w-44 rounded-full" />
        <div className="skeleton-shimmer mt-4 h-10 w-full max-w-xl rounded-full" />
        <p className="sr-only">{title}</p>
      </div>
      {variant === "media" ? (
        <MediaCardSkeleton rows={rows} />
      ) : variant === "dashboard" ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="card p-5" key={index}>
                <div className="skeleton-shimmer h-4 w-28 rounded-full" />
                <div className="skeleton-shimmer mt-4 h-10 w-24 rounded-full" />
              </div>
            ))}
          </div>
          <div className="grid gap-6">
            <ChartSkeleton />
            <TableSkeleton rows={4} columns={3} />
          </div>
        </div>
      ) : variant === "detail" ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="skeleton-shimmer aspect-[16/9] rounded-2xl" />
            <div className="mt-6">
              <LoadingSkeleton rows={rows} />
            </div>
          </div>
          <LoadingSkeleton rows={2} />
        </div>
      ) : (
        <LoadingSkeleton rows={rows} />
      )}
    </main>
  );
}

export function ErrorState({
  title = "Không tải được dữ liệu",
  description = "Vui lòng thử lại. Nếu lỗi tiếp tục xảy ra, hãy kiểm tra kết nối hoặc đăng nhập lại.",
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card border-red-100 bg-red-50 p-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700">!</div>
      <h2 className="mt-4 text-2xl font-bold text-red-700">{title}</h2>
      <p className="mt-2 text-sm text-red-700/75">{description}</p>
      {onRetry && (
        <button className="btn-secondary mt-5" type="button" onClick={onRetry}>
          Thử lại
        </button>
      )}
    </div>
  );
}
