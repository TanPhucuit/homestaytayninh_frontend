"use client";

import { FormEvent, useState } from "react";
import { Homestay, Room } from "@/lib/types";

type CheckoutInfoFormProps = {
  homestay: Homestay;
  room: Room;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultGuestCount: string;
  error?: string;
};

type FormErrors = Partial<Record<"guestName" | "guestPhone" | "guestEmail", string>>;

function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function validateEmail(value: string) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value: string) {
  return /^(?:\+?84|0)[0-9\s.-]{8,12}$/.test(value);
}

export function CheckoutInfoForm({ homestay, room, defaultCheckIn, defaultCheckOut, defaultGuestCount, error }: CheckoutInfoFormProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  function setFieldError(field: keyof FormErrors, message: string) {
    setErrors((current) => ({ ...current, [field]: message }));
    return message;
  }

  function clearFieldError(field: keyof FormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const guestName = String(formData.get("guestName") ?? "").trim();
    const guestPhone = String(formData.get("guestPhone") ?? "").trim();
    const guestEmail = String(formData.get("guestEmail") ?? "").trim();
    const nextErrors: FormErrors = {};

    if (guestName.length < 2) nextErrors.guestName = "Vui lòng nhập họ tên ít nhất 2 ký tự.";
    if (!validatePhone(guestPhone)) nextErrors.guestPhone = "Số điện thoại chưa đúng. Ví dụ: 0901234567 hoặc +84901234567.";
    if (!validateEmail(guestEmail)) nextErrors.guestEmail = "Email chưa đúng định dạng. Ví dụ: ten@email.com.";

    if (Object.keys(nextErrors).length) {
      event.preventDefault();
      setErrors(nextErrors);
      const firstError = Object.keys(nextErrors)[0];
      event.currentTarget.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${firstError}"]`)?.focus();
    }
  }

  return (
    <form action="/checkout/services" className="grid gap-6 lg:grid-cols-[1fr_390px]" method="get" onSubmit={onSubmit}>
      <input type="hidden" name="homestayId" value={homestay.id} />
      <section className="space-y-6">
        {error && <div className="rounded-2xl border border-[#ffdad6] bg-[#fff8f7] p-4 text-sm font-semibold text-[#93000a]">{error}</div>}
        <div className="card p-6 md:p-8">
          <p className="eyebrow">Bước 1</p>
          <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Thông tin khách hàng</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Họ tên <span className="sr-only">bắt buộc</span>
              <input
                className="field"
                name="guestName"
                placeholder="Nguyễn Văn A"
                aria-invalid={Boolean(errors.guestName)}
                required
                minLength={2}
                onInvalid={(event) => event.currentTarget.setCustomValidity(setFieldError("guestName", "Vui lòng nhập họ tên ít nhất 2 ký tự."))}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity("");
                  clearFieldError("guestName");
                }}
              />
              {errors.guestName && <span className="text-xs font-bold text-[#ba1a1a]">{errors.guestName}</span>}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Số điện thoại <span className="sr-only">bắt buộc</span>
              <input
                className="field"
                name="guestPhone"
                placeholder="0901234567"
                aria-invalid={Boolean(errors.guestPhone)}
                required
                inputMode="tel"
                pattern="(?:\+?84|0)[0-9\s.-]{8,12}"
                onInvalid={(event) => event.currentTarget.setCustomValidity(setFieldError("guestPhone", "Số điện thoại chưa đúng. Ví dụ: 0901234567 hoặc +84901234567."))}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity("");
                  clearFieldError("guestPhone");
                }}
              />
              {errors.guestPhone && <span className="text-xs font-bold text-[#ba1a1a]">{errors.guestPhone}</span>}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Email <span className="text-xs font-medium text-[#89726c]">(không bắt buộc)</span>
              <input
                className="field"
                name="guestEmail"
                type="email"
                placeholder="ten@email.com"
                aria-invalid={Boolean(errors.guestEmail)}
                inputMode="email"
                onInvalid={(event) => event.currentTarget.setCustomValidity(setFieldError("guestEmail", "Email chưa đúng định dạng. Ví dụ: ten@email.com."))}
                onInput={(event) => {
                  event.currentTarget.setCustomValidity("");
                  clearFieldError("guestEmail");
                }}
              />
              {errors.guestEmail && <span className="text-xs font-bold text-[#ba1a1a]">{errors.guestEmail}</span>}
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Ghi chú <span className="text-xs font-medium text-[#89726c]">(không bắt buộc)</span>
              <textarea className="field min-h-24" name="notes" placeholder="Ví dụ: cần chuẩn bị cũi em bé, ăn chay..." />
            </label>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <p className="eyebrow">Lưu trú</p>
          <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Phòng và ngày ở</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530] md:col-span-2">
              Phòng
              <select className="field" name="roomId" defaultValue={room.id} required>
                {homestay.rooms.map((item) => <option key={item.id} value={item.id}>{item.name} · {money(item.pricePerNight)} · tối đa {item.capacity} khách</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Nhận phòng
              <input className="field" name="checkIn" type="date" defaultValue={defaultCheckIn} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Trả phòng
              <input className="field" name="checkOut" type="date" defaultValue={defaultCheckOut} required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#3f3530]">
              Số khách
              <input className="field" name="guestCount" type="number" min="1" max={room.capacity} defaultValue={defaultGuestCount} required />
            </label>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <p className="eyebrow">Thanh toán</p>
          <h2 className="mt-2 font-heading text-3xl text-[#1c1c19]">Phương thức thanh toán</h2>
          <label className="mt-5 flex items-start gap-3 rounded-2xl border border-[#dcc0ba] bg-white p-4">
            <input className="mt-1 h-5 w-5 accent-[#9a4029]" name="paymentMethod" type="radio" defaultChecked value="APIPAY" />
            <span>
              <span className="block font-bold text-[#3f3530]">Thanh toán qua ApiPay</span>
              <span className="text-sm text-[#75675f]">Sau khi xác nhận, hệ thống sẽ chuyển bạn sang cổng thanh toán bảo mật của ApiPay.</span>
            </span>
          </label>
        </div>
      </section>

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(123,41,20,0.1)] lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-2xl bg-[#efe7dc]">
          <div className="image-shell h-48 bg-cover bg-center" style={{ backgroundImage: `url(${homestay.imageUrl})` }} />
          <div className="bg-[#466550] p-4 text-white">
            <h3 className="font-heading text-2xl">{homestay.name}</h3>
            <p className="text-sm text-white/80">{room.name}</p>
          </div>
        </div>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between gap-4"><span className="text-[#75675f]">Phòng</span><strong>{money(room.pricePerNight)} / đêm</strong></div>
          <div className="flex justify-between gap-4"><span className="text-[#75675f]">Dịch vụ</span><span>Chọn ở bước sau</span></div>
          <div className="flex justify-between gap-4"><span className="text-[#75675f]">Thuế/phí</span><span>Hiển thị ở bước xác nhận</span></div>
        </div>
        <button className="btn-primary mt-6 w-full" type="submit">Tiếp tục chọn dịch vụ</button>
        <p className="mt-4 text-center text-xs text-[#75675f]">Thông tin đặt phòng được giữ xuyên suốt các bước.</p>
      </aside>
    </form>
  );
}
