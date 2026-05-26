export function PortalShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold text-[#466550] md:text-5xl">{title}</h1>
      <div className="mt-8">{children}</div>
    </main>
  );
}

