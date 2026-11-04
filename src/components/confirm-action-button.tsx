"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ConfirmActionButtonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  message: string;
  pendingLabel?: string;
};

export function ConfirmActionButton({
  children,
  className,
  disabled,
  message,
  pendingLabel = "Đang xử lý..."
}: ConfirmActionButtonProps) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const confirmedRef = useRef(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }
    event.preventDefault();
    setOpen(true);
  }

  function confirmSubmit() {
    confirmedRef.current = true;
    setOpen(false);
    requestAnimationFrame(() => {
      buttonRef.current?.form?.requestSubmit(buttonRef.current);
    });
  }

  return (
    <>
      <button
        ref={buttonRef}
        className={className ?? "btn-primary"}
        disabled={disabled || pending}
        onClick={handleClick}
        type="submit"
      >
        {pending ? pendingLabel : children}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-line bg-sand p-6 text-center shadow-card">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-danger-soft text-xl font-black text-brand">!</div>
            <h2 className="mt-5 font-heading text-2xl text-brand">Xác nhận thao tác</h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">{message}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-bold text-leaf transition hover:bg-sand-deep"
                onClick={() => setOpen(false)}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white shadow-card transition hover:bg-brand-strong"
                onClick={confirmSubmit}
                type="button"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
