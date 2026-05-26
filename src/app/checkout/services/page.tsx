import Link from "next/link";
import { PageShell, Stepper } from "@/components/customer-ui";
import { getCheckoutPreview, money } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CheckoutServicesPage({ searchParams }: { searchParams: Promise<{ homestayId?: string }> }) {
  const params = await searchParams;
  const preview = await getCheckoutPreview(params.homestayId);

  return (
    <PageShell
      eyebrow="Checkout Step 2"
      title="Chọn dịch vụ bổ sung"
      description="Màn hình thật bằng component Next.js, dùng dữ liệu homestay/service từ API preview."
    >
      <div className="mb-6">
        <Stepper active={2} />
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <p className="eyebrow">Add-on Services</p>
          <h2 className="mt-2 font-heading text-3xl text-[#7b2914]">Dịch vụ có thể gọi thêm</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {preview.homestay.services.map((service) => (
              <div className="rounded-3xl bg-[#fdf9f4] p-5" key={service.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-heading text-2xl text-[#466550]">{service.name}</p>
                    {service.description && <p className="mt-2 text-sm text-[#75675f]">{service.description}</p>}
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#9a4029]">{money(service.unitPrice)}</span>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-3">
                  <span className="text-sm font-semibold text-[#75675f]">Số lượng</span>
                  <span className="rounded-full border border-[#dcc0ba] px-4 py-2 text-sm font-bold text-[#3f3530]">Chọn ở bước đặt phòng</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Đã bao gồm</p>
          <div className="mt-4 space-y-3">
            {preview.includedServices.map((service) => (
              <div className="rounded-2xl bg-[#fdf9f4] p-4" key={service.id}>
                <p className="font-bold text-[#466550]">{service.name}</p>
                <p className="text-sm text-[#75675f]">Miễn phí theo giá phòng</p>
              </div>
            ))}
          </div>
          <Link className="btn-primary mt-6 w-full" href={`/checkout?homestayId=${preview.homestay.id}`}>
            Quay lại form đặt phòng
          </Link>
        </aside>
      </section>
    </PageShell>
  );
}
