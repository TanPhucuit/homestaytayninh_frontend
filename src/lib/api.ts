import { apiGet, apiMutation, withMockFallback } from "./api-client";
import { endpoints } from "./endpoints";
import { bookingsForRole, createMockCheckoutPreview, findMockBooking, findMockHomestay, mockDataSource } from "./mock-data-source";
import { Article, Booking, CheckoutPreview, DashboardSummary, Homestay, PaymentStatus, UserProfile, UserRole, ViolationReport } from "./types";

export const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export interface HomestayFilters {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  type?: string;
  maxPrice?: string;
  amenity?: string;
}

function queryString(filters?: HomestayFilters) {
  const params = new URLSearchParams();
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function getHomestays(role: UserRole = "CUSTOMER", filters?: HomestayFilters): Promise<Homestay[]> {
  return withMockFallback(() => apiGet<Homestay[]>(`${endpoints.homestays.list}${queryString(filters)}`, role), mockDataSource.homestays);
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

export async function createUser(input: { name: string; email: string; phone?: string; role: UserRole }, role: UserRole = "ADMIN"): Promise<UserProfile> {
  return apiMutation<UserProfile>(endpoints.admin.users, "POST", input, role);
}

export async function assignUserRole(userId: string, nextRole: UserRole, role: UserRole = "ADMIN"): Promise<UserProfile> {
  return apiMutation<UserProfile>(endpoints.admin.role(userId), "POST", { role: nextRole }, role);
}

export async function setUserBanned(userId: string, banned: boolean, role: UserRole = "ADMIN"): Promise<UserProfile> {
  return apiMutation<UserProfile>(banned ? endpoints.admin.ban(userId) : endpoints.admin.unban(userId), "POST", undefined, role);
}

export async function addBookingService(bookingId: string, serviceId: string, quantity: number, role: UserRole = "CUSTOMER"): Promise<Booking> {
  return apiMutation<Booking>(endpoints.bookings.addService(bookingId), "POST", { serviceId, quantity }, role);
}

export async function createBooking(
  input: {
    homestayId: string;
    roomId: string;
    guestName: string;
    guestPhone: string;
    guestCount: number;
    checkIn: string;
    checkOut: string;
    serviceItems?: Array<{ serviceId: string; quantity: number }>;
  },
  role: UserRole = "CUSTOMER"
): Promise<Booking> {
  return apiMutation<Booking>(endpoints.bookings.create, "POST", input, role);
}

export async function initiatePayment(bookingId: string, role: UserRole = "CUSTOMER"): Promise<NonNullable<Booking["payment"]>> {
  return apiMutation<NonNullable<Booking["payment"]>>(endpoints.payments.initiate, "POST", { bookingId }, role);
}

export async function getPaymentStatus(bookingId: string, role: UserRole = "CUSTOMER"): Promise<NonNullable<Booking["payment"]> | null> {
  return withMockFallback(
    () => apiGet<NonNullable<Booking["payment"]> | null>(endpoints.payments.status(bookingId), role),
    findMockBooking(bookingId).payment ?? { id: `mock-${bookingId}`, status: "PENDING" as PaymentStatus, amount: findMockBooking(bookingId).grandTotal }
  );
}

export async function getOwnerHomestays(role: UserRole = "OWNER"): Promise<Homestay[]> {
  return withMockFallback(() => apiGet<Homestay[]>(endpoints.owner.homestays, role), mockDataSource.homestays);
}

export async function getOwnerBookings(role: UserRole = "OWNER_STAFF"): Promise<Booking[]> {
  return withMockFallback(() => apiGet<Booking[]>(endpoints.owner.bookings, role), bookingsForRole(role));
}

export async function createOwnerHomestay(input: Partial<Homestay>, role: UserRole = "OWNER"): Promise<Homestay> {
  return apiMutation<Homestay>(endpoints.owner.homestays, "POST", input, role);
}

export async function createOwnerRoom(homestayId: string, input: { name: string; roomType: string; pricePerNight: number; capacity: number; totalUnits: number }, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.rooms(homestayId), "POST", input, role);
}

export async function createOwnerService(homestayId: string, input: { name: string; description?: string; unitPrice: number; included: boolean }, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.services(homestayId), "POST", input, role);
}

export async function updateOwnerBookingStatus(bookingId: string, status: Booking["status"], role: UserRole = "OWNER_STAFF"): Promise<Booking> {
  return apiMutation<Booking>(endpoints.owner.bookingStatus(bookingId), "PATCH", { status }, role);
}

export async function createProxyBooking(
  input: {
    customerId?: string;
    homestayId: string;
    roomId: string;
    guestName: string;
    guestPhone: string;
    guestCount: number;
    checkIn: string;
    checkOut: string;
    serviceItems?: Array<{ serviceId: string; quantity: number }>;
  },
  role: UserRole = "OWNER_STAFF"
): Promise<Booking> {
  return apiMutation<Booking>(endpoints.owner.proxyBookings, "POST", input, role);
}

export async function addOwnerBookingService(bookingId: string, serviceId: string, quantity: number, role: UserRole = "OWNER_STAFF"): Promise<Booking> {
  return apiMutation<Booking>(`${endpoints.owner.bookings}/${bookingId}/services`, "POST", { serviceId, quantity }, role);
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
