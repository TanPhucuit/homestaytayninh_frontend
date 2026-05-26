import { createClient } from "@/utils/supabase/server";
import { UserRole } from "./types";

const PRODUCTION_API_URL = "https://homestaytayninh-backend.onrender.com";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const API_URL = configuredApiUrl && !(process.env.VERCEL && configuredApiUrl.includes("localhost")) ? configuredApiUrl : PRODUCTION_API_URL;

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
  const role = String(value ?? "").toUpperCase();
  if (role === "CUSTOMER" || role === "OWNER" || role === "OWNER_STAFF" || role === "STAFF" || role === "ADMIN") {
    return role;
  }
  return "CUSTOMER";
}

export async function getCurrentUser(): Promise<SessionUser> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return guestUser;
  }
  const {
    data: { user }
  } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  if (!user) return guestUser;

  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (API_URL && session?.access_token) {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      cache: "no-store",
      headers: { authorization: `Bearer ${session.access_token}` }
    }).catch(() => null);

    if (response?.ok) {
      const profile = (await response.json()) as Partial<SessionUser>;
      return {
        id: profile.id ?? user.id,
        name: profile.name ?? user.user_metadata?.name ?? user.email ?? "Customer",
        email: profile.email ?? user.email ?? "",
        role: normalizeRole(profile.role),
        authenticated: true
      };
    }

    const backendError = response ? `Backend trả về HTTP ${response.status}.` : "Không kết nối được backend.";
    return {
      id: user.id,
      name: user.user_metadata?.name ?? user.email ?? "Customer",
      email: user.email ?? "",
      role: "CUSTOMER",
      authenticated: true,
      authorizationError: `Không thể xác minh vai trò tài khoản. ${backendError}`
    };
  }

  return {
    id: user.id,
    name: user.user_metadata?.name ?? user.email ?? "Customer",
    email: user.email ?? "",
    role: "CUSTOMER",
    authenticated: true,
    authorizationError: "Không thể xác minh vai trò tài khoản vì phiên đăng nhập không có access token."
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
      { label: "Chuyến đi của tôi", href: "/bookings" }
    ],
    OWNER: [
      { label: "Dashboard chủ nhà", href: "/owner" },
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
      { label: "Tổng quan", href: "/admin" },
      { label: "Vận hành chủ nhà", href: "/owner" },
      { label: "Nội dung & kiểm duyệt", href: "/staff" }
    ]
  };

  return byRole[role];
}
