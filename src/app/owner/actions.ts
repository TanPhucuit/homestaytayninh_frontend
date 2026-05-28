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
  deleteOwnerHomestay,
  updateOwnerBookingStatus,
  updateOwnerHomestay,
  updateOwnerRoom,
  updateOwnerService
} from "@/lib/api";
import { actionErrorMessage } from "@/lib/action-errors";
import { flashUrl } from "@/lib/flash";
import { BookingStatus } from "@/lib/types";

function ownerError(path: string, error: unknown): never {
  redirect(flashUrl(path, "error", actionErrorMessage(error)));
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
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
        name: text(formData, "name"),
        type: text(formData, "type") || "Phòng",
        location: text(formData, "location"),
        description: text(formData, "description"),
        priceFrom: Number(formData.get("priceFrom") ?? 500000),
        capacity: Number(formData.get("capacity") ?? 2),
        imageUrl: text(formData, "imageUrl"),
        ownerId: text(formData, "ownerId") || undefined
      },
      "OWNER"
    );
    revalidatePath("/owner/manage");
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
        name: text(formData, "name"),
        roomType: text(formData, "roomType") || "Phòng",
        imageUrl: text(formData, "imageUrl"),
        pricePerNight: Number(formData.get("pricePerNight") ?? 500000),
        capacity: Number(formData.get("capacity") ?? 2),
        totalUnits: Number(formData.get("totalUnits") ?? 1)
      },
      "OWNER"
    );
    revalidatePath("/owner/manage");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã thêm phòng."));
}

export async function createServiceAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để tạo dịch vụ.");
    await createOwnerService(
      homestayId,
      {
        name: text(formData, "name"),
        description: text(formData, "description"),
        unitPrice: Number(formData.get("unitPrice") ?? 0),
        included: formData.get("included") === "on"
      },
      "OWNER"
    );
    revalidatePath("/owner/manage");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã thêm dịch vụ."));
}

export async function updateHomestayAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để cập nhật.");
    await updateOwnerHomestay(homestayId, {
      name: text(formData, "name"),
      type: text(formData, "type") || "Phòng",
      location: text(formData, "location"),
      description: text(formData, "description"),
      priceFrom: Number(formData.get("priceFrom") ?? 0),
      capacity: Number(formData.get("capacity") ?? 1),
      imageUrl: text(formData, "imageUrl")
    }, "OWNER");
    revalidatePath("/owner/manage");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã lưu homestay."));
}

export async function deleteHomestayAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    if (!homestayId) throw new Error("Thiếu homestay để xóa.");
    await deleteOwnerHomestay(homestayId, "OWNER");
    revalidatePath("/owner/manage");
    revalidatePath("/homestays");
  } catch (error) {
    ownerError("/owner/manage", error);
  }
  redirect(flashUrl("/owner/manage", "success", "Đã xóa homestay khỏi danh sách bán."));
}

export async function updateRoomAction(formData: FormData) {
  try {
    const homestayId = text(formData, "homestayId");
    const roomId = text(formData, "roomId");
    if (!homestayId || !roomId) throw new Error("Thiếu homestay hoặc phòng để cập nhật.");
    await updateOwnerRoom(homestayId, roomId, {
      name: text(formData, "name"),
      roomType: text(formData, "roomType") || "Phòng",
      imageUrl: text(formData, "imageUrl"),
      pricePerNight: Number(formData.get("pricePerNight") ?? 0),
      capacity: Number(formData.get("capacity") ?? 1),
      totalUnits: Number(formData.get("totalUnits") ?? 1),
      active: formData.get("active") === "on"
    }, "OWNER");
    revalidatePath("/owner/manage");
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
    await createOwnerRoomRate(homestayId, roomId, {
      startDate: text(formData, "startDate"),
      endDate: text(formData, "endDate"),
      pricePerNight: Number(formData.get("pricePerNight") ?? 0)
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
      name: text(formData, "name"),
      description: text(formData, "description"),
      unitPrice: Number(formData.get("unitPrice") ?? 0),
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
      url: text(formData, "url"),
      alt: text(formData, "alt"),
      position: Number(formData.get("position") ?? 0)
    }, "OWNER");
    revalidatePath("/owner/manage");
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
