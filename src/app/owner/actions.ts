"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createOwnerHomestay,
  createOwnerImage,
  createOwnerRoom,
  createOwnerRoomRate,
  createOwnerService,
  createProxyBooking,
  getOwnerHomestays,
  updateOwnerBookingStatus,
  updateOwnerHomestay,
  updateOwnerRoom,
  updateOwnerService
} from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { flashUrl } from "@/lib/flash";
import { BookingStatus } from "@/lib/types";

export type OwnerFormState = {
  type?: "success" | "error";
  message?: string;
  nonce?: number;
};

function ownerError(path: string, error: unknown): never {
  redirect(flashUrl(path, "error", actionErrorMessage(error)));
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function requiredText(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) throw new Error(`Vui lòng nhập ${label}.`);
  return value;
}

function numberValue(formData: FormData, key: string, label: string) {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value)) throw new Error(`${label} không hợp lệ.`);
  return value;
}

function nonNegativeNumber(formData: FormData, key: string, label: string) {
  const value = numberValue(formData, key, label);
  if (value < 0) throw new Error(`${label} không được âm.`);
  return value;
}

function positiveInteger(formData: FormData, key: string, label: string) {
  const value = numberValue(formData, key, label);
  if (!Number.isInteger(value) || value < 1) throw new Error(`${label} phải là số nguyên lớn hơn 0.`);
  return value;
}

function nonNegativeInteger(formData: FormData, key: string, label: string) {
  const value = numberValue(formData, key, label);
  if (!Number.isInteger(value) || value < 0) throw new Error(`${label} phải là số nguyên không âm.`);
  return value;
}

function requiredUrl(formData: FormData, key: string, label: string) {
  const value = requiredText(formData, key, label);
  try {
    new URL(value);
  } catch {
    throw new Error(`${label} phải là URL hợp lệ.`);
  }
  return value;
}

function optionalUrl(formData: FormData, key: string, label: string) {
  const value = text(formData, key);
  if (!value) return undefined;
  try {
    new URL(value);
  } catch {
    throw new Error(`${label} phải là URL hợp lệ.`);
  }
  return value;
}

