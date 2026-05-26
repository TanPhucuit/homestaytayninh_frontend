import { Article, Booking, Homestay, UserProfile, ViolationReport } from "./types";

export const demoHomestays: Homestay[] = [
  {
    id: "hs-ba-den",
    ownerId: "u-owner",
    name: "Terra Leaf Núi Bà",
    type: "Nhà nguyên căn",
    location: "Thạnh Tân, Tây Ninh",
    description: "Villa gỗ nằm dưới chân núi Bà Đen, có sân BBQ, bếp riêng, hồ bơi nhỏ và không gian nghỉ dưỡng theo tinh thần Terra & Leaf.",
    priceFrom: 1450000,
    capacity: 8,
    rating: 4.8,
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Wifi", "Bếp riêng", "Sân BBQ", "Hồ bơi", "Bãi đậu xe"],
    rooms: [{ id: "room-ba-den-family", homestayId: "hs-ba-den", name: "Villa Gỗ Sồi", roomType: "Nhà nguyên căn", pricePerNight: 1450000, capacity: 8, totalUnits: 1, active: true }],
    includedServices: [{ id: "svc-breakfast", homestayId: "hs-ba-den", name: "Bữa sáng bản địa", unitPrice: 0, included: true, active: true }],
    services: [
      { id: "svc-bbq", homestayId: "hs-ba-den", name: "Tiệc BBQ sân vườn", unitPrice: 650000, included: false, active: true },
      { id: "svc-trekking", homestayId: "hs-ba-den", name: "Trekking Núi Bà", unitPrice: 450000, included: false, active: true }
    ],
    reviews: [{ id: "rev-1", userId: "u-customer", rating: 5, comment: "Không gian đẹp, gần núi, nhân viên hỗ trợ nhanh." }]
  },
  {
    id: "hs-trang-bang",
    ownerId: "u-owner",
    name: "Soft Sand Trảng Bàng",
    type: "Phòng",
    location: "Trảng Bàng, Tây Ninh",
    description: "Phòng riêng phong cách tối giản, phù hợp cặp đôi và khách công tác ngắn ngày.",
    priceFrom: 690000,
    capacity: 2,
    rating: 4.6,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    amenities: ["Wifi", "Máy lạnh", "Ăn sáng", "Giữ hành lý"],
    rooms: [{ id: "room-trang-bang-deluxe", homestayId: "hs-trang-bang", name: "Deluxe Soft Sand", roomType: "Phòng", pricePerNight: 690000, capacity: 2, totalUnits: 6, active: true }],
    includedServices: [{ id: "svc-welcome", homestayId: "hs-trang-bang", name: "Nước chào mừng", unitPrice: 0, included: true, active: true }],
    services: [
      { id: "svc-bike", homestayId: "hs-trang-bang", name: "Thuê xe máy", unitPrice: 180000, included: false, active: true },
      { id: "svc-water", homestayId: "hs-trang-bang", name: "Nước uống thêm", unitPrice: 20000, included: false, active: true }
    ],
    reviews: [{ id: "rev-2", userId: "u-customer", rating: 4, comment: "Sạch sẽ, tiện di chuyển." }]
  }
];

