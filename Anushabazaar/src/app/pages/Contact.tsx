import { Mail, MapPin, Phone, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { APP_COPY } from "../lib/config";

export function Contact() {
  return (
    <div className="app-shell">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.3),transparent_60%),linear-gradient(135deg,#061109,#022c22_45%,#064e3b)] mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative px-8 py-16 text-white sm:px-12 lg:px-16 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-md">
            Customer support
          </div>
          <h1 className="page-hero-title mt-6 max-w-4xl text-white">
            Need help with ordering, delivery, or account access?
          </h1>
          <p className="section-copy mt-5 max-w-2xl text-white/82">
            Reach our team for help with orders, delivery updates, payments, or account access.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Phone,
            title: "Phone support",
            detail: APP_COPY.phonePrimary,
            extra: undefined,
          },
          {
            icon: Mail,
            title: "Email support",
            detail: APP_COPY.supportEmail,
            extra: APP_COPY.backupEmail,
          },
          {
            icon: MapPin,
            title: "Office",
            detail: APP_COPY.headquarters,
            extra: "Hyderabad, Telangana",
          },
          {
            icon: ShieldCheck,
            title: "Customer care",
            detail: "Order help, delivery updates, and account support",
            extra: "Available for everyday shopping assistance",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="group rounded-[2.5rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)] dark:bg-black/40 dark:border-white/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[#10b981]/20 to-[#047857]/20 transition-transform group-hover:scale-110">
              <item.icon className="h-8 w-8 text-[#10b981]" />
            </div>
            <h2 className="mt-6 font-['Fraunces'] text-[clamp(1.9rem,4vw,2.4rem)] font-bold tracking-tight text-[#061109] dark:text-white">{item.title}</h2>
            <p className="mt-4 text-[1.1rem] font-semibold leading-7 text-[#061109] dark:text-white">{item.detail}</p>
            <p className="mt-1 text-sm leading-7 text-[#4d5e50] dark:text-white/70">{item.extra}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[3rem] border border-[#10b981]/20 bg-gradient-to-br from-[#f8fbf5] to-[#edf4e3] p-10 shadow-[0_20px_50px_rgba(16,185,129,0.08)] dark:from-[#061109] dark:to-[#022c22] dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-white shadow-sm dark:bg-black/40 dark:border dark:border-white/10">
              <ShoppingBag className="h-8 w-8 text-[#10b981]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#10b981]">Customer journey</div>
              <h2 className="section-title mt-1">Support during checkout</h2>
            </div>
          </div>
          <ul className="mt-8 space-y-5 text-[1.1rem] leading-8 text-[#4d5e50] dark:text-white/70">
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Help customers sign in with OTP when they want to continue to checkout.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Confirm address details and browser location if address validation fails.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Guide shoppers through COD or online payment based on available checkout options.</li>
          </ul>
        </article>

        <article className="rounded-[3rem] border border-white/40 bg-white/60 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:bg-black/40 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[#10b981]/20 to-[#047857]/20">
              <Truck className="h-8 w-8 text-[#10b981]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#10b981]">Delivery operations</div>
              <h2 className="section-title mt-1">Support after order placement</h2>
            </div>
          </div>
          <ul className="mt-8 space-y-5 text-[1.1rem] leading-8 text-[#4d5e50] dark:text-white/70">
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Track order status, payment updates, and saved delivery details with customers.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Online payments are opened securely from the website and confirmed before fulfilment.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Cash on delivery orders move straight into fulfilment after address confirmation.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
