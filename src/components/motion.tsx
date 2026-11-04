"use client";

import { useEffect, useState, type ReactNode } from "react";

// Adds `is-visible` to every `.reveal` element once it scrolls into view.
// Watches the DOM so elements rendered after navigation are picked up too.
export function RevealObserver() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    const scan = () => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        io.observe(element);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);
  return null;
}

// Header that sits transparent over a hero image and turns solid after scrolling.
export function HeaderFrame({ overlay, children }: { overlay: boolean; children: ReactNode }) {
  const [solid, setSolid] = useState(!overlay);

  useEffect(() => {
    if (!overlay) return;
    const update = () => setSolid(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [overlay]);

  return (
    <header
      className={`group/header z-40 w-full transition-[background-color,box-shadow,border-color] duration-500 ${overlay ? "fixed inset-x-0 top-0" : "sticky top-0"} ${solid ? "border-b border-line-soft bg-cream/85 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}
      data-solid={solid}
    >
      {children}
    </header>
  );
}