function requiredDate(formData: FormData, key: string, label: string) {
  const value = requiredText(formData, key, label);
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} không hợp lệ.`);
  return value;
}

async function syncHomestayRoomTotals(homestayId: string) {
  const homestay = (await getOwnerHomestays("OWNER")).find((item) => item.id === homestayId);
  if (!homestay) return;

  const activeRooms = homestay.rooms.filter((room) => room.active !== false);
  if (!activeRooms.length) return;

  await updateOwnerHomestay(
    homestayId,
    {
      priceFrom: Math.min(...activeRooms.map((room) => room.pricePerNight)),
      capacity: activeRooms.reduce((sum, room) => sum + room.capacity * Math.max(1, room.totalUnits || 1), 0)
    },
    "OWNER"
  );
}

export async function updateOwnerBookingStatusAction(formData: FormData) {
  try {
    const bookingId = text(formData, "bookingId");
    const status = text(formData, "status") as BookingStatus;
    if (!bookingId || !status) throw new Error("Thiếu booking hoặc trạng thái cần cập nhật.");
    await updateOwnerBookingStatus(bookingId, status, "OWNER_STAFF");
    revalidatePath("/owner");
  } catch (error) {
    ownerError("/owner", error);
  }
  redirect(flashUrl("/owner", "success", "Đã cập nhật trạng thái booking."));
}

export async function createHomestayAction(formData: FormData) {
  try {
    await createOwnerHomestay(
      {
        name: requiredText(formData, "name", "tên homestay"),
        type: text(formData, "type") || "Phòng",
        location: requiredText(formData, "location", "vị trí"),
        description: requiredText(formData, "description", "mô tả"),
        priceFrom: nonNegativeNumber(formData, "priceFrom", "Giá khởi điểm"),
        capacity: positiveInteger(formData, "capacity", "Sức chứa"),
        imageUrl: requiredUrl(formData, "imageUrl", "URL hình ảnh chính"),
        ownerId: text(formData, "ownerId") || undefined
      },
      "OWNER"
    );
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã tạo homestay."));
}

export async function createRoomAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để tạo phòng.");
    await createOwnerRoom(
      homestayId,
      {
        name: requiredText(formData, "name", "tên phòng/căn"),
        roomType: text(formData, "roomType") || "Phòng",
        imageUrl: optionalUrl(formData, "imageUrl", "URL ảnh phòng"),
        pricePerNight: nonNegativeNumber(formData, "pricePerNight", "Giá cố định/đêm"),
        capacity: positiveInteger(formData, "capacity", "Sức chứa mỗi phòng/căn"),
        totalUnits: positiveInteger(formData, "totalUnits", "Số lượng phòng/căn cùng loại")
      },
      "OWNER"
    );
    await syncHomestayRoomTotals(homestayId);
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã thêm phòng."));
}

export async function createRoomInlineAction(_state: OwnerFormState, formData: FormData): Promise<OwnerFormState> {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để tạo phòng.");
    await createOwnerRoom(
      homestayId,
      {
        name: requiredText(formData, "name", "tên phòng/căn"),
        roomType: text(formData, "roomType") || "Phòng",
        imageUrl: optionalUrl(formData, "imageUrl", "URL ảnh phòng"),
        pricePerNight: nonNegativeNumber(formData, "pricePerNight", "Giá cố định/đêm"),
        capacity: positiveInteger(formData, "capacity", "Sức chứa mỗi phòng/căn"),
        totalUnits: positiveInteger(formData, "totalUnits", "Số lượng phòng/căn cùng loại")
      },
      "OWNER"
    );
    await syncHomestayRoomTotals(homestayId);
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
    return { type: "success", message: "Đã thêm phòng và tự đồng bộ giá/sức chứa.", nonce: Date.now() };
  } catch (error) {
    return { type: "error", message: actionErrorMessage(error), nonce: Date.now() };
  }
}

export async function createServiceAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để tạo dịch vụ.");
    const included = formData.get("included") === "on";
    await createOwnerService(
      homestayId,
      {
        name: requiredText(formData, "name", "tên dịch vụ"),
        description: text(formData, "description"),
        unitPrice: included ? 0 : nonNegativeNumber(formData, "unitPrice", "Đơn giá"),
        included
      },
      "OWNER"
    );
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  // Kept for older rendered forms that may still post to this server action.
  // The current UI uses createServiceInlineAction for local feedback.
}

export async function createServiceInlineAction(_state: OwnerFormState, formData: FormData): Promise<OwnerFormState> {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để tạo dịch vụ.");
    const included = formData.get("included") === "on";
    await createOwnerService(
      homestayId,
      {
        name: requiredText(formData, "name", "tên dịch vụ"),
        description: text(formData, "description"),
        unitPrice: included ? 0 : nonNegativeNumber(formData, "unitPrice", "Đơn giá"),
        included
      },
      "OWNER"
    );
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
    return {
      type: "success",
      message: included ? "Đã thêm dịch vụ đã bao gồm." : "Đã thêm dịch vụ bổ sung.",
      nonce: Date.now()
    };
  } catch (error) {
    return { type: "error", message: actionErrorMessage(error), nonce: Date.now() };
  }
}

export async function updateHomestayAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để cập nhật.");
    await updateOwnerHomestay(homestayId, {
      name: requiredText(formData, "name", "tên homestay"),
      type: text(formData, "type") || "Phòng",
      location: requiredText(formData, "location", "vị trí"),
      description: requiredText(formData, "description", "mô tả"),
      priceFrom: nonNegativeNumber(formData, "priceFrom", "Giá khởi điểm"),
      capacity: positiveInteger(formData, "capacity", "Sức chứa"),
      imageUrl: requiredUrl(formData, "imageUrl", "URL hình ảnh chính")
    }, "OWNER");
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã lưu homestay."));
}

export async function deleteHomestayAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để ngừng bán.");
    throw new Error("Chức năng ngừng bán toàn bộ homestay chưa có API ẩn an toàn. Hãy ngừng bán từng phòng để không xóa dữ liệu.");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
}

export async function updateRoomAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    const roomId = text(formData, "roomId");
    if (!homestayId || !roomId) throw new Error("Thiếu homestay hoặc phòng để cập nhật.");
    await updateOwnerRoom(homestayId, roomId, {
      name: requiredText(formData, "name", "tên phòng/căn"),
      roomType: text(formData, "roomType") || "Phòng",
      imageUrl: optionalUrl(formData, "imageUrl", "URL ảnh phòng"),
      pricePerNight: nonNegativeNumber(formData, "pricePerNight", "Giá cố định/đêm"),
      capacity: positiveInteger(formData, "capacity", "Sức chứa mỗi phòng/căn"),
      totalUnits: positiveInteger(formData, "totalUnits", "Số lượng phòng/căn cùng loại"),
      active: formData.get("active") === "on"
    }, "OWNER");
    await syncHomestayRoomTotals(homestayId);
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã lưu phòng."));
}

export async function createRoomRateAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    const roomId = text(formData, "roomId");
    if (!homestayId || !roomId) throw new Error("Thiếu homestay hoặc phòng để tạo bảng giá.");
    const startDate = requiredDate(formData, "startDate", "Ngày bắt đầu");
    const endDate = requiredDate(formData, "endDate", "Ngày kết thúc");
    if (new Date(`${endDate}T00:00:00`) < new Date(`${startDate}T00:00:00`)) {
      throw new Error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
    }
    await createOwnerRoomRate(homestayId, roomId, {
      startDate,
      endDate,
      pricePerNight: nonNegativeNumber(formData, "pricePerNight", "Giá theo ngày")
    }, "OWNER");
    revalidatePath("/owner/manage");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã thêm giá theo ngày."));
}

export async function updateServiceAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    const serviceId = text(formData, "serviceId");
    if (!homestayId || !serviceId) throw new Error("Thiếu homestay hoặc dịch vụ để cập nhật.");
    await updateOwnerService(homestayId, serviceId, {
      name: requiredText(formData, "name", "tên dịch vụ"),
      description: text(formData, "description"),
      unitPrice: nonNegativeNumber(formData, "unitPrice", "Đơn giá"),
      included: formData.get("included") === "on",
      active: formData.get("active") === "on"
    }, "OWNER");
    revalidatePath("/owner/manage");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã lưu dịch vụ."));
}

export async function createImageAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để thêm hình ảnh.");
    await createOwnerImage(homestayId, {
      url: requiredUrl(formData, "url", "URL hình ảnh"),
      alt: text(formData, "alt"),
      position: nonNegativeInteger(formData, "position", "Thứ tự ảnh")
    }, "OWNER");
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã thêm hình ảnh."));
}

export async function createProxyBookingAction(formData: FormData) {
  let bookingId = "";
  try {
    const homestayId = text(formData, "homestayId");
    const roomId = text(formData, "roomId");
    const customerId = text(formData, "customerId");
    const serviceItems = Array.from(formData.entries())
      .filter(([key, value]) => key.startsWith("service:") && Number(value) > 0)
      .map(([key, value]) => ({ roomId, serviceId: key.replace("service:", ""), quantity: Number(value) }))
      .filter((item) => item.serviceId && Number.isInteger(item.quantity) && item.quantity > 0);
    if (!homestayId || !roomId) throw new Error("Thiếu homestay hoặc phòng để tạo booking hộ.");
    const booking = await createProxyBooking(
      {
        customerId: customerId || undefined,
        homestayId,
        roomId,
        guestName: text(formData, "guestName"),
        guestPhone: text(formData, "guestPhone"),
        guestCount: Number(formData.get("guestCount") ?? 1),
        checkIn: text(formData, "checkIn"),
        checkOut: text(formData, "checkOut"),
        serviceItems
      },
      "OWNER_STAFF"
    );
    bookingId = booking.id;
    revalidatePath("/owner");
  } catch (error) {
    ownerError("/owner/proxy-booking", error);
  }
  redirect(flashUrl(`/bookings/${bookingId}`, "success", "Đã tạo booking hộ khách."));
}
