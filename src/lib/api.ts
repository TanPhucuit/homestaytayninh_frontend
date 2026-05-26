import { apiGet, apiMutation } from "./api-client";
import { endpoints } from "./endpoints";
import { Article, Booking, CheckoutPreview, DashboardSummary, Homestay, Room, Service, UserProfile, UserRole, ViolationReport } from "./types";

export const money = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export interface HomestayFilters {
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  type?: string;
  maxPrice?: string;
  amenity?: string;
}

export interface CheckoutDraft {
  homestayId?: string;
  roomId?: string;
  guestName?: string;
  guestPhone?: string;
  guestCount?: string;
  checkIn?: string;
  checkOut?: string;
  serviceItems?: Array<{ serviceId: string; quantity: number }>;
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
  return apiGet<Homestay[]>(`${endpoints.homestays.list}${queryString(filters)}`, role);
}

export async function getHomestay(id: string, role: UserRole = "CUSTOMER"): Promise<Homestay> {
  return apiGet<Homestay>(endpoints.homestays.detail(id), role);
}

export async function getBookings(role: UserRole = "CUSTOMER"): Promise<Booking[]> {
  return apiGet<Booking[]>(endpoints.bookings.mine, role, { cache: "no-store" });
}

export async function getBooking(id: string, role: UserRole = "CUSTOMER"): Promise<Booking> {
  return apiGet<Booking>(endpoints.bookings.detail(id), role, { cache: "no-store" });
}

export async function getDashboard(role: UserRole = "ADMIN"): Promise<DashboardSummary> {
  return apiGet<DashboardSummary>(endpoints.admin.dashboard, role);
}

export async function getArticles(role: UserRole = "STAFF"): Promise<Article[]> {
  return apiGet<Article[]>(endpoints.cms.articles, role);
}

export async function getPublishedArticles(): Promise<Article[]> {
  return apiGet<Article[]>(endpoints.cms.publicArticles, "CUSTOMER", { cache: "no-store" });
}

export async function getPublishedArticle(slug: string): Promise<Article> {
  return apiGet<Article>(endpoints.cms.publicArticle(slug), "CUSTOMER", { cache: "no-store" });
}

export async function createArticle(input: Partial<Article>, role: UserRole = "STAFF"): Promise<Article> {
  return apiMutation<Article>(endpoints.cms.articles, "POST", input, role);
}

export async function updateArticle(articleId: string, input: Partial<Article>, role: UserRole = "STAFF"): Promise<Article> {
  return apiMutation<Article>(endpoints.cms.article(articleId), "PATCH", input, role);
}

export async function deleteArticle(articleId: string, role: UserRole = "STAFF"): Promise<Article> {
  return apiMutation<Article>(endpoints.cms.article(articleId), "DELETE", undefined, role);
}

export async function setArticlePublished(articleId: string, published: boolean, role: UserRole = "STAFF"): Promise<Article> {
  return apiMutation<Article>(published ? endpoints.cms.publish(articleId) : endpoints.cms.unpublish(articleId), "POST", undefined, role);
}

export async function getUsers(role: UserRole = "ADMIN"): Promise<UserProfile[]> {
  return apiGet<UserProfile[]>(endpoints.admin.users, role);
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

export async function updateBookingStatus(bookingId: string, status: Booking["status"], role: UserRole = "CUSTOMER"): Promise<Booking> {
  return apiMutation<Booking>(endpoints.bookings.status(bookingId), "PATCH", { status }, role);
}

export async function setBookingServiceStatus(bookingId: string, serviceOrderId: string, status: "PREPARING" | "SERVED", role: UserRole = "OWNER_STAFF") {
  return apiMutation(endpoints.bookings.serviceStatus(bookingId, serviceOrderId), "PATCH", { status }, role);
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
  return apiGet<NonNullable<Booking["payment"]> | null>(endpoints.payments.status(bookingId), role, { cache: "no-store" });
}

export async function getOwnerHomestays(role: UserRole = "OWNER"): Promise<Homestay[]> {
  return apiGet<Homestay[]>(endpoints.owner.homestays, role);
}

export async function getOwnerBookings(role: UserRole = "OWNER_STAFF"): Promise<Booking[]> {
  return apiGet<Booking[]>(endpoints.owner.bookings, role, { cache: "no-store" });
}

export async function createOwnerHomestay(input: Partial<Homestay>, role: UserRole = "OWNER"): Promise<Homestay> {
  return apiMutation<Homestay>(endpoints.owner.homestays, "POST", input, role);
}

export async function updateOwnerHomestay(homestayId: string, input: Partial<Homestay>, role: UserRole = "OWNER"): Promise<Homestay> {
  return apiMutation<Homestay>(endpoints.owner.homestay(homestayId), "PATCH", input, role);
}

export async function createOwnerRoom(homestayId: string, input: { name: string; roomType: string; pricePerNight: number; capacity: number; totalUnits: number }, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.rooms(homestayId), "POST", input, role);
}

