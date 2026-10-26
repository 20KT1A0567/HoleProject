import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { LoaderCircle } from "lucide-react";
import { Link } from "react-router";
import { AppShowcase } from "../components/AppShowcase";
import { CategoryCard } from "../components/CategoryCard";
import { ProductCard } from "../components/ProductCard";
import { APP_COPY } from "../lib/config";
import { productMatchesKeywords } from "../lib/customerExperience";
import { getBanners, getBestSellerProducts, getCategories, getOrders, getProductById, getProducts, getTrendingProducts } from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import type { Banner, Category, Product } from "../types/storefront";

const fallbackHero =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80";

export function Home() {
  const session = useAuthStore((state) => state.session);
  const cart = useCartStore((state) => state.cart);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [freshProducts, setFreshProducts] = useState<Product[]>([]);
  const [previouslyOrderedProducts, setPreviouslyOrderedProducts] = useState<Product[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([getBanners(), getCategories(), getTrendingProducts(), getBestSellerProducts(), getProducts()])
      .then(([nextBanners, nextCategories, nextTrending, nextBestSellers, nextProducts]) => {
        if (!isMounted) return;
        setBanners(nextBanners.filter((banner) => banner.isActive !== false));
        setCategories(nextCategories);
        setTrendingProducts(nextTrending.slice(0, 4));
        setBestSellerProducts(nextBestSellers.slice(0, 4));
        setFreshProducts(nextProducts.slice(0, 8));
      })
      .catch((loadError: any) => {
        if (!isMounted) return;
        setError(loadError?.message || "Unable to load the storefront right now.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.accessToken) {
      setPreviouslyOrderedProducts([]);
      return;
    }

    let isMounted = true;
    getOrders()
      .then(async (orders) => {
        const recentOrders = orders.slice(0, 2);
        const itemProductIds = Array.from(
          new Set(
            recentOrders
              .flatMap((order) => [
                ...(order.items || []),
                ...(order.storeGroups ?? []).flatMap((group) => group.items || []),
              ])
              .map((item) => item.productId)
              .filter(Boolean),
          ),
        ).slice(0, 4);

        const products = await Promise.all(
          itemProductIds.map((id) => getProductById(id).catch(() => null)),
        );

        if (isMounted) {
          setPreviouslyOrderedProducts(products.filter(Boolean) as Product[]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPreviouslyOrderedProducts([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken]);

  const heroSlides = useMemo(
    () =>
      banners.length > 0
        ? banners
        : [
            {
              id: 0,
              name: APP_COPY.brand,
              imageUrl: fallbackHero,
            } satisfies Banner,
          ],
    [banners],
  );

  const activeBanner = heroSlides[activeBannerIndex] || heroSlides[0];
  const dealProducts = useMemo(
    () => freshProducts.filter((product) => product.hasDiscount || product.discountPercent > 0).slice(0, 4),
    [freshProducts],
  );
  const breakfastProducts = useMemo(
    () => freshProducts.filter((product) => productMatchesKeywords(product, ["milk", "bread", "egg", "butter", "curd", "breakfast"])).slice(0, 4),
    [freshProducts],
  );
  const snacksProducts = useMemo(
    () => freshProducts.filter((product) => productMatchesKeywords(product, ["snack", "chips", "biscuit", "juice", "drink", "beverage"])).slice(0, 4),
    [freshProducts],
  );
  const cartInspiredProducts = useMemo(() => {
    const cartCategories = new Set(cart.map((item) => item.categoryName).filter(Boolean));
    return freshProducts
      .filter((product) => cartCategories.has(product.categoryName) && !cart.some((item) => item.productId === product.id))
      .slice(0, 4);
  }, [cart, freshProducts]);

  useEffect(() => {
    if (heroSlides.length < 2) return undefined;

    const interval = window.setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="app-shell">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative min-h-[200px] flex flex-col justify-end overflow-hidden rounded-[1.5rem] border border-[#10b981]/20 bg-[#10b981] shadow-md sm:min-h-[360px] sm:rounded-[2.5rem] sm:border-white/40 sm:shadow-[0_30px_80px_rgba(16,185,129,0.15)] lg:min-h-[460px]"
      >
        <motion.img
          key={activeBanner?.imageUrl}
          initial={{ scale: 1.1, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          src={activeBanner?.imageUrl || fallbackHero}
          alt={activeBanner?.name || APP_COPY.brand}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none mix-blend-multiply" />

        {heroSlides.length > 1 ? (
          <div className="absolute right-4 bottom-4 flex items-center justify-center gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-md">
            {heroSlides.slice(0, 6).map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Show banner ${index + 1}`}
                onClick={() => setActiveBannerIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeBannerIndex ? "w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        ) : null}
      </motion.section>

      {isLoading ? (
        <div className="mt-10 flex min-h-[240px] items-center justify-center rounded-[2rem] border border-[#dbe4d2] bg-white/70 text-[#406144] shadow-[0_24px_50px_rgba(21,37,25,0.06)]">
          <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
          Loading today's fresh picks...
        </div>
      ) : error ? (
        <div className="mt-10 rounded-[2rem] border border-[#ebc9c3] bg-[#fff5f2] px-5 py-4 text-sm text-[#a55749]">
          {error}
        </div>
      ) : (
        <>
          <section className="mt-6 sm:mt-10">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title">Shop by category</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-[#1b6f38] transition hover:text-[#14552a]">
                Explore full shop
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-5">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} compact />
              ))}
            </div>
            <div className="sticky top-[9.5rem] z-20 mt-5 -mx-3 hidden overflow-x-auto px-3 py-2 md:block lg:top-[11rem]">
              <div className="flex min-w-max gap-2 rounded-full border border-[#dce6d2] bg-white/88 p-2 shadow-[0_18px_34px_rgba(23,42,28,0.08)] backdrop-blur">
                {categories.map((category) => (
                  <Link
                    key={`rail-${category.id}`}
                    to={`/category/${category.id}-${category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-[#24442b] transition hover:bg-[#edf4e3]"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>


          <section className="mt-8 sm:mt-12">
            <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title">Best sellers</h2>
              </div>
              <Link to="/shop?sort=featured" className="text-sm font-semibold text-[#1b6f38] transition hover:text-[#14552a]">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              {bestSellerProducts.map((product) => (
                <ProductCard key={`${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
              ))}
            </div>
          </section>

          {previouslyOrderedProducts.length > 0 ? (
            <section className="mt-12">
              <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="section-title">Previously ordered</h2>
                  <p className="mt-1 text-sm text-[#607361]">Your usual products, ready for a faster reorder.</p>
                </div>
                <Link to="/account?tab=orders" className="text-sm font-semibold text-[#1b6f38] transition hover:text-[#14552a]">
                  Repeat last order
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                {previouslyOrderedProducts.map((product) => (
                  <ProductCard key={`previous-${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          {cartInspiredProducts.length > 0 ? (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="section-title">Recommended add-ons</h2>
                <p className="mt-1 text-sm text-[#607361]">Useful additions based on what is already in your cart.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                {cartInspiredProducts.map((product) => (
                  <ProductCard key={`cart-inspired-${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
                ))}
              </div>
            </section>
          ) : null}


          {breakfastProducts.length > 0 ? (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="section-title">Breakfast essentials</h2>
                <p className="mt-1 text-sm text-[#607361]">Milk, bread, curd, and morning basket helpers.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                {breakfastProducts.map((product) => (
                  <ProductCard key={`breakfast-${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          {snacksProducts.length > 0 ? (
            <section className="mt-12">
              <div className="mb-5">
                <h2 className="section-title">Snacks and beverages</h2>
                <p className="mt-1 text-sm text-[#607361]">Quick bites and drinks grouped for faster browsing.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
                {snacksProducts.map((product) => (
                  <ProductCard key={`snacks-${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-12">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title">Trending now</h2>
              </div>
              <Link to="/shop?trending=1" className="text-sm font-semibold text-[#1b6f38] transition hover:text-[#14552a]">
                Explore trending
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              {trendingProducts.map((product) => (
                <ProductCard key={`${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="section-title">Fresh picks</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              {freshProducts.map((product) => (
                <ProductCard key={`${product.id}-${product.primaryVariant?.id || "primary"}`} product={product} />
              ))}
            </div>
          </section>

          <div className="mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
            <AppShowcase />
          </div>
        </>
      )}
    </div>
  );
}
