"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createOwnerHomestay,
  createOwnerImage,
  createOwnerRoomRate,
  createOwnerRoom,
  createOwnerService,
  createProxyBooking,
  updateOwnerBookingStatus,
  updateOwnerHomestay,
  updateOwnerRoom,
  updateOwnerService
} from "@/lib/api";
import { BookingStatus } from "@/lib/types";

export async function updateOwnerBookingStatusAction(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const status = String(formData.get("status") ?? "") as BookingStatus;
  if (!bookingId || !status) return;
  await updateOwnerBookingStatus(bookingId, status, "OWNER_STAFF");
  revalidatePath("/owner");
}

export async function createHomestayAction(formData: FormData) {
  await createOwnerHomestay(
    {
      name: String(formData.get("name") ?? "").trim(),
      type: String(formData.get("type") ?? "Phòng"),
      location: String(formData.get("location") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      priceFrom: Number(formData.get("priceFrom") ?? 500000),
      capacity: Number(formData.get("capacity") ?? 2),
      imageUrl: String(formData.get("imageUrl") ?? "").trim()
    },
    "OWNER"
  );
  revalidatePath("/owner/manage");
}

export async function createRoomAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  if (!homestayId) return;
  await createOwnerRoom(
    homestayId,
    {
      name: String(formData.get("name") ?? "").trim(),
      roomType: String(formData.get("roomType") ?? "Phòng"),
      pricePerNight: Number(formData.get("pricePerNight") ?? 500000),
      capacity: Number(formData.get("capacity") ?? 2),
      totalUnits: Number(formData.get("totalUnits") ?? 1)
    },
    "OWNER"
  );
  revalidatePath("/owner/manage");
}

export async function createServiceAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  if (!homestayId) return;
  await createOwnerService(
    homestayId,
    {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      unitPrice: Number(formData.get("unitPrice") ?? 0),
      included: formData.get("included") === "on"
    },
    "OWNER"
  );
  revalidatePath("/owner/manage");
}

export async function updateHomestayAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  if (!homestayId) return;
  await updateOwnerHomestay(homestayId, {
    name: String(formData.get("name") ?? "").trim(),
    type: String(formData.get("type") ?? "Phòng"),
    location: String(formData.get("location") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceFrom: Number(formData.get("priceFrom") ?? 0),
    capacity: Number(formData.get("capacity") ?? 1),
    imageUrl: String(formData.get("imageUrl") ?? "").trim()
  }, "OWNER");
  revalidatePath("/owner/manage");
}

export async function updateRoomAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  const roomId = String(formData.get("roomId") ?? "");
  if (!homestayId || !roomId) return;
  await updateOwnerRoom(homestayId, roomId, {
    name: String(formData.get("name") ?? "").trim(),
    roomType: String(formData.get("roomType") ?? "Phòng"),
    pricePerNight: Number(formData.get("pricePerNight") ?? 0),
    capacity: Number(formData.get("capacity") ?? 1),
    totalUnits: Number(formData.get("totalUnits") ?? 1),
    active: formData.get("active") === "on"
  }, "OWNER");
  revalidatePath("/owner/manage");
}

export async function createRoomRateAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  const roomId = String(formData.get("roomId") ?? "");
  if (!homestayId || !roomId) return;
  await createOwnerRoomRate(homestayId, roomId, {
    startDate: String(formData.get("startDate") ?? ""),
    endDate: String(formData.get("endDate") ?? ""),
    pricePerNight: Number(formData.get("pricePerNight") ?? 0)
  }, "OWNER");
  revalidatePath("/owner/manage");
}

export async function updateServiceAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  if (!homestayId || !serviceId) return;
  await updateOwnerService(homestayId, serviceId, {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    unitPrice: Number(formData.get("unitPrice") ?? 0),
    included: formData.get("included") === "on",
    active: formData.get("active") === "on"
  }, "OWNER");
  revalidatePath("/owner/manage");
}

export async function createImageAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  if (!homestayId) return;
  await createOwnerImage(homestayId, {
    url: String(formData.get("url") ?? "").trim(),
    alt: String(formData.get("alt") ?? "").trim(),
    position: Number(formData.get("position") ?? 0)
  }, "OWNER");
  revalidatePath("/owner/manage");
}

export async function createProxyBookingAction(formData: FormData) {
  const homestayId = String(formData.get("homestayId") ?? "");
  const roomId = String(formData.get("roomId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const serviceQuantity = Number(formData.get("serviceQuantity") ?? 0);
  const customerId = String(formData.get("customerId") ?? "").trim();
  const booking = await createProxyBooking(
    {
      customerId: customerId || undefined,
      homestayId,
      roomId,
      guestName: String(formData.get("guestName") ?? "").trim(),
      guestPhone: String(formData.get("guestPhone") ?? "").trim(),
      guestCount: Number(formData.get("guestCount") ?? 1),
      checkIn: String(formData.get("checkIn") ?? ""),
      checkOut: String(formData.get("checkOut") ?? ""),
      serviceItems: serviceId && serviceQuantity > 0 ? [{ serviceId, quantity: serviceQuantity }] : []
    },
    "OWNER_STAFF"
  );
  redirect(`/bookings/${booking.id}`);
}
