import { ArrowRight, ShieldCheck, Store, Truck, Users } from "lucide-react";
import { Link } from "react-router";

const aboutHero =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";

export function About() {
  return (
    <div className="app-shell">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/40 shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:border-white/10">
        <img src={aboutHero} alt="Anusha Bazaar" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2s] hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative px-8 py-16 text-white sm:px-12 lg:px-16 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white backdrop-blur-md">
            About Anusha Bazaar
          </div>
          <h1 className="page-hero-title mt-6 max-w-4xl text-white">
            Fresh groceries, reliable service, and a friendlier digital store.
          </h1>
          <p className="section-copy mt-5 max-w-2xl text-white/80">
            Anusha Bazaar brings neighbourhood grocery shopping online with clear product browsing, easy reordering, and a smoother checkout experience.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: Truck,
            title: "Easy ordering",
            description: "Choose the right pack size, save your favourites, and move through checkout with clarity.",
          },
          {
            icon: Store,
            title: "Wide assortment",
            description: "Browse fruits, vegetables, staples, dairy, snacks, and daily essentials in one place.",
          },
          {
            icon: ShieldCheck,
            title: "Thoughtful design",
            description: "Cleaner filtering, better product pages, and less friction from landing page to payment.",
          },
          {
            icon: Users,
            title: "Trusted service",
            description: "Built to help customers order with confidence and stay informed through delivery.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="group rounded-[2.5rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)] dark:bg-black/40 dark:border-white/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-[#10b981]/20 to-[#047857]/20 transition-transform group-hover:scale-110">
              <item.icon className="h-8 w-8 text-[#10b981]" />
            </div>
            <h2 className="mt-5 font-['Fraunces'] text-[clamp(1.9rem,4vw,2.4rem)] text-[#17311d]">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#607361]">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[3rem] border border-[#10b981]/20 bg-gradient-to-br from-[#f8fbf5] to-[#edf4e3] p-10 shadow-[0_20px_50px_rgba(16,185,129,0.08)] dark:from-[#061109] dark:to-[#022c22] dark:border-white/10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#10b981]">What changed</div>
          <h2 className="mt-6 font-['Fraunces'] text-[clamp(2.2rem,5vw,3.5rem)] font-bold tracking-tight text-[#061109] dark:text-white">Designed for a smoother everyday shopping routine.</h2>
          <div className="mt-8 space-y-5 text-[1.1rem] leading-8 text-[#4d5e50] dark:text-white/70">
            <p>We rebuilt the storefront to make grocery shopping easier to browse, compare, and order from any device.</p>
            <p>The experience now keeps search, category browsing, delivery choices, offers, and checkout working together more naturally.</p>
            <p>The result is a more polished Anusha Bazaar journey that feels clearer for first-time shoppers and faster for returning customers.</p>
          </div>
        </article>

        <article className="rounded-[3rem] border border-white/40 bg-white/60 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:bg-black/40 dark:border-white/10">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#10b981]">Explore the result</div>
          <h2 className="mt-6 font-['Fraunces'] text-[clamp(2.2rem,5vw,3.5rem)] font-bold tracking-tight text-[#061109] dark:text-white">See the shopping flow in action.</h2>
          <ul className="mt-8 space-y-5 text-[1.1rem] leading-8 text-[#4d5e50] dark:text-white/70">
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Use the global search to jump straight to favourite products.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Open a category page and try the filters, sorting, and product suggestions.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Add the right pack size to your basket and review your savings.</li>
            <li className="flex items-start gap-3"><span className="text-[#10b981] mt-1">✦</span> Sign in with OTP and complete checkout in a more guided flow.</li>
          </ul>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#047857] px-8 py-4 text-sm font-bold tracking-wide text-white shadow-[0_12px_24px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)]"
          >
            Explore the shop
            <ArrowRight className="h-5 w-5" />
          </Link>
        </article>
      </section>
    </div>
  );
}
