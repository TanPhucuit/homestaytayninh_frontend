"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function PaymentStatusPoller({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [checks, setChecks] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      setChecks((current) => current + 1);
      router.refresh();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [enabled, router]);

  if (!enabled) return null;

  return (
    <div className="mx-auto mt-5 max-w-md rounded-2xl border border-[#fff3d6] bg-[#fff8e8] p-4 text-sm font-semibold text-[#7a4a12]" role="status">
      Hệ thống đang tự kiểm tra trạng thái mỗi 5 giây. Đã kiểm tra {checks} lần trong phiên này.
    </div>
  );
}
