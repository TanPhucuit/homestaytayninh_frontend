"use client";

import { useFormStatus } from "react-dom";

export function ActionButton({
  children,
  pendingLabel = "Đang xử lý...",
  className = "btn-primary",
  disabled = false,
  type = "submit"
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type={type} disabled={disabled || pending} aria-disabled={disabled || pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
