"use client";

import { createRoomInlineAction } from "@/app/owner/actions";
import { ActionButton } from "./action-button";
import { MutationForm } from "./mutation-form";

export function OwnerRoomCreateForm({ homestayId }: { homestayId: string }) {
  return (
    <MutationForm action={createRoomInlineAction} className="mt-4 grid gap-4 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-2" resetOnSuccess>
      <input type="hidden" name="homestayId" value={homestayId} />
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
        <input className="field" name="pricePerNight" type="number" min="1" step="1000" placeholder="Ví dụ: 470000" required />
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
        <ActionButton className="btn-primary w-full" pendingLabel="Đang thêm phòng...">Thêm phòng</ActionButton>
      </div>
    </MutationForm>
  );
}
