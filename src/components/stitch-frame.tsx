"use client";

import { useRef } from "react";

type StitchInteraction = "home" | "login" | "search" | "detail" | "checkout";

function normalizeText(value: string | null) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function linkControls(document: Document, label: string, destination: string) {
  document.querySelectorAll<HTMLElement>("button, a").forEach((control) => {
    if (!normalizeText(control.textContent).includes(label)) return;
    control.onclick = (event) => {
      event.preventDefault();
      window.location.assign(destination);
    };
  });
}

function valueOf(document: Document, id: string) {
  return document.getElementById(id) instanceof HTMLInputElement ? (document.getElementById(id) as HTMLInputElement).value : "";
}

function markCheckoutError(document: Document, message: string) {
  let panel = document.getElementById("checkout-api-error");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "checkout-api-error";
    panel.className = "mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700";
    document.getElementById("step-3")?.appendChild(panel);
  }
  panel.textContent = message;
}

function bindCheckoutSubmit(document: Document) {
  document.querySelectorAll<HTMLButtonElement>("button").forEach((button) => {
    if (!normalizeText(button.textContent).includes("Xác nhận & Thanh toán")) return;
    button.onclick = async (event) => {
      event.preventDefault();
      const originalText = button.textContent ?? "Xác nhận & Thanh toán";
      button.disabled = true;
      button.textContent = "Đang tạo thanh toán...";

      try {
        const response = await fetch("/api/checkout/create", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            guestName: valueOf(document, "fullName"),
            guestPhone: valueOf(document, "phone"),
            guestEmail: valueOf(document, "email"),
            bbqQuantity: Number(valueOf(document, "qty-bbq") || 0),
            bikeQuantity: Number(valueOf(document, "qty-car") || 0)
          })
        });
        const payload = (await response.json().catch(() => null)) as { redirectUrl?: string; message?: string } | null;
        if (!response.ok || !payload?.redirectUrl) {
          throw new Error(payload?.message ?? "Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.");
        }
        window.location.assign(payload.redirectUrl);
      } catch (error) {
        markCheckoutError(document, error instanceof Error ? error.message : "Không thể tạo yêu cầu thanh toán.");
        button.disabled = false;
        button.textContent = originalText;
      }
    };
  });
}

function connectStitchScreen(document: Document, interaction?: StitchInteraction) {
  switch (interaction) {
    case "login":
      linkControls(document, "Đăng nhập với Google", "/auth/login/google?next=%2Fhomestays");
      break;
    case "home":
      linkControls(document, "Đặt phòng ngay", "/homestays");
      linkControls(document, "Tìm kiếm", "/homestays");
      break;
    case "search":
      linkControls(document, "Xem chi tiết", "/homestays/hs-ba-den");
      linkControls(document, "Đặt phòng ngay", "/checkout");
      break;
    case "detail":
      linkControls(document, "Tiếp tục đặt phòng", "/checkout");
      linkControls(document, "Chọn phòng", "/checkout");
      linkControls(document, "My Bookings", "/bookings");
      break;
    case "checkout":
      bindCheckoutSubmit(document);
      break;
  }
}

export function StitchFrame({ src, title, interaction }: { src: string; title: string; interaction?: StitchInteraction }) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  return (
    <iframe
      ref={frameRef}
      src={src}
      title={title}
      className="block h-screen w-full border-0 bg-[#fdf9f4]"
      loading="eager"
      onLoad={() => {
        const document = frameRef.current?.contentDocument;
        if (document) connectStitchScreen(document, interaction);
      }}
    />
  );
}
