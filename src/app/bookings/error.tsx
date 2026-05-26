"use client";

import { RouteError } from "@/components/route-error";

export default function BookingsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError reset={reset} title="Không tải được lịch sử booking" />;
}

