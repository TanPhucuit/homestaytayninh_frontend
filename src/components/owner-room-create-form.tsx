"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createRoomInlineAction, type OwnerFormState } from "@/app/owner/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn-primary w-full" disabled={pending} type="submit">
      {pending ? "Đang thêm phòng..." : "Thêm phòng"}
    </button>
  );
}

export function OwnerRoomCreateForm({ homestayId }: { homestayId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<OwnerFormState, FormData>(createRoomInlineAction, {});

  useEffect(() => {
    if (state.type !== "success") return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state.nonce, state.type]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 grid gap-4 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-2">
      <input type="hidden" name="homestayId" value={homestayId} />
      {state.message && (
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
      )}
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Tên phòng/căn
        <input className="field" name="name" placeholder="Ví dụ: Phòng 2 người" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Loại phòng/căn
        <input className="field" name="roomType" placeholder="Ví dụ: Phòng đôi, bungalow" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
        URL ảnh phòng
        <input className="field" name="imageUrl" type="url" placeholder="https://..." />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Giá cố định/đêm
        <input className="field" name="pricePerNight" type="number" min="0" placeholder="Ví dụ: 470000" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Sức chứa mỗi phòng/căn
        <input className="field" name="capacity" type="number" min="1" placeholder="Ví dụ: 4" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Số lượng phòng/căn cùng loại
        <input className="field" name="totalUnits" type="number" min="1" placeholder="Ví dụ: 2" required />
      </label>
      <div className="flex items-end">
        <SubmitButton />
      </div>
    </form>
  );
}
