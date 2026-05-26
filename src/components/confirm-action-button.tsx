"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ConfirmActionButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  message: string;
  pendingLabel?: string;
};

export function ConfirmActionButton({ children, className, disabled, message, pendingLabel = "Đang xử lý..." }: ConfirmActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className ?? "btn-primary"}
      disabled={disabled || pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