export async function updateOwnerRoom(homestayId: string, roomId: string, input: Partial<Room>, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.room(homestayId, roomId), "PATCH", input, role);
}

export async function createOwnerRoomRate(homestayId: string, roomId: string, input: { startDate: string; endDate: string; pricePerNight: number }, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.rates(homestayId, roomId), "POST", input, role);
}

export async function createOwnerService(homestayId: string, input: { name: string; description?: string; unitPrice: number; included: boolean }, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.services(homestayId), "POST", input, role);
}

export async function updateOwnerService(homestayId: string, serviceId: string, input: Partial<Service>, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.service(homestayId, serviceId), "PATCH", input, role);
}

export async function createOwnerImage(homestayId: string, input: { url: string; alt?: string; position?: number }, role: UserRole = "OWNER") {
  return apiMutation(endpoints.owner.images(homestayId), "POST", input, role);
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
  return apiGet<ViolationReport[]>(endpoints.admin.reports, role);
}

export async function resolveViolationReport(reportId: string, role: UserRole = "STAFF"): Promise<ViolationReport> {
  return apiMutation<ViolationReport>(endpoints.admin.resolveReport(reportId), "POST", undefined, role);
}

export async function getCheckoutPreview(draftOrHomestayId?: string | CheckoutDraft, role: UserRole = "CUSTOMER"): Promise<CheckoutPreview> {
  const draft: CheckoutDraft = typeof draftOrHomestayId === "string" ? { homestayId: draftOrHomestayId } : (draftOrHomestayId ?? {});
  const firstHomestayId = draft.homestayId ?? (await getHomestays(role))[0]?.id;
  if (!firstHomestayId) {
    throw new Error("Không có homestay khả dụng để đặt.");
  }
  const homestay = await getHomestay(firstHomestayId, role);
  const room = homestay.rooms.find((item) => item.id === draft.roomId) ?? homestay.rooms[0];
  if (!room) {
    throw new Error("Homestay chưa có phòng khả dụng để đặt.");
  }
  if (draft.roomId && room.id !== draft.roomId) {
    throw new Error("Phòng đã chọn không khả dụng cho homestay này.");
  }
  const start = draft.checkIn ? new Date(draft.checkIn).getTime() : NaN;
  const end = draft.checkOut ? new Date(draft.checkOut).getTime() : NaN;
  const nights = Number.isFinite(start) && Number.isFinite(end) && end > start ? Math.ceil((end - start) / 86_400_000) : 2;
  const requestedGuests = Number(draft.guestCount ?? 2);
  const guestCount = Math.min(Number.isFinite(requestedGuests) && requestedGuests > 0 ? requestedGuests : 1, room.capacity);
  const selectedServices = (draft.serviceItems ?? []).map((item) => {
    const service = homestay.services.find((candidate) => candidate.id === item.serviceId);
    if (!service || !Number.isInteger(item.quantity) || item.quantity < 1) return null;
    return { id: service.id, name: service.name, quantity: item.quantity, unitPrice: service.unitPrice, total: service.unitPrice * item.quantity };
  }).filter((item): item is CheckoutPreview["selectedServices"][number] => Boolean(item));
  const roomTotal = room.pricePerNight * nights;
  const serviceTotal = selectedServices.reduce((sum, item) => sum + item.total, 0);
  const taxTotal = Math.round((roomTotal + serviceTotal) * 0.1);

  return {
    homestay,
    room,
    nights,
    guestCount,
    includedServices: homestay.includedServices,
    selectedServices,
    roomTotal,
    serviceTotal,
    taxTotal,
    grandTotal: roomTotal + serviceTotal + taxTotal
  };
}
