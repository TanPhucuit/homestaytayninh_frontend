import Link from "next/link";
import { PaymentMethodSelector, PaymentRequestPanel, PaymentStateGrid } from "@/components/payment-ui";
import { BookingValidationForm } from "@/components/validated-forms";
import { Pill, SectionHeading } from "@/components/ui";
import { getCheckoutPreview, money } from "@/lib/api";

export default async function CheckoutPage() {
  const checkout = await getCheckoutPreview();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading
        eyebrow="Customer checkout"
        title="Hoàn tất đặt phòng"
        description="Luồng demo theo BA: thông tin khách có validation, dịch vụ bổ sung và thanh toán ApiPay/mock provider."
      />

      <div className="mt-8 flex flex-wrap gap-2">
        {["1. Thông tin khách", "2. Dịch vụ bổ sung", "3. Thanh toán"].map((step, index) => (
          <Pill key={step} tone={index === 2 ? "clay" : "green"}>
            {step}
          </Pill>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="space-y-6">
          <BookingValidationForm />

          <div className="card p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-[#466550]">Dịch vụ bổ sung</h2>
              <Pill tone="sand">Có thể thêm tiếp khi IN_STAY</Pill>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-[#fdf9f4] p-4">
                <p className="font-bold text-[#466550]">Dịch vụ đã bao gồm</p>
                <p className="mt-2 text-sm text-[#75675f]">{checkout.includedServices.map((service) => service.name).join(", ")}</p>
              </div>
              {checkout.selectedServices.map((service) => (
                <div key={service.id} className="flex flex-col gap-3 rounded-2xl border border-[#eadfd3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold">{service.name}</p>
                    <p className="text-sm text-[#75675f]">
                      {money(service.unitPrice)} x {service.quantity}
                    </p>
                  </div>
                  <Pill tone="clay">{money(service.total)}</Pill>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-[#466550]">Thanh toán ApiPay</h2>
            <p className="mt-2 text-sm text-[#75675f]">Chọn phương thức thanh toán, tạo payment request và theo dõi trạng thái từ ApiPay/mock provider.</p>
            <div className="mt-5">
              <PaymentMethodSelector />
            </div>
            <div className="mt-6">
              <PaymentRequestPanel amount={checkout.grandTotal} />
            </div>
            <div className="mt-6">
              <h3 className="mb-3 text-lg font-bold text-[#466550]">Payment states</h3>
              <PaymentStateGrid />
            </div>
          </div>
        </section>

        <aside className="card h-fit p-4 sm:p-6 lg:sticky lg:top-24">
          <p className="eyebrow">Order summary</p>
          <h2 className="mt-2 text-3xl text-[#466550]">{checkout.homestay.name}</h2>
          <p className="mt-2 text-sm text-[#75675f]">
            {checkout.room.name} · {checkout.nights} đêm · {checkout.guestCount} người lớn
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Tiền phòng</span>
              <strong>{money(checkout.roomTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Dịch vụ thêm</span>
              <strong>{money(checkout.serviceTotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Thuế/phí</span>
              <strong>{money(checkout.taxTotal)}</strong>
            </div>
            <div className="border-t border-[#eadfd3] pt-4 text-lg">
              <div className="flex justify-between">
                <span>Tổng cộng</span>
                <strong className="text-[#9a4029]">{money(checkout.grandTotal)}</strong>
              </div>
            </div>
          </div>
          <Link href="/payment/result?status=pending" className="btn-primary mt-6 w-full">
            Tạo yêu cầu thanh toán
          </Link>
          <Link href="/bookings" className="btn-secondary mt-3 w-full">
            Xem booking của tôi
          </Link>
        </aside>
      </div>
    </main>
  );
}
