import { apiGet, withMockFallback } from "./api-client";
import { endpoints } from "./endpoints";
import { bookingsForRole, createMockCheckoutPreview, findMockBooking, findMockHomestay, mockDataSource } from "./mock-data-source";
import { Article, Booking, CheckoutPreview, DashboardSummary, Homestay, UserProfile, UserRole, ViolationReport } from "./types";

export const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export async function getHomestays(role: UserRole = "CUSTOMER"): Promise<Homestay[]> {
  return withMockFallback(() => apiGet<Homestay[]>(endpoints.homestays.list, role), mockDataSource.homestays);
}

export async function getHomestay(id: string, role: UserRole = "CUSTOMER"): Promise<Homestay> {
  return withMockFallback(() => apiGet<Homestay>(endpoints.homestays.detail(id), role), findMockHomestay(id));
}

export async function getBookings(role: UserRole = "CUSTOMER"): Promise<Booking[]> {
  return withMockFallback(() => apiGet<Booking[]>(endpoints.bookings.mine, role), bookingsForRole(role));
}

export async function getBooking(id: string, role: UserRole = "CUSTOMER"): Promise<Booking> {
  const fallback = findMockBooking(id);
  const booking = await withMockFallback(() => apiGet<Booking>(endpoints.bookings.detail(id), role), fallback);
  const homestay = findMockHomestay(booking.homestayId);
  return {
    ...booking,
    includedServices: booking.includedServices ?? homestay.includedServices ?? mockDataSource.defaultIncludedServices
  };
}

export async function getDashboard(role: UserRole = "ADMIN"): Promise<DashboardSummary> {
  return withMockFallback(() => apiGet<DashboardSummary>(endpoints.admin.dashboard, role), mockDataSource.dashboard);
}

export async function getArticles(role: UserRole = "STAFF"): Promise<Article[]> {
  return withMockFallback(() => apiGet<Article[]>(endpoints.cms.articles, role), mockDataSource.articles);
}

export async function getUsers(role: UserRole = "ADMIN"): Promise<UserProfile[]> {
  return withMockFallback(() => apiGet<UserProfile[]>(endpoints.admin.users, role), mockDataSource.users);
}

export async function getViolationReports(role: UserRole = "STAFF"): Promise<ViolationReport[]> {
  return withMockFallback(() => apiGet<ViolationReport[]>(endpoints.admin.reports, role), mockDataSource.reports);
}

export async function getCheckoutPreview(homestayId = "hs-ba-den", role: UserRole = "CUSTOMER"): Promise<CheckoutPreview> {
  const homestay = await getHomestay(homestayId, role);
  const fallback = createMockCheckoutPreview(homestay.id);
  const selectedServices = homestay.services.slice(0, 2).map((service, index) => ({
    id: service.id,
    name: service.name,
    quantity: index === 0 ? 1 : 2,
    unitPrice: service.unitPrice,
    total: service.unitPrice * (index === 0 ? 1 : 2)
  }));
  const room = homestay.rooms[0] ?? fallback.room;
  const roomTotal = room.pricePerNight * fallback.nights;
  const serviceTotal = selectedServices.reduce((sum, service) => sum + service.total, 0);
  const taxTotal = Math.round((roomTotal + serviceTotal) * 0.1);

  return {
    ...fallback,
    homestay,
    room,
    includedServices: homestay.includedServices.length > 0 ? homestay.includedServices : fallback.includedServices,
    selectedServices,
    roomTotal,
    serviceTotal,
    taxTotal,
    grandTotal: roomTotal + serviceTotal + taxTotal
  };
}
