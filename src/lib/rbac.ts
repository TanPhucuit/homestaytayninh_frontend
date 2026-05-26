import { cookies } from "next/headers";
import { UserRole } from "./types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface NavItem {
  label: string;
  href: string;
}

const roleUsers: Record<UserRole, SessionUser> = {
  CUSTOMER: { id: "u-customer", name: "Nguyen Van A", email: "customer@homestay.vn", role: "CUSTOMER" },
  OWNER: { id: "u-owner", name: "Le Thi Hanh", email: "owner@homestay.vn", role: "OWNER" },
  OWNER_STAFF: { id: "u-owner-staff", name: "Tran Minh Quan", email: "staff-owner@homestay.vn", role: "OWNER_STAFF" },
  STAFF: { id: "u-staff", name: "Staff Demo", email: "staff@homestay.vn", role: "STAFF" },
  ADMIN: { id: "u-admin", name: "Admin Demo", email: "admin@homestay.vn", role: "ADMIN" }
};

export function normalizeRole(value?: string | null): UserRole {
  const role = String(value ?? "").toUpperCase();
  if (role === "CUSTOMER" || role === "OWNER" || role === "OWNER_STAFF" || role === "STAFF" || role === "ADMIN") {
    return role;
  }
  return "CUSTOMER";
}

export async function getCurrentUser(): Promise<SessionUser> {
  const cookieStore = await cookies();
  const role = normalizeRole(cookieStore.get("demo-role")?.value);
  return roleUsers[role];
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
  const base: NavItem[] = [
    { label: "Trang chủ", href: "/" },
    { label: "Tìm homestay", href: "/homestays" }
  ];

  const byRole: Record<UserRole, NavItem[]> = {
    CUSTOMER: [...base, { label: "Booking của tôi", href: "/bookings" }],
    OWNER: [
      { label: "Owner dashboard", href: "/owner" },
      { label: "Quản lý homestay", href: "/owner/manage" },
      { label: "Booking vận hành", href: "/owner" }
    ],
    OWNER_STAFF: [
      { label: "Booking vận hành", href: "/owner" },
      { label: "Đặt hộ khách", href: "/owner" }
    ],
    STAFF: [
      { label: "CMS", href: "/staff" },
      { label: "User moderation", href: "/staff" }
    ],
    ADMIN: [
      { label: "Admin dashboard", href: "/admin" },
      { label: "Owner portal", href: "/owner" },
      { label: "Staff portal", href: "/staff" }
    ]
  };

  return [...byRole[role], { label: role, href: "/login" }];
}

