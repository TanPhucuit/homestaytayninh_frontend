import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon = "∅"
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
        <div key={index} className="card animate-pulse p-5">
          <div className="h-5 w-40 rounded-full bg-[#eadfd3]" />
          <div className="mt-4 h-4 w-full rounded-full bg-[#eadfd3]" />
          <div className="mt-3 h-4 w-3/4 rounded-full bg-[#eadfd3]" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({ title = "Đang tải dữ liệu", rows = 3 }: { title?: string; rows?: number }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 animate-pulse">
        <div className="h-4 w-44 rounded-full bg-[#eadfd3]" />
        <div className="mt-4 h-10 w-full max-w-xl rounded-full bg-[#eadfd3]" />
        <p className="sr-only">{title}</p>
      </div>
      <LoadingSkeleton rows={rows} />
    </main>
  );
}

export function ErrorState({
  title = "Không tải được dữ liệu",
  description = "Vui lòng thử lại. Nếu lỗi tiếp tục xảy ra, hãy kiểm tra kết nối API backend.",
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
