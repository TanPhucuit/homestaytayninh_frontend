import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./session-cookie";
import { UserRole } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  authenticated: boolean;
  authorizationError?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

const guestUser: SessionUser = { id: "", name: "Khách", email: "", role: "CUSTOMER", authenticated: false };

export function normalizeRole(value?: string | null): UserRole {
  return parseRole(value) ?? "CUSTOMER";
}

export function parseRole(value?: string | null): UserRole | null {
  const role = String(value ?? "").toUpperCase();
  if (role === "CUSTOMER" || role === "OWNER" || role === "OWNER_STAFF" || role === "STAFF" || role === "ADMIN") {
    return role;
  }
  return null;
}

export async function getCurrentUser(): Promise<SessionUser> {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return guestUser;

  if (!API_URL) {
    return {
      id: "",
      name: "Người dùng đã đăng nhập",
      email: "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: "Hệ thống đăng nhập chưa sẵn sàng. Vui lòng thử lại sau."
    };
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    cache: "no-store",
    headers: { authorization: `Bearer ${token}` }
  }).catch(() => null);

  if (!response?.ok) {
    const serviceError = response ? "Hệ thống đang xử lý chưa ổn định." : "Không kết nối được hệ thống đăng nhập.";
    return {
      id: "",
      name: "Người dùng đã đăng nhập",
      email: "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: `Không thể xác minh vai trò tài khoản. ${serviceError}`
    };
  }

  const profile = (await response.json()) as Partial<SessionUser>;
  const role = parseRole(profile.role);
  if (!role) {
    return {
      id: profile.id ?? "",
      name: profile.name ?? "Người dùng đã đăng nhập",
      email: profile.email ?? "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: "Vai trò tài khoản không hợp lệ."
    };
  }

  return {
    id: profile.id ?? "",
    name: profile.name ?? profile.email ?? "Người dùng",
    email: profile.email ?? "",
    role,
    authenticated: true
  };
}

export function canAccess(role: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(role);
}

export function homeForRole(role: UserRole): string {
  const map: Record<UserRole, string> = {
    CUSTOMER: "/homestays",
    OWNER: "/owner",
    OWNER_STAFF: "/owner",
    STAFF: "/staff",
    ADMIN: "/admin"
  };
  return map[role];
}

export function navForRole(role: UserRole): NavItem[] {
  const byRole: Record<UserRole, NavItem[]> = {
    CUSTOMER: [
      { label: "Khám phá", href: "/homestays" },
      { label: "Cẩm nang", href: "/articles" },
      { label: "Chuyến đi của tôi", href: "/bookings" }
    ],
    OWNER: [
      { label: "Bảng điều khiển chủ nhà", href: "/owner" },
      { label: "Quản lý homestay", href: "/owner/manage" }
    ],
    OWNER_STAFF: [
      { label: "Booking vận hành", href: "/owner" },
      { label: "Đặt hộ khách", href: "/owner/proxy-booking" }
    ],
    STAFF: [
      { label: "Quản lý nội dung", href: "/staff" },
      { label: "Kiểm soát người dùng", href: "/staff/moderation" }
    ],
    ADMIN: [
      { label: "Tổng quan", href: "/admin" }
    ]
  };

  return byRole[role];
}
