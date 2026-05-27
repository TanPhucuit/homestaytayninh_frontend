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
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c1c19]/55 px-4 py-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-[#d9c2b4] bg-[#fdf9f4] p-6 text-center shadow-[0_24px_80px_rgba(84,31,17,0.22)]">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#ffdad6] text-xl font-black text-[#9a4029]">!</div>
            <h2 className="mt-5 font-heading text-2xl text-[#9a4029]">Xác nhận thao tác</h2>
            <p className="mt-3 text-sm leading-6 text-[#4e4039]">{message}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-xl border border-[#d9c2b4] bg-white px-4 py-3 text-sm font-bold text-[#466550] transition hover:bg-[#f7eee6]"
                onClick={() => setOpen(false)}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="rounded-xl bg-[#9a4029] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(154,64,41,0.22)] transition hover:bg-[#84331f]"
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
