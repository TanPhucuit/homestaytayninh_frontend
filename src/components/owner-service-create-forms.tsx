"use client";

import { useActionState, useEffect, useRef, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createServiceInlineAction, type OwnerFormState } from "@/app/owner/actions";

function InlineMessage({ state }: { state: OwnerFormState }) {
  if (!state.message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold md:col-span-2 ${
        state.type === "success"
          ? "border-[#c8ebd0] bg-[#eef8f1] text-[#2f4d3a]"
          : "border-[#ffdad6] bg-[#fff8f7] text-[#93000a]"
      }`}
      role={state.type === "error" ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

function SubmitButton({ children, pendingLabel, className }: { children: string; pendingLabel: string; className: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}

function useResetOnSuccess(state: OwnerFormState, formRef: RefObject<HTMLFormElement | null>) {
  const router = useRouter();

  useEffect(() => {
    if (state.type !== "success") return;
    formRef.current?.reset();
    router.refresh();
  }, [formRef, router, state.nonce, state.type]);
}

export function OwnerAddOnServiceCreateForm({ homestayId }: { homestayId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<OwnerFormState, FormData>(createServiceInlineAction, {});
  useResetOnSuccess(state, formRef);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-2">
      <input type="hidden" name="homestayId" value={homestayId} />
      <input type="hidden" name="included" value="off" />
      <InlineMessage state={state} />
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Tên dịch vụ bổ sung
        <input className="field" name="name" placeholder="Ví dụ: BBQ sân vườn" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Đơn giá
        <input className="field" name="unitPrice" type="number" min="0" placeholder="Ví dụ: 250000" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
        Mô tả
        <textarea className="field min-h-20" name="description" placeholder="Mô tả ngắn để khách hiểu dịch vụ" />
      </label>
      <SubmitButton className="btn-primary w-full md:col-span-2" pendingLabel="Đang thêm dịch vụ...">
        Thêm dịch vụ bổ sung
      </SubmitButton>
    </form>
  );
}

export function OwnerIncludedServiceCreateForm({ homestayId }: { homestayId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<OwnerFormState, FormData>(createServiceInlineAction, {});
  useResetOnSuccess(state, formRef);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 rounded-2xl border border-[#d7e2da] bg-[#f5fbf6] p-4 md:grid-cols-2">
      <input type="hidden" name="homestayId" value={homestayId} />
      <input type="hidden" name="included" value="on" />
      <input type="hidden" name="unitPrice" value="0" />
      <InlineMessage state={state} />
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Tên dịch vụ đã bao gồm
        <input className="field" name="name" placeholder="Ví dụ: Wifi, nước uống" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Mô tả
        <input className="field" name="description" placeholder="Không tính thêm tiền khi đặt phòng" />
      </label>
      <SubmitButton className="btn-secondary w-full md:col-span-2" pendingLabel="Đang thêm dịch vụ...">
        Thêm dịch vụ đã bao gồm
      </SubmitButton>
    </form>
  );
}
