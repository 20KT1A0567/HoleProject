import { useEffect, useRef, useState } from "react";
import { Award, Check, Minus, Plus, ShoppingBag, Sparkles, Star, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import { triggerCartFeedback } from "../lib/cartAnimation";
import { formatCurrency, getProductHref } from "../lib/storefrontUtils";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types/storefront";

interface ProductCardProps {
  product: Product;
  fullWidth?: boolean;
}

export function ProductCard({ product, fullWidth = false }: ProductCardProps) {
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const quantity = useCartStore((state) =>
    product.primaryVariant
      ? state.cart.find((item) => item.variantId === product.primaryVariant!.id)?.quantity || 0
      : 0,
  );

  const sellingPrice = product.primaryVariant ? product.primaryVariant.discountPrice || product.primaryVariant.price : product.minPrice;
  const originalPrice = product.primaryVariant?.price || product.maxPrice || sellingPrice;
  const gallery = product.images?.length ? product.images : [product.imageUrl].filter(Boolean);
  const primaryImage = gallery[0] || product.imageUrl;
  const secondaryImage = gallery[1] || primaryImage;
  const hasHoverImage = Boolean(gallery[1] && gallery[1] !== gallery[0]);
  const primaryStock = Number(product.primaryVariant?.stock);
  const availableStock = Number.isFinite(primaryStock) ? Math.max(0, primaryStock) : undefined;
  const canAddMore = product.isInStock && (availableStock === undefined || quantity < availableStock);
  const stockLabel =
    availableStock === 0 ? "Out of stock" : availableStock !== undefined && availableStock <= 5 ? "Only few left" : "Available";

  useEffect(() => {
    if (!justAdded) return;

    const timer = window.setTimeout(() => {
      setJustAdded(false);
    }, 720);

    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const handleAddToCart = () => {
    if (!product.primaryVariant || !canAddMore) return;

    addItem(product, product.primaryVariant, 1);
    setJustAdded(true);
    triggerCartFeedback({
      imageUrl: primaryImage,
      sourceElement: imageFrameRef.current,
    });
  };

  return (
    <motion.article
      layout
      whileHover={{ y: -4, boxShadow: "0px 10px 30px rgba(0,0,0,0.06)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group flex h-full flex-col overflow-hidden rounded-[1rem] border border-[#e8ecec] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-300 sm:rounded-[1.2rem]"
    >
      <Link to={getProductHref(product)} className="relative block overflow-hidden bg-[#f8f9fa] p-3 sm:p-5">
        <div
          ref={imageFrameRef}
          className={`relative flex items-center justify-center overflow-hidden mix-blend-multiply ${
            fullWidth ? "aspect-[2/1] w-full sm:aspect-[16/9]" : "aspect-[4/5] w-full sm:aspect-square"
          }`}
        >
          {/* Top Left Badge (Discount) */}
          {product.discountPercent > 0 ? (
            <div className="absolute left-0 top-0 z-10 flex items-center justify-center rounded-br-xl bg-[#256fef] px-2 py-1 shadow-sm">
              <div className="flex flex-col items-center text-white">
                 <span className="text-[10px] sm:text-[11px] font-extrabold leading-none">{product.discountPercent}%</span>
                 <span className="text-[7px] sm:text-[8px] font-bold leading-none tracking-wider">OFF</span>
              </div>
            </div>
          ) : product.isTrending ? (
             <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-pink-100 px-2 py-1 text-[9px] font-bold text-pink-700 shadow-sm">
               Trending
             </span>
          ) : product.bestSeller ? (
             <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-yellow-100 px-2 py-1 text-[9px] font-bold text-yellow-800 shadow-sm">
               Best Seller
             </span>
          ) : null}

          {/* Delivery Timer Badge */}
          <div className="absolute bottom-0 left-0 z-10 rounded-tr-xl rounded-bl-lg bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#444] shadow-sm backdrop-blur">
            ⏱ 15 MINS
          </div>
          
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3.5">
        {/* Title */}
        <Link to={getProductHref(product)} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-[2.4rem] text-[12px] sm:text-[13px] font-semibold leading-[1.3] text-[#1f2937] transition group-hover:text-[#1d7c3f]">
            {product.name}
          </h3>
        </Link>
        
        {/* Weight / Variant */}
        <div className="mt-1 text-[10px] sm:text-[11px] font-medium text-[#6b7280]">
          {product.primaryVariant?.name || "1 Unit"}
        </div>

        {/* Bottom row: Price & Add Button */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-1">
          <div className="flex flex-col justify-center">
            <span className="text-[13px] sm:text-[14px] font-extrabold text-[#111827] leading-none">{formatCurrency(sellingPrice)}</span>
            {originalPrice > sellingPrice ? (
              <span className="text-[10px] sm:text-[11px] text-[#9ca3af] line-through mt-0.5">{formatCurrency(originalPrice)}</span>
            ) : <span className="h-[14px] sm:h-[16px] mt-0.5"></span>}
          </div>

          <div className="w-[64px] sm:w-[72px] shrink-0">
            {!product.primaryVariant || !product.isInStock ? (
              <button disabled className="h-8 sm:h-9 w-full rounded-lg bg-gray-100 text-[10px] font-bold text-gray-400">
                OUT
              </button>
            ) : (
              <AnimatePresence initial={false} mode="wait">
                {quantity > 0 ? (
                  <motion.div
                    key="quantity"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex h-8 sm:h-9 w-full items-center justify-between rounded-lg bg-[#318616] px-0.5 sm:px-1 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity(product.primaryVariant!.id, quantity - 1)}
                      className="flex h-7 w-7 sm:h-7 sm:w-7 items-center justify-center text-white hover:bg-white/10 rounded-md"
                    >
                      <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <span className="text-[11px] sm:text-xs font-bold text-white">{quantity}</span>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!canAddMore}
                      className="flex h-7 w-7 sm:h-7 sm:w-7 items-center justify-center text-white hover:bg-white/10 rounded-md opacity-90 disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="add"
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddToCart}
                    className="flex h-8 sm:h-9 w-full items-center justify-center rounded-lg border border-[#318616] bg-[#f4fcf6] text-[11px] sm:text-xs font-bold text-[#318616] shadow-sm transition-colors hover:bg-[#318616] hover:text-white"
                  >
                    ADD
                  </motion.button>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
