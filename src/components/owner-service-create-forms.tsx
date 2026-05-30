"use client";

import { createServiceInlineAction } from "@/app/owner/actions";
import { ActionButton } from "./action-button";
import { MutationForm } from "./mutation-form";

export function OwnerAddOnServiceCreateForm({ homestayId }: { homestayId: string }) {
  return (
    <MutationForm action={createServiceInlineAction} className="grid gap-4 rounded-2xl bg-[#fdf9f4] p-4 md:grid-cols-2" resetOnSuccess>
      <input type="hidden" name="homestayId" value={homestayId} />
      <input type="hidden" name="included" value="off" />
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Tên dịch vụ bổ sung
        <input className="field" name="name" placeholder="Ví dụ: Thuê xe máy" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
        Đơn giá
        <input className="field" name="unitPrice" type="number" min="0" placeholder="Ví dụ: 150000" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
        Mô tả
        <textarea className="field min-h-20" name="description" placeholder="Mô tả ngắn cho nhân viên và khách" />
      </label>
      <ActionButton className="btn-primary w-full md:col-span-2" pendingLabel="Đang thêm...">Thêm dịch vụ bổ sung</ActionButton>
    </MutationForm>
  );
}

export function OwnerIncludedServiceCreateForm({ homestayId }: { homestayId: string }) {
  return (
    <MutationForm action={createServiceInlineAction} className="grid gap-4 rounded-2xl border border-[#d7e2da] bg-[#f5fbf6] p-4 md:grid-cols-2" resetOnSuccess>
      <input type="hidden" name="homestayId" value={homestayId} />
      <input type="hidden" name="included" value="on" />
      <input type="hidden" name="unitPrice" value="0" />
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
        Tên dịch vụ đã bao gồm
        <input className="field" name="name" placeholder="Ví dụ: Ăn sáng" required />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
        Mô tả
        <textarea className="field min-h-20" name="description" placeholder="Dịch vụ này đã nằm trong giá phòng, không hiện trong danh sách đặt thêm" />
      </label>
      <ActionButton className="btn-secondary w-full md:col-span-2" pendingLabel="Đang thêm...">Thêm dịch vụ đã bao gồm</ActionButton>
    </MutationForm>
  );
}
