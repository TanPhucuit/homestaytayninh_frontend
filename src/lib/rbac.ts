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

const guestUser: SessionUser = { id: "", name: "Khach", email: "", role: "CUSTOMER", authenticated: false };

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
      name: "Nguoi dung da dang nhap",
      email: "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: "Khong the xac minh vai tro vi frontend chua cau hinh NEXT_PUBLIC_API_URL."
    };
  }

  const response = await fetch(`${API_URL}/api/auth/me`, {
    cache: "no-store",
    headers: { authorization: `Bearer ${token}` }
  }).catch(() => null);

  if (!response?.ok) {
    const backendError = response ? `Backend tra ve HTTP ${response.status}.` : "Khong ket noi duoc backend.";
    return {
      id: "",
      name: "Nguoi dung da dang nhap",
      email: "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: `Khong the xac minh vai tro tai khoan. ${backendError}`
    };
  }

  const profile = (await response.json()) as Partial<SessionUser>;
  const role = parseRole(profile.role);
  if (!role) {
    return {
      id: profile.id ?? "",
      name: profile.name ?? "Nguoi dung da dang nhap",
      email: profile.email ?? "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: "Backend tra ve vai tro tai khoan khong hop le."
    };
  }

  return {
    id: profile.id ?? "",
    name: profile.name ?? profile.email ?? "Nguoi dung",
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
      { label: "Kham pha", href: "/homestays" },
      { label: "Cam nang", href: "/articles" },
      { label: "Chuyen di cua toi", href: "/bookings" }
    ],
    OWNER: [
      { label: "Dashboard chu nha", href: "/owner" },
      { label: "Quan ly homestay", href: "/owner/manage" }
    ],
    OWNER_STAFF: [
      { label: "Booking van hanh", href: "/owner" },
      { label: "Dat ho khach", href: "/owner/proxy-booking" }
    ],
    STAFF: [
      { label: "Quan ly noi dung", href: "/staff" },
      { label: "Kiem soat nguoi dung", href: "/staff/moderation" }
    ],
    ADMIN: [
      { label: "Tong quan", href: "/admin" },
      { label: "Van hanh chu nha", href: "/owner" },
      { label: "Noi dung & kiem duyet", href: "/staff" }
    ]
  };

  return byRole[role];
}
