import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Gift,
  LoaderCircle,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { HorizontalProductCarousel } from "../components/HorizontalProductCarousel";
import { triggerCartFeedback } from "../lib/cartAnimation";
import { getDeliveryEtaText, getStockLabel, saveNotifyRequest } from "../lib/customerExperience";
import {
  formatCurrency,
  getCategoryHref,
  parseProductId,
} from "../lib/storefrontUtils";
import { getActiveFreeItemOffers, getProductById, getProductRatings, getProducts, submitProductRating } from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import type { FreeItemOffer, Product as ProductType, Variant } from "../types/storefront";

export function Product() {
  const { slug } = useParams();
  const productId = parseProductId(slug);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);

  const [product, setProduct] = useState<ProductType | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductType[]>([]);
  const [activeFreeItemOffers, setActiveFreeItemOffers] = useState<FreeItemOffer[]>([]);
  const [productRatings, setProductRatings] = useState<Array<{ id?: number; rating: number; comment?: string; customerName?: string; createdAt?: string }>>([]);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const session = useAuthStore((state) => state.session);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setIsLoading(false);
      setError("We could not find that product.");
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError("");

    getProductById(productId)
      .then(async (nextProduct) => {
        if (!isMounted) return;
        setProduct(nextProduct);
        setSelectedVariantId(nextProduct.primaryVariant?.id || nextProduct.variants[0]?.id || null);
        setSelectedImageIndex(0);

        const related = await getProducts({
          categoryId: nextProduct.categoryId || undefined,
          subCategoryId: nextProduct.subCategoryId || undefined,
        });

        const trending = await getProducts({
          trending: true,
        });

        if (!isMounted) return;
        setRelatedProducts(related.filter((item) => item.id !== nextProduct.id).slice(0, 10));
        setTrendingProducts(trending.filter((item) => item.id !== nextProduct.id).slice(0, 10));
      })
      .catch((loadError: any) => {
        if (!isMounted) return;
        setError(loadError?.message || "Unable to load the product details.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!Number.isFinite(productId)) return;
    let isMounted = true;
    getProductRatings(productId)
      .then((ratings) => {
        if (isMounted) {
          setProductRatings(ratings);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProductRatings([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let isMounted = true;

    getActiveFreeItemOffers()
      .then((offers) => {
        if (isMounted) {
          setActiveFreeItemOffers(offers);
        }
      })
      .catch(() => {
        if (isMounted) {
          setActiveFreeItemOffers([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedVariant = useMemo<Variant | null>(() => {
    if (!product) return null;
    return (
      product.variants.find((variant) => variant.id === selectedVariantId) ||
      product.primaryVariant ||
      product.variants[0] ||
      null
    );
  }, [product, selectedVariantId]);

  const quantityInCart = useCartStore((state) =>
    selectedVariant
      ? state.cart.find((item) => item.variantId === selectedVariant.id)?.quantity || 0
      : 0,
  );
  const gallery = product?.images?.length ? product.images : product?.imageUrl ? [product.imageUrl] : [];
  const activeImage = gallery[selectedImageIndex] || product?.imageUrl || "";
  const sellingPrice = selectedVariant ? selectedVariant.discountPrice || selectedVariant.price : product?.minPrice || 0;
  const originalPrice = selectedVariant?.price || product?.maxPrice || sellingPrice;
  const selectedStock = Number(selectedVariant?.stock);
  const availableStock = Number.isFinite(selectedStock) ? Math.max(0, selectedStock) : undefined;
  const selectedVariantInStock = Boolean(selectedVariant) && (availableStock === undefined || availableStock > 0);
  const canAddMore = selectedVariantInStock && (availableStock === undefined || quantityInCart < availableStock);
  const productOfferHighlights = useMemo(() => {
    if (!product) return [] as Array<{ offer: FreeItemOffer; type: "qualifying" | "free" }>;

    return activeFreeItemOffers
      .map((offer) => {
        const isQualifyingMatch = offer.qualifyingByProduct
          ? offer.qualifyingProductId === product.id
          : offer.qualifyingVariantId === selectedVariant?.id;
        const isFreeMatch = offer.freeVariantId === selectedVariant?.id || offer.freeProductId === product.id;

        if (isQualifyingMatch) {
          return { offer, type: "qualifying" } as const;
        }

        if (isFreeMatch) {
          return { offer, type: "free" } as const;
        }

        return null;
      })
      .filter((item): item is { offer: FreeItemOffer; type: "qualifying" | "free" } => Boolean(item))
      .slice(0, 2);
  }, [activeFreeItemOffers, product, selectedVariant?.id]);

  useEffect(() => {
    if (!justAdded) return;

    const timer = window.setTimeout(() => {
      setJustAdded(false);
    }, 720);

    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant || !canAddMore) return;

    addItem(product, selectedVariant, 1);
    setJustAdded(true);
    triggerCartFeedback({
      imageUrl: activeImage || product.imageUrl,
      sourceElement: imageFrameRef.current,
    });
  };

  const handleNotifyMe = () => {
    if (!product) return;
    saveNotifyRequest({
      productId: product.id,
      variantId: selectedVariant?.id,
      productName: product.name,
    });
    toast.success("We saved this notify request for your account flow.");
  };

  const handleSubmitProductRating = async () => {
    if (!product) return;
    if (!session?.accessToken) {
      openAuthModal();
      return;
    }

    setIsSubmittingRating(true);
    try {
      await submitProductRating({
        productId: product.id,
        rating: ratingValue,
        comment: ratingComment.trim(),
      });
      toast.success("Product review submitted.");
      setRatingComment("");
      const nextRatings = await getProductRatings(product.id);
      setProductRatings(nextRatings);
    } catch (error: any) {
      toast.error(error?.message || "You can rate products after they are delivered.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-shell flex min-h-[55vh] items-center justify-center text-[#406144]">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
        Loading product details...
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="app-shell-narrow text-center">
        <h1 className="page-title">Product not found</h1>
        <p className="mt-4 text-sm text-[#607361]">{error || "This product may have been removed or renamed."}</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#17381f] px-5 py-3 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="app-shell pb-32 md:pb-12 overflow-x-hidden">
      <Link
        to={product.categoryId && product.categoryName ? getCategoryHref({ id: product.categoryId, name: product.categoryName }) : "/shop"}
        className="inline-flex items-center gap-2 rounded-full border border-[#d7e1ce] bg-white/85 px-4 py-2 text-sm font-semibold text-[#1f4225] shadow-[0_12px_24px_rgba(23,42,28,0.04)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <div className="mt-6 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[3rem] border border-white/40 bg-white/60 p-5 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-black/40 dark:border-white/10"
        >
          <div
            ref={imageFrameRef}
            className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#f8fbf5] to-[#edf4e3] dark:from-black/20 dark:to-white/5"
          >
            <div className="flex h-[280px] md:h-[clamp(18rem,58vw,27.5rem)] items-center justify-center p-2 sm:p-8 lg:p-10">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-full w-full object-contain drop-shadow-[0_24px_60px_rgba(171,152,47,0.18)]"
              />
            </div>
          </div>
          {gallery.length > 1 ? (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {gallery.slice(0, 8).map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  className={`overflow-hidden rounded-[1.5rem] border transition-all ${
                    selectedImageIndex === index ? "border-[#10b981] shadow-[0_8px_20px_rgba(16,185,129,0.2)]" : "border-white/40 hover:border-[#10b981]/50"
                  } bg-white dark:bg-black/40`}
                >
                  <div className="flex h-20 items-center justify-center bg-gradient-to-br from-white/60 to-transparent p-2 dark:from-white/10">
                    <img
                      src={image}
                      alt={`${product.name} preview ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-[3rem] border border-white/40 bg-white/60 p-5 md:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:bg-black/40 dark:border-white/10"
        >
          <div className="flex flex-wrap gap-2">
            {product.categoryName ? (
              <span className="rounded-full bg-gradient-to-r from-[#10b981]/20 to-[#047857]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">
                {product.categoryName}
              </span>
            ) : null}
          </div>

          <h1 className="page-title mt-4 md:mt-6 leading-[1.05] md:text-5xl text-3xl">
            {product.name}
          </h1>

          <p className="mt-3 md:mt-5 text-[1rem] md:text-[1.1rem] leading-snug md:leading-7 text-[#4d5e50] dark:text-white/70 line-clamp-3 md:line-clamp-none">
            {product.description || "Fresh groceries and daily essentials selected for easy ordering."}
          </p>

          <div className="mt-5 md:mt-8 flex items-end gap-3 md:gap-4">
            <div className="text-3xl md:text-[2.8rem] font-black text-[#061109] leading-none tracking-tight dark:text-white">{formatCurrency(sellingPrice)}</div>
            {originalPrice > sellingPrice ? (
              <div className="pb-1 text-xl text-[#95a39a] line-through decoration-2 decoration-[#10b981]/40">{formatCurrency(originalPrice)}</div>
            ) : null}
            {originalPrice > sellingPrice ? (
              <div className="mb-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]">
                Save {Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)}%
              </div>
            ) : null}
          </div>

          {productOfferHighlights.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {productOfferHighlights.map(({ offer, type }) => {
                const qualifyingLabel = offer.qualifyingVariantName || offer.qualifyingProductName || "selected pack";
                const freeLabel = offer.freeVariantName || offer.freeProductName || "bonus item";
                return (
                  <div
                    key={`${offer.id}-${type}`}
                    className="rounded-[1.6rem] border border-[#dbe5d1] bg-[#f8fbf4] p-4 shadow-[0_12px_24px_rgba(23,42,28,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_10px_20px_rgba(23,42,28,0.04)]">
                        {type === "qualifying" ? (
                          <Sparkles className="h-5 w-5 text-[#2f6a3a]" />
                        ) : (
                          <Gift className="h-5 w-5 text-[#2f6a3a]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#17311d]">
                          {type === "qualifying" ? "Free-item offer on this product" : "This product is part of a free-item offer"}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-[#607361]">
                          {type === "qualifying"
                            ? `Buy ${offer.qualifyingQuantity} x ${qualifyingLabel} and get ${offer.freeQuantity} x ${freeLabel} free.`
                            : `Customers get ${offer.freeQuantity} x ${freeLabel} free when they buy ${offer.qualifyingQuantity} x ${qualifyingLabel}.`}
                        </p>
                        {offer.description ? (
                          <p className="mt-1 text-sm leading-6 text-[#607361]">{offer.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { icon: Truck, title: "Fast fulfilment", desc: "Quick commerce ready" },
              { icon: ShieldCheck, title: "Secure order", desc: "Protected checkout flow" },
              { icon: PackageCheck, title: "Variant aware", desc: "Add exact pack sizes" },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-[1.8rem] border border-white/40 bg-white/50 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(16,185,129,0.1)] dark:bg-black/30 dark:border-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#10b981]/20 to-[#047857]/20 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-[#10b981]" />
                </div>
                <div className="mt-4 font-bold text-[#061109] dark:text-white">{feature.title}</div>
                <div className="mt-1 text-sm text-[#4d5e50] dark:text-white/70">{feature.desc}</div>
              </div>
            ))}
          </div>

          {product.variants.length > 0 ? (
            <div className="mt-8">
              <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#69806b]">
                Choose a pack
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {product.variants.map((variant) => {
                  const isSelected = variant.id === selectedVariant?.id;
                  const variantSellingPrice = variant.discountPrice || variant.price;
                  const variantStock = Number(variant.stock);
                  const variantInStock = !Number.isFinite(variantStock) || variantStock > 0;
                  return (
                    <button
                      type="button"
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`rounded-[1.8rem] border px-5 py-5 text-left transition-all ${
                        isSelected
                          ? "border-[#10b981] bg-gradient-to-br from-[#10b981]/10 to-transparent shadow-[0_14px_28px_rgba(16,185,129,0.15)]"
                          : "border-white/40 bg-white/50 hover:border-[#10b981]/50 dark:bg-black/30 dark:border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-[1.1rem] text-[#061109] dark:text-white">{variant.name}</div>
                          <div className={`mt-1 text-xs font-bold uppercase tracking-[0.18em] ${variantInStock ? "text-[#10b981]" : "text-rose-500"}`}>
                            {variantInStock ? getStockLabel(variant.stock) : "Out of stock"}
                          </div>
                        </div>
                        {isSelected ? <CheckCircle2 className="h-6 w-6 text-[#10b981]" /> : null}
                      </div>
                      <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#061109] dark:text-white">{formatCurrency(variantSellingPrice)}</span>
                        {variant.price > variantSellingPrice ? (
                          <span className="text-sm font-semibold text-[#95a39a] line-through">{formatCurrency(variant.price)}</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8 rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] backdrop-blur-md dark:bg-black/30 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Selected option</div>
                <div className="mt-2 text-2xl font-black text-[#061109] dark:text-white">
                  {selectedVariant?.name || "Default pack"}
                </div>
                <div className="mt-2 text-sm font-semibold text-[#4d5e50] dark:text-white/70">
                  {selectedVariant?.stock && selectedVariant.stock > 0
                    ? getStockLabel(selectedVariant.stock)
                    : "Out of stock"}
                </div>
                <div className="mt-1 text-sm font-bold text-[#10b981]">{getDeliveryEtaText()}</div>
              </div>

              {selectedVariant ? (
                <AnimatePresence initial={false} mode="wait">
                  {quantityInCart > 0 ? (
                    <motion.div
                      key="quantity"
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: justAdded ? [0.97, 1.02, 1] : 1,
                      }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-full bg-[#17381f] px-3 py-2 text-white shadow-[0_18px_32px_rgba(22,56,31,0.22)]"
                    >
                      <div className="flex items-center gap-3">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setQuantity(selectedVariant.id, quantityInCart - 1)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/18"
                        >
                          {quantityInCart === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </motion.button>
                        <div className="min-w-[4.2rem] text-center">
                          <div className="text-lg font-semibold leading-none">{quantityInCart}</div>
                          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/58">In cart</div>
                        </div>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={handleAddToCart}
                          disabled={!canAddMore}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#8ad33c] text-[#18361d] transition hover:bg-[#9ce14f] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/45"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                      <motion.button
                      key="add"
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      onClick={handleAddToCart}
                      disabled={!selectedVariantInStock}
                      className="inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#10b981] to-[#047857] px-8 text-[1.1rem] font-bold text-white shadow-[0_12px_24px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_16px_32px_rgba(16,185,129,0.4)] disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      {selectedVariantInStock ? "Add to basket" : "Out of stock"}
                    </motion.button>
                  )}
                </AnimatePresence>
              ) : null}
            </div>
            {!selectedVariantInStock ? (
              <button
                type="button"
                onClick={handleNotifyMe}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#d8e2cf] bg-[#f8fbf4] px-5 py-3 text-sm font-semibold text-[#214b29] transition hover:bg-[#eff6e7]"
              >
                <Bell className="h-4 w-4" />
                Notify me when available
              </button>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 text-sm text-[#556857] sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-[#dbe5d1] bg-[#f9faf6] p-4">
              <div className="flex items-center gap-2 font-semibold text-[#203f25]">
                <Gift className="h-4 w-4 text-[#2f6a3a]" />
                Offer details
              </div>
              <p className="mt-2 leading-6">
                {productOfferHighlights.length > 0
                  ? "This product currently has a free-item offer, so the benefit is shown before checkout."
                  : "When this product joins a promotion, the offer details will appear here automatically."}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-[#dbe5d1] bg-[#f9faf6] p-4">
              <div className="flex items-center gap-2 font-semibold text-[#203f25]">
                <ShieldCheck className="h-4 w-4 text-[#2f6a3a]" />
                Why it works better now
              </div>
              <p className="mt-2 leading-6">
                Pack sizes, pricing, and savings are organized more clearly so you can choose faster.
              </p>
            </div>
          </div>
        </motion.section>
      </div>

      <HorizontalProductCarousel title="Hot deals" products={trendingProducts} />
      <HorizontalProductCarousel title="Your daily fresh needs" products={relatedProducts} />

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,244,236,0.98))] p-6 shadow-[0_18px_42px_rgba(23,38,25,0.06)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#718571]">
            <Star className="h-4 w-4 text-[#d7a74f]" />
            Product review
          </div>
          <h2 className="mt-3 font-['Fraunces'] text-3xl text-[#17311d]">Rate this product</h2>
          <p className="mt-2 text-sm leading-6 text-[#607361]">
            Backend allows reviews only after a delivered order, so fake ratings are blocked automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRatingValue(value)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                  value <= ratingValue ? "border-[#d7a74f] bg-[#fff5d9] text-[#8a6932]" : "border-[#d9e4cf] bg-white text-[#7b8d7b]"
                }`}
              >
                <Star className="h-4 w-4" />
              </button>
            ))}
          </div>
          <textarea
            value={ratingComment}
            onChange={(event) => setRatingComment(event.target.value)}
            rows={3}
            placeholder="Share a short review"
            className="mt-4 w-full rounded-[1.2rem] border border-[#d9e4cf] bg-white px-4 py-3 text-sm text-[#17311d] outline-none focus:border-[#1d7c3f]"
          />
          <button
            type="button"
            onClick={() => void handleSubmitProductRating()}
            disabled={isSubmittingRating}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#10b981] to-[#047857] px-8 font-bold text-white shadow-[0_8px_16px_rgba(16,185,129,0.25)] transition-all hover:scale-105 hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmittingRating ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Star className="h-5 w-5" />}
            Submit review
          </button>
        </div>

        <div className="rounded-[2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,244,236,0.98))] p-6 shadow-[0_18px_42px_rgba(23,38,25,0.06)]">
          <h2 className="font-['Fraunces'] text-3xl text-[#17311d]">Customer reviews</h2>
          {productRatings.length > 0 ? (
            <div className="mt-5 space-y-3">
              {productRatings.slice(0, 5).map((rating, index) => (
                <div key={rating.id || `${rating.customerName}-${index}`} className="rounded-[1.4rem] border border-[#dbe5d1] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[#17311d]">{rating.customerName || "Customer"}</div>
                    <div className="flex items-center gap-1 text-[#d7a74f]">
                      {Array.from({ length: Math.max(1, Math.min(5, rating.rating)) }).map((_, starIndex) => (
                        <Star key={starIndex} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  {rating.comment ? <p className="mt-2 text-sm leading-6 text-[#607361]">{rating.comment}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d7e1ce] bg-white px-4 py-5 text-sm text-[#607361]">
              No customer reviews yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
