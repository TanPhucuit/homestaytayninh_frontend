import Link from "next/link";
import { BookingStatus } from "@/lib/types";
import { StatusBadge } from "./status-badge";
import { ToastActionButton } from "./toast-action";

const states: BookingStatus[] = ["PENDING", "CONFIRMED", "IN_STAY", "COMPLETED"];

const stateCopy: Record<BookingStatus, { title: string; description: string; actions: string[] }> = {
  PENDING: {
    title: "Chờ xác nhận",
    description: "Booking đã tạo, chờ Owner Staff kiểm tra phòng. Khách có thể thanh toán hoặc hủy yêu cầu.",
    actions: ["Thanh toán", "Hủy booking"]
  },
  CONFIRMED: {
    title: "Đã xác nhận",
    description: "Phòng đã được xác nhận. Khách có thể xem chi tiết hoặc hủy trước thời hạn chính sách.",
    actions: ["Xem chi tiết", "Hủy booking"]
  },
  IN_STAY: {
    title: "Đang trải nghiệm",
    description: "Khách đã check-in. Cho phép gọi thêm dịch vụ và theo dõi trạng thái phục vụ.",
    actions: ["Thêm dịch vụ", "Liên hệ host"]
  },
  COMPLETED: {
    title: "Đã hoàn thành",
    description: "Khách đã check-out. Cho phép xem hóa đơn, đánh giá và đặt lại.",
    actions: ["Viết đánh giá", "Đặt lại"]
  },
  CANCELLED: {
    title: "Đã hủy",
    description: "Booking đã bị hủy, không còn thao tác chuyển trạng thái.",
    actions: ["Đặt lại"]
  }
};

export function BookingStateTimeline({ status }: { status: BookingStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-bold text-red-700">Booking đã hủy</p>
            <p className="mt-1 text-sm text-red-700/75">Trạng thái này là terminal, không thể check-in hoặc complete.</p>
          </div>
          <StatusBadge status="CANCELLED" />
        </div>
      </div>
    );
  }

  const activeIndex = states.indexOf(status);
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {states.map((state, index) => {
        const active = index <= activeIndex;
        const current = state === status;
        return (
          <div key={state} className={`rounded-2xl border p-4 ${active ? "border-[#466550]/20 bg-[#466550]/5" : "border-[#eadfd3] bg-white"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-[#466550] text-white" : "bg-[#fdf9f4] text-[#75675f]"}`}>
                {index + 1}
              </span>
              {current && <StatusBadge status={state} />}
            </div>
            <p className="mt-3 font-bold text-[#2b211d]">{stateCopy[state].title}</p>
            <p className="mt-1 text-xs text-[#75675f]">{stateCopy[state].description}</p>
          </div>
        );
      })}
    </div>
  );
}

export function BookingStateActions({ status, bookingId }: { status: BookingStatus; bookingId: string }) {
  const actions = stateCopy[status].actions;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => {
        if (action === "Thanh toán") {
          return (
            <Link key={action} href="/checkout" className="btn-primary">
              {action}
            </Link>
          );
        }
        if (action === "Xem chi tiết" || action === "Thêm dịch vụ") {
          return (
            <Link key={action} href={`/bookings/${bookingId}`} className="btn-primary">
              {action}
            </Link>
          );
        }
        return (
          <ToastActionButton key={action} className="btn-secondary" message={`${action} thành công trong demo`}>
            {action}
          </ToastActionButton>
        );
      })}
    </div>
  );
}

