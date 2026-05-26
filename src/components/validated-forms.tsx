"use client";

import { useMemo, useState } from "react";
import { ToastActionButton } from "./toast-action";

type Errors<T extends string> = Partial<Record<T, string>>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-bold text-red-700">{message}</p> : null;
}

function SubmitButton({ valid, loading, children }: { valid: boolean; loading: boolean; children: React.ReactNode }) {
  return (
    <button className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto" type="submit" disabled={!valid || loading}>
      {loading ? "Đang xử lý..." : children}
    </button>
  );
}

function useDemoSubmit() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  return {
    loading,
    message,
    submit(successMessage: string) {
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        setMessage(successMessage);
        window.setTimeout(() => setMessage(null), 2600);
      }, 500);
    }
  };
}

function Toast({ message }: { message: string | null }) {
  return message ? <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-[#466550] px-4 py-3 text-sm font-bold text-white shadow-lg">{message}</div> : null;
}

export function LoginRegisterForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("nguyenvana@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Nguyễn Văn A");
  const { loading, message, submit } = useDemoSubmit();

  const errors = useMemo(() => {
    const next: Errors<"email" | "password" | "name"> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Email không hợp lệ.";
    if (password.length < 8) next.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    if (mode === "register" && name.trim().length < 2) next.name = "Tên phải có ít nhất 2 ký tự.";
    return next;
  }, [email, password, name, mode]);
  const valid = Object.keys(errors).length === 0;

  return (
    <form
      className="mt-8 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) submit(mode === "login" ? "Đăng nhập demo thành công" : "Đăng ký demo thành công");
      }}
    >
      <div className="flex rounded-2xl bg-[#fdf9f4] p-1">
        {(["login", "register"] as const).map((item) => (
          <button key={item} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${mode === item ? "bg-white text-[#466550] shadow-sm" : "text-[#75675f]"}`} type="button" onClick={() => setMode(item)}>
            {item === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        ))}
      </div>
      {mode === "register" && (
        <label className="grid gap-2 text-sm font-bold text-[#466550]">
          Họ tên
          <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
          <FieldError message={errors.name} />
        </label>
      )}
      <label className="grid gap-2 text-sm font-bold text-[#466550]">
        Email
        <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} />
        <FieldError message={errors.email} />
      </label>
      <label className="grid gap-2 text-sm font-bold text-[#466550]">
        Mật khẩu
        <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <FieldError message={errors.password} />
      </label>
      <SubmitButton valid={valid} loading={loading}>
        {mode === "login" ? "Đăng nhập bằng email" : "Tạo tài khoản"}
      </SubmitButton>
      <Toast message={message} />
    </form>
  );
}

export function BookingValidationForm() {
  const [guestName, setGuestName] = useState("Nguyễn Văn A");
  const [phone, setPhone] = useState("0912345678");
  const [email, setEmail] = useState("nguyenvana@example.com");
  const [checkIn, setCheckIn] = useState("2026-05-28");
  const [checkOut, setCheckOut] = useState("2026-05-30");
  const [guests, setGuests] = useState(2);
  const { loading, message, submit } = useDemoSubmit();

  const errors = useMemo(() => {
    const next: Errors<"guestName" | "phone" | "email" | "dates" | "guests"> = {};
    if (guestName.trim().length < 2) next.guestName = "Tên khách phải có ít nhất 2 ký tự.";
    if (!/^(0|\+84)\d{9,10}$/.test(phone.replace(/\s/g, ""))) next.phone = "Số điện thoại Việt Nam không hợp lệ.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Email không hợp lệ.";
    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) next.dates = "Ngày trả phòng phải sau ngày nhận phòng.";
    if (guests < 1 || guests > 12) next.guests = "Số khách phải từ 1 đến 12.";
    return next;
  }, [guestName, phone, email, checkIn, checkOut, guests]);
  const valid = Object.keys(errors).length === 0;

  return (
    <form
      className="card p-4 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) submit("Thông tin booking hợp lệ, đã sẵn sàng tạo payment request");
      }}
    >
      <h2 className="text-2xl font-bold text-[#466550]">Thông tin khách hàng</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Họ tên<input className="field" value={guestName} onChange={(event) => setGuestName(event.target.value)} /><FieldError message={errors.guestName} /></label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Số điện thoại<input className="field" value={phone} onChange={(event) => setPhone(event.target.value)} /><FieldError message={errors.phone} /></label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Email<input className="field" value={email} onChange={(event) => setEmail(event.target.value)} /><FieldError message={errors.email} /></label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Số khách<input className="field" type="number" value={guests} onChange={(event) => setGuests(Number(event.target.value))} /><FieldError message={errors.guests} /></label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Ngày nhận<input className="field" type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Ngày trả<input className="field" type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /><FieldError message={errors.dates} /></label>
      </div>
      <div className="mt-5"><SubmitButton valid={valid} loading={loading}>Xác nhận thông tin booking</SubmitButton></div>
      <Toast message={message} />
    </form>
  );
}

export function HomestayValidationForm({ defaultName, defaultLocation, defaultType }: { defaultName: string; defaultLocation: string; defaultType: string }) {
  const [name, setName] = useState(defaultName);
  const [location, setLocation] = useState(defaultLocation);
  const [type, setType] = useState(defaultType);
  const [amenities, setAmenities] = useState("Wifi, Bếp riêng, Sân BBQ");
  const { loading, message, submit } = useDemoSubmit();
  const valid = name.trim().length >= 3 && location.trim().length >= 5 && type.trim().length > 0 && amenities.split(",").filter(Boolean).length > 0;

  return (
    <form className="mt-5 grid gap-4" onSubmit={(event) => { event.preventDefault(); if (valid) submit("Lưu thông tin homestay thành công"); }}>
      <label className="grid gap-2 text-sm font-bold text-[#466550]">Tên homestay<input className="field" value={name} onChange={(event) => setName(event.target.value)} />{name.trim().length < 3 && <FieldError message="Tên homestay phải có ít nhất 3 ký tự." />}</label>
      <label className="grid gap-2 text-sm font-bold text-[#466550]">Địa chỉ<input className="field" value={location} onChange={(event) => setLocation(event.target.value)} />{location.trim().length < 5 && <FieldError message="Địa chỉ phải rõ ràng hơn." />}</label>
      <label className="grid gap-2 text-sm font-bold text-[#466550]">Loại hình<select className="field" value={type} onChange={(event) => setType(event.target.value)}><option>Phòng</option><option>Lều</option><option>Nhà nguyên căn</option></select></label>
      <label className="grid gap-2 text-sm font-bold text-[#466550]">Tiện ích<input className="field" value={amenities} onChange={(event) => setAmenities(event.target.value)} />{amenities.split(",").filter(Boolean).length === 0 && <FieldError message="Cần ít nhất một tiện ích." />}</label>
      <SubmitButton valid={valid} loading={loading}>Lưu homestay</SubmitButton>
      <Toast message={message} />
    </form>
  );
}

export function RoomValidationForm() {
  const [name, setName] = useState("Villa Gỗ Sồi");
  const [capacity, setCapacity] = useState(4);
  const [price, setPrice] = useState(1450000);
  const { loading, message, submit } = useDemoSubmit();
  const valid = name.trim().length >= 2 && capacity >= 1 && price >= 100000;
  return (
    <form className="grid gap-3 rounded-2xl bg-[#fdf9f4] p-4" onSubmit={(event) => { event.preventDefault(); if (valid) submit("Lưu phòng demo thành công"); }}>
      <h3 className="font-bold text-[#466550]">Form phòng</h3>
      <input className="field" value={name} onChange={(event) => setName(event.target.value)} aria-label="Tên phòng" />
      {name.trim().length < 2 && <FieldError message="Tên phòng không được để trống." />}
      <input className="field" type="number" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} aria-label="Sức chứa" />
      {capacity < 1 && <FieldError message="Sức chứa phải lớn hơn 0." />}
      <input className="field" type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label="Giá phòng" />
      {price < 100000 && <FieldError message="Giá phòng tối thiểu 100.000đ." />}
      <SubmitButton valid={valid} loading={loading}>Lưu phòng</SubmitButton>
      <Toast message={message} />
    </form>
  );
}

export function ServiceValidationForm() {
  const [name, setName] = useState("Tiệc BBQ sân vườn");
  const [price, setPrice] = useState(650000);
  const [included, setIncluded] = useState(false);
  const { loading, message, submit } = useDemoSubmit();
  const valid = name.trim().length >= 2 && (included || price >= 0);
  return (
    <form className="grid gap-3 rounded-2xl bg-[#fdf9f4] p-4" onSubmit={(event) => { event.preventDefault(); if (valid) submit("Lưu dịch vụ demo thành công"); }}>
      <h3 className="font-bold text-[#466550]">Form dịch vụ</h3>
      <input className="field" value={name} onChange={(event) => setName(event.target.value)} aria-label="Tên dịch vụ" />
      {name.trim().length < 2 && <FieldError message="Tên dịch vụ không được để trống." />}
      <input className="field" type="number" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label="Đơn giá" disabled={included} />
      <label className="flex items-center gap-2 text-sm font-bold text-[#466550]"><input type="checkbox" checked={included} onChange={(event) => setIncluded(event.target.checked)} />Dịch vụ đã bao gồm</label>
      <SubmitButton valid={valid} loading={loading}>Lưu dịch vụ</SubmitButton>
      <Toast message={message} />
    </form>
  );
}

export function BlogValidationForm() {
  const [title, setTitle] = useState("Cẩm nang leo núi Bà Đen mùa khô");
  const [slug, setSlug] = useState("cam-nang-leo-nui-ba-den-mua-kho");
  const [content, setContent] = useState("Lịch trình, vật dụng cần chuẩn bị và lưu ý an toàn khi nghỉ gần núi Bà Đen.");
  const { loading, message, submit } = useDemoSubmit();
  const valid = title.trim().length >= 8 && /^[a-z0-9-]+$/.test(slug) && content.trim().length >= 20;
  return (
    <form className="card p-5" onSubmit={(event) => { event.preventDefault(); if (valid) submit("Lưu bài viết demo thành công"); }}>
      <h2 className="text-2xl font-bold text-[#466550]">Form tạo / sửa bài viết</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Tiêu đề<input className="field" value={title} onChange={(event) => setTitle(event.target.value)} />{title.trim().length < 8 && <FieldError message="Tiêu đề phải có ít nhất 8 ký tự." />}</label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">Slug<input className="field" value={slug} onChange={(event) => setSlug(event.target.value)} />{!/^[a-z0-9-]+$/.test(slug) && <FieldError message="Slug chỉ gồm chữ thường, số và dấu gạch ngang." />}</label>
        <label className="grid gap-2 text-sm font-bold text-[#466550] md:col-span-2">Nội dung<textarea className="field min-h-32" value={content} onChange={(event) => setContent(event.target.value)} />{content.trim().length < 20 && <FieldError message="Nội dung phải có ít nhất 20 ký tự." />}</label>
      </div>
      <div className="mt-4"><SubmitButton valid={valid} loading={loading}>Lưu bài viết</SubmitButton></div>
      <Toast message={message} />
    </form>
  );
}

export function UserRoleValidationForm() {
  const [email, setEmail] = useState("owner@homestay.vn");
  const [role, setRole] = useState("OWNER");
  const { loading, message, submit } = useDemoSubmit();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && Boolean(role);
  return (
    <form className="mt-5 grid gap-3 rounded-2xl bg-[#fdf9f4] p-4" onSubmit={(event) => { event.preventDefault(); if (valid) submit("Cập nhật phân quyền user thành công"); }}>
      <h3 className="font-bold text-[#466550]">Form phân quyền user</h3>
      <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email user" />
      {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <FieldError message="Email user không hợp lệ." />}
      <select className="field" value={role} onChange={(event) => setRole(event.target.value)}>
        {["CUSTOMER", "OWNER", "OWNER_STAFF", "STAFF", "ADMIN"].map((item) => <option key={item}>{item}</option>)}
      </select>
      <SubmitButton valid={valid} loading={loading}>Cập nhật role</SubmitButton>
      <Toast message={message} />
    </form>
  );
}

export function AddServiceValidationForm({ enabled }: { enabled: boolean }) {
  const [quantity, setQuantity] = useState(1);
  const { loading, message, submit } = useDemoSubmit();
  const valid = enabled && quantity >= 1;
  return (
    <form className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); if (valid) submit("Thêm dịch vụ vào booking thành công"); }}>
      <input className="field" type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} disabled={!enabled} aria-label="Số lượng dịch vụ" />
      {!enabled && <FieldError message="Chỉ được thêm dịch vụ khi booking ở trạng thái IN_STAY." />}
      <SubmitButton valid={valid} loading={loading}>Thêm vào booking</SubmitButton>
      <Toast message={message} />
    </form>
  );
}

