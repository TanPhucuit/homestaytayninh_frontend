export type BookingStatus = "PENDING" | "CONFIRMED" | "IN_STAY" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "INITIATED" | "PENDING" | "PAID" | "FAILED" | "CANCELLED";
export type UserRole = "CUSTOMER" | "OWNER" | "OWNER_STAFF" | "STAFF" | "ADMIN";
export type ArticleStatus = "DRAFT" | "PUBLISHED";

export interface Service {
  id: string;
  homestayId: string;
  name: string;
  description?: string;
  unitPrice: number;
  included: boolean;
  active: boolean;
}

export interface Room {
  id: string;
  homestayId: string;
  name: string;
  roomType: string;
  imageUrl?: string;
  pricePerNight: number;
  capacity: number;
  totalUnits: number;
  active: boolean;
}

export interface Homestay {
  id: string;
  ownerId: string;
  name: string;
  type: string;
  location: string;
  description: string;
  priceFrom: number;
  capacity: number;
  rating: number;
  imageUrl: string;
  amenities: string[];
  includedServices: Service[];
  services: Service[];
  rooms: Room[];
  reviews: Array<{ id: string; userId: string; rating: number; comment: string }>;
  images?: Array<{ id: string; url: string; alt: string; position: number }>;
}

export interface Booking {
  id: string;
  customerId: string;
  homestayId: string;
  roomId: string;
  rooms?: Array<Pick<Room, "id" | "name" | "roomType" | "pricePerNight" | "capacity">>;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  roomTotal: number;
  serviceTotal: number;
  taxTotal: number;
  grandTotal: number;
  services: Array<{ id: string; roomId?: string; roomName?: string; name: string; quantity: number; unitPrice: number; total: number; status: string }>;
  includedServices?: Service[];
  payment?: { id: string; provider?: string; status: PaymentStatus; amount: number; checkoutUrl?: string; qrUrl?: string };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  banned: boolean;
  authLinked?: boolean;
}

export interface Article {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  imageUrl?: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
}

export interface ViolationReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
}

export interface DashboardSummary {
  transactions: number;
  revenue: number;
  occupancyRate: number;
  completed: number;
  homestayPerformance: Array<{ name: string; bookings: number }>;
}

export interface CheckoutPreview {
  homestay: Homestay;
  room: Room;
  nights: number;
  guestCount: number;
  includedServices: Service[];
  selectedServices: Array<{ id: string; name: string; quantity: number; unitPrice: number; total: number }>;
  roomTotal: number;
  serviceTotal: number;
  taxTotal: number;
  grandTotal: number;
}
