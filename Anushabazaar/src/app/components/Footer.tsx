import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";
import { APP_COPY } from "../lib/config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/20 bg-gradient-to-b from-[#061109] to-[#022c22] pb-24 pt-10 text-white shadow-[0_-20px_40px_rgba(0,0,0,0.15)] lg:pb-10">
      <div className="app-shell pb-8 pt-6">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <img
                src="/brand-logo.png"
                alt={APP_COPY.brand}
                className="h-16 w-16 rounded-[1.3rem] border border-white/20 bg-white object-cover shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)]"
              />
              <div>
                <div className="font-['Fraunces'] text-4xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-[#10b981]">{APP_COPY.brand}</div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#10b981]">
                  Professional Grocery
                </div>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
              Browse fresh categories, compare pack sizes, save your address, and place orders with a smoother
              Anusha Bazaar experience.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">Explore</h3>
            <div className="mt-6 flex flex-col items-start space-y-4 text-sm font-medium text-white/70">
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Home
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/shop">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Shop
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/about">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                About
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/contact">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Support
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">Policies</h3>
            <div className="mt-6 flex flex-col items-start space-y-4 text-sm font-medium text-white/70">
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/privacy-policy">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Privacy policy
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/refund-policy">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Refund policy
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/terms-of-service">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Terms of service
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/cart">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Cart
              </Link>
              <Link className="group relative inline-flex items-center gap-2 transition-colors hover:text-white" to="/checkout">
                <span className="h-px w-0 bg-[#10b981] transition-all duration-300 group-hover:w-4"></span>
                Checkout
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">Contact</h3>
            <div className="mt-6 space-y-5 text-sm font-medium leading-7 text-white/70">
              <div className="group flex items-start gap-4 transition-colors hover:text-white">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#10b981] transition-colors group-hover:bg-[#10b981] group-hover:text-black">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="pt-1.5">{APP_COPY.headquarters}</span>
              </div>
              <div className="group flex items-start gap-4 transition-colors hover:text-white">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#10b981] transition-colors group-hover:bg-[#10b981] group-hover:text-black">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="pt-1.5">
                  <a className="block transition hover:text-[#10b981]" href={`tel:${APP_COPY.phonePrimary.replace(/\s/g, "")}`}>
                    {APP_COPY.phonePrimary}
                  </a>
                </div>
              </div>
              <div className="group flex items-start gap-4 transition-colors hover:text-white">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#10b981] transition-colors group-hover:bg-[#10b981] group-hover:text-black">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="pt-1.5">
                  <a className="block transition hover:text-[#10b981]" href={`mailto:${APP_COPY.supportEmail}`}>
                    {APP_COPY.supportEmail}
                  </a>
                  <a className="block mt-1 transition hover:text-[#10b981]" href={`mailto:${APP_COPY.backupEmail}`}>
                    {APP_COPY.backupEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <p>{year} {APP_COPY.brand}. All rights reserved.</p>
          <p>Powered by AnushaTechnologies</p>
        </div>
      </div>
    </footer>
  );
}
