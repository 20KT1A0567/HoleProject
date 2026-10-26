import { useRef, useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus } from "lucide-react";
import { formatCurrency, getProductHref } from "../lib/storefrontUtils";
import { triggerCartFeedback } from "../lib/cartAnimation";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types/storefront";

interface HorizontalProductCarouselProps {
  title: string;
  products: Product[];
}

export function HorizontalProductCarousel({ title, products }: HorizontalProductCarouselProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="mt-8 mb-6 xl:px-0">
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="text-[1.1rem] font-bold text-[#17311d] dark:text-white">{title}</h2>
        <button type="button" className="text-[13px] font-bold text-[#10b981]">
          see all
        </button>
      </div>

      <div className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {products.map((product) => (
          <CompactProductCard key={product.id} product={product} />
        ))}
        {/* Empty spacing div at the end to allow the last card to be scrolled fully into view */}
        <div className="w-1 shrink-0" />
      </div>
    </section>
  );
}

function CompactProductCard({ product }: { product: Product }) {
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const quantity = useCartStore((state) =>
    product.primaryVariant
      ? state.cart.find((item) => item.variantId === product.primaryVariant!.id)?.quantity || 0
      : 0,
  );

  const sellingPrice = product.primaryVariant ? product.primaryVariant.discountPrice || product.primaryVariant.price : product.minPrice;
  const originalPrice = product.primaryVariant?.price || product.maxPrice || sellingPrice;
  const primaryImage = product.images?.[0] || product.imageUrl;
  
  const primaryStock = Number(product.primaryVariant?.stock);
  const availableStock = Number.isFinite(primaryStock) ? Math.max(0, primaryStock) : undefined;
  const canAddMore = product.isInStock && (availableStock === undefined || quantity < availableStock);
  const discountPercent = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 720);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.primaryVariant || !canAddMore) return;

    addItem(product, product.primaryVariant, 1);
    setJustAdded(true);
    triggerCartFeedback({
      imageUrl: primaryImage,
      sourceElement: imageFrameRef.current,
    });
  };

  return (
    <div className="group relative flex w-[145px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.2rem] border border-[#e8f0e0] bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-black/40">
      <Link to={getProductHref(product)} className="block flex-1 p-2 pb-0">
        <div
          ref={imageFrameRef}
          className="relative mb-2 h-[110px] w-full overflow-hidden rounded-xl bg-[#f8fbf5] p-2 dark:bg-white/5"
        >
          {discountPercent > 0 && (
            <div className="absolute left-0 top-0 rounded-br-lg bg-[#10b981] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm z-10">
              -{discountPercent}%
            </div>
          )}
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain mix-blend-multiply dark:mix-blend-normal"
          />
        </div>

        <div className="flex h-[18px] items-center">
          <span className="rounded-[4px] bg-[#f0fdf4] px-1 py-0.5 text-[9px] font-bold text-[#15803d] dark:bg-[#15803d]/20 dark:text-[#4ade80]">
            18 MINS
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 min-h-[32px] text-[13px] font-semibold leading-tight text-[#17311d] dark:text-white/90">
          {product.name}
        </h3>
        <div className="mt-1 text-[10px] text-[#607361] dark:text-white/50">
          {product.primaryVariant?.name || "1 pack"}
        </div>
      </Link>

      <div className="mt-auto flex items-end justify-between p-2 pt-1">
        <div>
          <div className="flex flex-col">
             <span className="text-sm font-bold text-[#061109] dark:text-white leading-none">
               {formatCurrency(sellingPrice)}
             </span>
             {originalPrice > sellingPrice && (
               <span className="text-[10px] text-[#95a39a] line-through mt-0.5">
                 {formatCurrency(originalPrice)}
               </span>
             )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddMore}
          className="flex h-[26px] min-w-[48px] items-center justify-center rounded-[0.4rem] bg-[#f0fdf4] border border-[#bbf7d0] px-2 text-[11px] font-bold text-[#15803d] transition-colors hover:bg-[#dcfce7] disabled:opacity-50 dark:bg-[#15803d]/20 dark:border-[#15803d]/40 dark:text-[#4ade80] dark:hover:bg-[#15803d]/30"
          aria-label={`Add ${product.name} to cart`}
        >
          {quantity > 0 ? (
            <span className="flex items-center gap-0.5">
              <Plus className="h-2.5 w-2.5" />
              {quantity}
            </span>
          ) : (
            "ADD"
          )}
        </button>
      </div>
    </div>
  );
}
