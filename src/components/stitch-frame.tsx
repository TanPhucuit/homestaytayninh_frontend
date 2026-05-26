"use client";

import { useRef } from "react";

type StitchInteraction = "home" | "login" | "search" | "detail";

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