export const demoBookings: Booking[] = [
  {
    id: "bk-pending-1",
    customerId: "u-customer",
    homestayId: "hs-ba-den",
    roomId: "room-ba-den-family",
    guestName: "Minh Anh",
    guestPhone: "0901000001",
    guestCount: 3,
    checkIn: "2026-05-28",
    checkOut: "2026-05-29",
    status: "PENDING",
    roomTotal: 1450000,
    serviceTotal: 0,
    taxTotal: 145000,
    grandTotal: 1595000,
    services: [],
    payment: { id: "pay-pending-1", status: "INITIATED", amount: 1595000, checkoutUrl: "/checkout" }
  },
  {
    id: "bk-demo-1",
    customerId: "u-customer",
    homestayId: "hs-ba-den",
    roomId: "room-ba-den-family",
    guestName: "Minh Anh",
    guestPhone: "0901000001",
    guestCount: 4,
    checkIn: "2026-05-28",
    checkOut: "2026-05-30",
    status: "IN_STAY",
    roomTotal: 2900000,
    serviceTotal: 650000,
    taxTotal: 0,
    grandTotal: 3550000,
    services: [{ id: "bs-demo-1", name: "Tiệc BBQ sân vườn", quantity: 1, unitPrice: 650000, total: 650000, status: "PREPARING" }],
    payment: { id: "pay-demo-1", status: "PAID", amount: 3550000, checkoutUrl: "/bookings" }
  },
  {
    id: "bk-upcoming-1",
    customerId: "u-customer",
    homestayId: "hs-trang-bang",
    roomId: "room-trang-bang-deluxe",
    guestName: "Minh Anh",
    guestPhone: "0901000001",
    guestCount: 2,
    checkIn: "2026-06-12",
    checkOut: "2026-06-14",
    status: "CONFIRMED",
    roomTotal: 1380000,
    serviceTotal: 180000,
    taxTotal: 156000,
    grandTotal: 1716000,
    services: [{ id: "bs-upcoming-1", name: "Thuê xe máy", quantity: 1, unitPrice: 180000, total: 180000, status: "PREPARING" }],
    payment: { id: "pay-upcoming-1", status: "PENDING", amount: 1716000, checkoutUrl: "/checkout" }
  },
  {
    id: "bk-completed-1",
    customerId: "u-customer",
    homestayId: "hs-ba-den",
    roomId: "room-ba-den-family",
    guestName: "Minh Anh",
    guestPhone: "0901000001",
    guestCount: 4,
    checkIn: "2026-04-20",
    checkOut: "2026-04-22",
    status: "COMPLETED",
    roomTotal: 2900000,
    serviceTotal: 650000,
    taxTotal: 355000,
    grandTotal: 3905000,
    services: [{ id: "bs-completed-1", name: "Tiệc BBQ sân vườn", quantity: 1, unitPrice: 650000, total: 650000, status: "SERVED" }],
    payment: { id: "pay-completed-1", status: "PAID", amount: 3905000, checkoutUrl: "/bookings" }
  },
  {
    id: "bk-cancelled-1",
    customerId: "u-customer",
    homestayId: "hs-trang-bang",
    roomId: "room-trang-bang-deluxe",
    guestName: "Minh Anh",
    guestPhone: "0901000001",
    guestCount: 2,
    checkIn: "2026-03-05",
    checkOut: "2026-03-06",
    status: "CANCELLED",
    roomTotal: 690000,
    serviceTotal: 0,
    taxTotal: 0,
    grandTotal: 690000,
    services: [],
    payment: { id: "pay-cancelled-1", status: "CANCELLED", amount: 690000, checkoutUrl: "/bookings" }
  }
];

export const demoUsers: UserProfile[] = [
  { id: "u-customer", name: "Nguyễn Văn A", email: "customer@homestay.vn", phone: "0901000001", role: "CUSTOMER", banned: false },
  { id: "u-owner", name: "Lê Thị Hạnh", email: "owner@homestay.vn", phone: "0901000002", role: "OWNER", banned: false },
  { id: "u-owner-staff", name: "Trần Minh Quân", email: "staff-owner@homestay.vn", phone: "0901000003", role: "OWNER_STAFF", banned: false },
  { id: "u-staff", name: "Content Staff", email: "staff@homestay.vn", role: "STAFF", banned: false },
  { id: "u-admin", name: "System Admin", email: "admin@homestay.vn", role: "ADMIN", banned: false },
  { id: "u-spam", name: "hacker123", email: "spam@example.com", role: "CUSTOMER", banned: true }
];

export const demoArticles: Article[] = [
  {
    id: "art-1",
    authorId: "u-staff",
    title: "Cẩm nang leo núi Bà Đen mùa khô",
    slug: "cam-nang-leo-nui-ba-den-mua-kho",
    excerpt: "Lịch trình, vật dụng cần chuẩn bị và lưu ý an toàn khi nghỉ gần núi Bà Đen.",
    content: "Mùa khô là thời điểm lý tưởng để khám phá núi Bà Đen.",
    status: "DRAFT"
  },
  {
    id: "art-2",
    authorId: "u-staff",
    title: "Top 5 món ăn Trảng Bàng chuẩn vị",
    slug: "top-5-mon-an-trang-bang",
    excerpt: "Gợi ý ẩm thực địa phương cho khách lưu trú tại Tây Ninh.",
    content: "Bánh canh Trảng Bàng là điểm nhấn không nên bỏ qua.",
    status: "PUBLISHED"
  }
];

export const demoReports: ViolationReport[] = [
  {
    id: "report-1",
    reporterId: "u-customer",
    reportedUserId: "u-spam",
    reason: "Spam bình luận trong bài viết du lịch",
    status: "OPEN",
    createdAt: "2026-05-25T10:00:00.000Z"
  },
  {
    id: "report-2",
    reporterId: "u-owner",
    reportedUserId: "u-customer",
    reason: "Nghi ngờ đánh giá giả mạo homestay",
    status: "OPEN",
    createdAt: "2026-05-25T11:00:00.000Z"
  }
];
