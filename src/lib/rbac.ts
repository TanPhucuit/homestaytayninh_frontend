import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { UserRole } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE ?? "supabase";

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
  if (AUTH_MODE === "supabase") {
    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return roleUsers.CUSTOMER;
    }
    const {
      data: { user }
    } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    if (!user) return roleUsers.CUSTOMER;

    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (API_URL && session?.access_token) {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        cache: "no-store",
        headers: { authorization: `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const profile = (await response.json()) as Partial<SessionUser>;
        return {
          id: profile.id ?? user.id,
          name: profile.name ?? user.user_metadata?.name ?? user.email ?? "Customer",
          email: profile.email ?? user.email ?? "",
          role: normalizeRole(profile.role)
        };
      }
    }

    return {
      id: user.id,
      name: user.user_metadata?.name ?? user.email ?? "Customer",
      email: user.email ?? "",
      role: "CUSTOMER"
    };
  }

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
  const byRole: Record<UserRole, NavItem[]> = {
    CUSTOMER: [
      { label: "Trang chu", href: "/" },
      { label: "Tim homestay", href: "/homestays" },
      { label: "Booking cua toi", href: "/bookings" }
    ],
    OWNER: [
      { label: "Owner dashboard", href: "/owner" },
      { label: "Quan ly homestay", href: "/owner/manage" }
    ],
    OWNER_STAFF: [
      { label: "Booking van hanh", href: "/owner" },
      { label: "Dat ho khach", href: "/owner/proxy-booking" }
    ],
    STAFF: [
      { label: "CMS", href: "/staff" },
      { label: "User moderation", href: "/staff/moderation" }
    ],
    ADMIN: [
      { label: "Admin dashboard", href: "/admin" },
      { label: "Owner portal", href: "/owner" },
      { label: "Staff portal", href: "/staff" }
    ]
  };

  return byRole[role];
}
