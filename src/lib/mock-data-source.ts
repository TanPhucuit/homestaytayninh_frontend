import { demoArticles, demoBookings, demoHomestays, demoReports, demoUsers } from "./demo-data";
import { Booking, CheckoutPreview, DashboardSummary, Service, UserRole } from "./types";

export const mockDataSource = {
  homestays: demoHomestays,
  bookings: demoBookings,
  articles: demoArticles,
  users: demoUsers,
  reports: demoReports,
  dashboard: {
    transactions: 12,
    revenue: 48600000,
    occupancyRate: 68,
    completed: 7,
    homestayPerformance: [{ name: "Terra Leaf Nui Ba", bookings: 8 }]
  } satisfies DashboardSummary,
  defaultIncludedServices: [
    { id: "included-breakfast", homestayId: "mock", name: "Bữa sáng bản địa", description: "Phục vụ 7:00 - 9:30 hằng ngày", unitPrice: 0, included: true, active: true },
    { id: "included-welcome", homestayId: "mock", name: "Nước chào mừng", description: "Trà thảo mộc khi nhận phòng", unitPrice: 0, included: true, active: true },
    { id: "included-wifi", homestayId: "mock", name: "Wifi tốc độ cao", description: "Bao gồm trong giá phòng", unitPrice: 0, included: true, active: true }
  ] satisfies Service[]
};

export function findMockHomestay(id: string) {
  return mockDataSource.homestays.find((item) => item.id === id) ?? mockDataSource.homestays[0];
}

export function findMockBooking(id: string) {
  return mockDataSource.bookings.find((item) => item.id === id) ?? mockDataSource.bookings[0];
}

export function bookingsForRole(role: UserRole): Booking[] {
  if (role === "ADMIN" || role === "OWNER" || role === "OWNER_STAFF") return mockDataSource.bookings;
  return mockDataSource.bookings.filter((booking) => booking.customerId === "u-customer");
}

export function createMockCheckoutPreview(homestayId = "hs-ba-den"): CheckoutPreview {
  const homestay = findMockHomestay(homestayId);
  const room = homestay.rooms[0];
  const nights = 2;
  const selectedServices = homestay.services.slice(0, 2).map((service, index) => ({
    id: service.id,
    name: service.name,
    quantity: index === 0 ? 1 : 2,
    unitPrice: service.unitPrice,
    total: service.unitPrice * (index === 0 ? 1 : 2)
  }));
  const roomTotal = room.pricePerNight * nights;
  const serviceTotal = selectedServices.reduce((sum, service) => sum + service.total, 0);
  const taxTotal = Math.round((roomTotal + serviceTotal) * 0.1);

  return {
    homestay,
    room,
    nights,
    guestCount: 2,
    includedServices: homestay.includedServices.length > 0 ? homestay.includedServices : mockDataSource.defaultIncludedServices,
    selectedServices,
    roomTotal,
    serviceTotal,
    taxTotal,
    grandTotal: roomTotal + serviceTotal + taxTotal
  };
}

