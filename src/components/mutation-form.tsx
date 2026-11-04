"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { MutationState } from "@/lib/mutation-state";

type MutationAction = (state: MutationState, formData: FormData) => Promise<MutationState>;

export function MutationForm({
  action,
  children,
  className,
  resetOnSuccess = false
}: {
  action: MutationAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<MutationState, FormData>(action, {});

  useEffect(() => {
    if (!state.type) return;
    if (state.type === "success") {
      router.refresh();
      if (resetOnSuccess) formRef.current?.reset();
    }
  }, [resetOnSuccess, router, state.nonce, state.type]);

  return (
    <>
      <form ref={formRef} action={formAction} className={className}>
        {children}
      </form>
      {state.type && state.message ? <MutationToast state={state} /> : null}
    </>
  );
}

function MutationToast({ state }: { state: MutationState }) {
  const success = state.type === "success";
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timeout = window.setTimeout(() => setVisible(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [state.nonce]);

  if (!visible) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-50 max-w-sm rounded-2xl border px-4 py-3 text-sm font-semibold shadow-card ${
        success
          ? "border-leaf/30 bg-leaf-soft text-leaf-strong"
          : "border-brand/30 bg-brand-wash text-brand"
      }`}
      role={success ? "status" : "alert"}
    >
      {state.message}
    </div>
  );
}
