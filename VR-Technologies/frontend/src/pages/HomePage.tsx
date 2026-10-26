import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  Keyboard,
  Laptop,
  Monitor,
  RotateCcw,
  Shield,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import StoreCard from '../components/StoreCard'
import { productService, storeService } from '../api/services'
import { SAMPLE_PRODUCTS, STORES } from '../data/products'

const HERO_PRODUCTS = [
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=900',
]

const CATEGORIES = [
  { name: 'Laptops', icon: Laptop, href: '/products?category=Laptops', image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=360' },
  { name: 'Desktops', icon: Cpu, href: '/products?category=Desktops', image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=360' },
  { name: 'Accessories', icon: Keyboard, href: '/products?category=Accessories', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=360' },
  { name: 'Monitors', icon: Monitor, href: '/products?category=Monitors', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=360' },
]

const TRUST_BADGES = [
  { icon: Shield, title: '6 Months Warranty', desc: 'On all products' },
  { icon: CheckCircle, title: 'Quality Checked', desc: '100+ tests passed' },
  { icon: RotateCcw, title: '7 Days Easy Returns', desc: 'No questions asked' },
  { icon: Truck, title: 'Fast & Safe Delivery', desc: 'Across Hyderabad' },
  { icon: Store, title: 'Best Prices', desc: 'Unbeatable deals' },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>(SAMPLE_PRODUCTS.slice(0, 5))
  const [stores, setStores] = useState<any[]>(STORES)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    setLoadingProducts(true)
    Promise.all([productService.getFeatured(), storeService.getAll()])
      .then(([products, storesData]) => {
        setFeaturedProducts(products?.length ? products : SAMPLE_PRODUCTS.slice(0, 5))
        setStores(storesData?.length ? storesData : STORES)
      })
      .finally(() => setLoadingProducts(false))
  }, [])

  return (
    <div className="bg-white">
      <section className="px-3 md:px-6 pt-3">
        <div className="relative mx-auto max-w-[1360px] overflow-hidden rounded-[18px] bg-[#060906] min-h-[360px] md:min-h-[470px] border border-[#7ed321]/30 shadow-[0_30px_90px_rgba(0,0,0,0.32)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(126,211,33,0.52),transparent_24rem),linear-gradient(110deg,#050705_0%,#07130b_48%,#224d11_100%)]" />
          <div className="absolute right-0 top-0 h-48 w-48 opacity-70" style={{ backgroundImage: 'radial-gradient(#8be12b 1.2px, transparent 1.2px)', backgroundSize: '12px 12px' }} />
          <div className="relative grid min-h-[360px] md:min-h-[470px] grid-cols-1 lg:grid-cols-[1fr_1.05fr] items-center gap-8 px-7 py-9 md:px-16">
            <div>
              <span className="inline-flex rounded-full border border-[#7ed321]/55 bg-[#7ed321]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-[#b8ff55]">
                Best deals on refurbished laptops
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-6xl">
                Up to <span className="text-[#7ed321]">40% off</span><br />on refurbished laptops
              </h1>
              <p className="mt-4 text-base font-semibold text-white/90 md:text-lg">
                Top brands, tested quality, warranty included.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-[#7ed321] px-7 py-3 text-sm font-black uppercase text-[#071006] shadow-[0_12px_30px_rgba(126,211,33,0.35)] transition hover:bg-white">
                  <ShoppingCart size={18} /> Shop Now <ArrowRight size={18} />
                </Link>
                <Link to="/stores" className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:border-[#7ed321] hover:text-[#b8ff55]">
                  Visit Stores
                </Link>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                {TRUST_BADGES.slice(0, 4).map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-2 border-r border-white/10 last:border-r-0">
                    <Icon className="text-[#7ed321]" size={24} />
                    <div>
                      <p className="text-xs font-black text-white">{title}</p>
                      <p className="text-[11px] text-white/60">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex min-h-[260px] items-center justify-center">
              <div className="absolute bottom-6 h-28 w-[88%] rounded-[50%] bg-[#7ed321]/25 blur-xl" />
              <img src={HERO_PRODUCTS[0]} alt="Refurbished laptop" className="relative z-10 w-[62%] max-w-lg rounded-xl border border-white/15 object-cover shadow-2xl rotate-[-3deg]" />
              <img src={HERO_PRODUCTS[1]} alt="Laptop rear view" className="absolute right-2 top-12 z-0 w-[42%] max-w-sm rounded-xl border border-white/10 object-cover shadow-2xl rotate-[10deg] opacity-95" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-3 py-7 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORIES.map(({ name, icon: Icon, href, image }) => (
            <Link key={name} to={href} className="group vr-panel flex min-h-32 items-center justify-between overflow-hidden rounded-xl p-4 transition hover:-translate-y-1 hover:border-[#7ed321]/60">
              <div>
                <Icon className="mb-3 text-[#63b51f]" size={28} />
                <h3 className="text-lg font-black uppercase text-[#111811]">{name}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[#4f9f13]">Explore Now <ArrowRight size={14} /></p>
              </div>
              <img src={image} alt={name} className="h-24 w-28 rounded-lg object-cover transition group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-3 pb-7 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase text-[#08100a]">Featured Laptops</h2>
          <Link to="/products?category=Laptops" className="inline-flex items-center gap-1 text-sm font-bold text-[#3c8211]">View All <ArrowRight size={16} /></Link>
        </div>
        {loadingProducts ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-80 animate-pulse rounded-xl bg-[#eef5ea]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featuredProducts.slice(0, 5).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1360px] px-3 pb-7 md:px-6">
        <div className="vr-dark-panel grid grid-cols-1 gap-4 rounded-xl px-5 py-5 md:grid-cols-5">
          {TRUST_BADGES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 border-white/10 md:border-r md:last:border-r-0">
              <Icon className="text-[#7ed321]" size={32} />
              <div>
                <p className="font-black text-white">{title}</p>
                <p className="text-sm text-white/65">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-3 pb-8 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase text-[#08100a]">Available at your nearby stores</h2>
          <Link to="/stores" className="inline-flex items-center gap-1 text-sm font-bold text-[#3c8211]">View All Stores <ArrowRight size={16} /></Link>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {stores.slice(0, 2).map((store) => <StoreCard key={store.id} store={store} />)}
          <div className="vr-panel flex min-h-56 flex-col items-center justify-center rounded-xl p-6 text-center">
            <Store className="text-[#5aaa19]" size={46} />
            <h3 className="mt-3 text-xl font-black text-[#111811]">Check product availability</h3>
            <p className="mt-2 text-sm text-gray-600">Select a store to see real-time stock before visiting.</p>
            <Link to="/stores" className="mt-5 rounded-lg bg-[#63b51f] px-5 py-2.5 text-sm font-black text-white transition hover:bg-[#4f9f13]">Choose Store</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1360px] grid-cols-1 gap-4 px-3 pb-10 md:grid-cols-3 md:px-6">
        {[
          ['Under ₹30,000', 'Best laptops at lowest prices', '/products?maxPrice=30000', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=520'],
          ['Gaming Laptops', 'High performance, great prices', '/products?tag=gaming', 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=520'],
          ['Accessories Deals', 'Keyboards, mouse and more', '/products?category=Accessories', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=520'],
        ].map(([title, desc, href, img]) => (
          <Link key={title} to={href} className="group relative min-h-36 overflow-hidden rounded-xl bg-[#e9f7df] p-6">
            <h3 className="text-xl font-black text-[#111811]">{title}</h3>
            <p className="mt-1 max-w-44 text-sm font-medium text-[#30402d]">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-black uppercase text-[#3d7e13]">Shop Now <ArrowRight size={15} /></span>
            <img src={img} alt="" className="absolute bottom-0 right-0 h-32 w-44 object-cover opacity-75 transition group-hover:scale-105" />
          </Link>
        ))}
      </section>
    </div>
  )
}
