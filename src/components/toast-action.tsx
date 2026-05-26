"use client";

import { useEffect, useState } from "react";

type Tone = "success" | "error";

export function ToastActionButton({
  children,
  message,
  errorMessage,
  tone = "success",
  className = "btn-secondary",
  disabled = false
}: {
  children: React.ReactNode;
  message: string;
  errorMessage?: string;
  tone?: Tone;
  className?: string;
  disabled?: boolean;
}) {
  const [toast, setToast] = useState<{ tone: Tone; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <>
      <button
        className={className}
        type="button"
        disabled={disabled || loading}
        onClick={() => {
          setLoading(true);
          window.setTimeout(() => {
            setLoading(false);
            setToast({ tone, message: tone === "error" && errorMessage ? errorMessage : message });
          }, 350);
        }}
      >
        {loading ? "Đang xử lý..." : children}
      </button>
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl px-4 py-3 text-sm font-bold shadow-lg ${toast.tone === "success" ? "bg-[#466550] text-white" : "bg-red-600 text-white"}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}

