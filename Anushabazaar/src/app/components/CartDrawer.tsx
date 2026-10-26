import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatCurrency, getProductHref } from "../lib/storefrontUtils";
import { useCartStore } from "../store/cartStore";

export const OPEN_CART_DRAWER_EVENT = "anushabazaar:open-cart-drawer";

export function openCartDrawer() {
  window.dispatchEvent(new Event(OPEN_CART_DRAWER_EVENT));
}

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const hasOutOfStockItems = cart.some((item) => {
    const s = Number(item.stock);
    return Number.isFinite(s) && s <= 0;
  });

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener(OPEN_CART_DRAWER_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CART_DRAWER_EVENT, handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[70] hidden bg-[#102417]/35 backdrop-blur-sm lg:block"
          />
          <motion.aside
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.35, type: "spring", bounce: 0, damping: 20 }}
            className="fixed bottom-0 right-0 top-0 z-[80] hidden w-[min(30rem,100vw)] border-l border-white/20 bg-white/80 backdrop-blur-2xl shadow-[-20px_0_60px_rgba(0,0,0,0.15)] dark:bg-black/60 lg:flex lg:flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#e4eadc] px-5 py-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#718571]">Cart drawer</div>
                <h2 className="font-['Fraunces'] text-3xl text-[#17311d]">Basket preview</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/50 text-[#17311d] shadow-sm backdrop-blur transition-all hover:bg-white/80 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cart.length ? (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const stock = Number(item.stock);
                    const isOutOfStock = Number.isFinite(stock) && stock <= 0;
                    const canIncrease = !isOutOfStock && (!Number.isFinite(stock) || item.quantity < stock);
                    return (
                      <div key={item.variantId} className={`rounded-[1.4rem] border bg-white/40 backdrop-blur-md p-4 shadow-sm transition-all hover:shadow-md dark:bg-white/5 dark:border-white/10 ${isOutOfStock ? "border-red-300/50" : "border-white/60"}`}>
                        {isOutOfStock && (
                          <div className="mb-2 rounded-full bg-red-50 px-3 py-1 text-center text-xs font-semibold uppercase tracking-wider text-red-600">
                            Out of stock — remove to continue
                          </div>
                        )}
                        <div className="flex gap-3">
                          <Link to={getProductHref({ id: item.productId, name: item.name })} onClick={() => setIsOpen(false)}>
                            <div className="flex h-20 w-20 items-center justify-center rounded-[1rem] bg-[#f0f5e8] p-2">
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                            </div>
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-[#17311d]">{item.name}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-[#7b8d7b]">{item.variantName}</div>
                            <div className="mt-2 font-semibold text-[#102417]">{formatCurrency(item.unitPrice)}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 rounded-full bg-[#17381f] px-2 py-1.5 text-white">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
                            >
                              {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              disabled={!canIncrease}
                              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8ad33c] text-[#18361d] disabled:bg-white/15 disabled:text-white/45"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="text-sm font-semibold text-[#8a4f41]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-[#d7e1ce] bg-white px-5 py-10 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-[#2f6a3a]" />
                  <div className="mt-4 font-semibold text-[#17311d]">Your cart is empty</div>
                  <p className="mt-2 text-sm text-[#607361]">Add products and they will appear here instantly.</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#e4eadc] p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#758975]">Subtotal</span>
                <span className="font-['Fraunces'] text-3xl text-[#17311d]">{formatCurrency(subtotal)}</span>
              </div>
              {hasOutOfStockItems && (
                <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
                  Remove out-of-stock items before checking out.
                </p>
              )}
              <Link
                to={cart.length && !hasOutOfStockItems ? "/checkout" : "/shop"}
                onClick={() => setIsOpen(false)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-[1.2rem] px-5 py-4 text-sm font-bold tracking-wide text-white transition-all shadow-[0_8px_16px_rgba(16,185,129,0.2)] hover:shadow-[0_12px_24px_rgba(16,185,129,0.3)] ${hasOutOfStockItems ? "pointer-events-none bg-gray-400/50 backdrop-blur" : "bg-gradient-to-r from-[#10b981] to-[#047857]"}`}
                aria-disabled={hasOutOfStockItems}
              >
                {cart.length && !hasOutOfStockItems ? "Checkout" : cart.length ? "Remove out-of-stock items" : "Shop products"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
