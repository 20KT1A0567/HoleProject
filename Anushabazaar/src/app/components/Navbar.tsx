import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router";
import { Bell, ChevronDown, CreditCard, LoaderCircle, LogOut, MapPin, Search, ShoppingBag, Truck, UserRound, X } from "lucide-react";
import { CART_BUMP_EVENT } from "../lib/cartAnimation";
import { openCartDrawer } from "./CartDrawer";
import { APP_COPY } from "../lib/config";
import { getRecentSearches, saveRecentSearch } from "../lib/customerExperience";
import { formatCurrency, getProductHref } from "../lib/storefrontUtils";
import { getProductSuggestions, getWalletBalance } from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useLocationStore } from "../store/locationStore";
import type { ProductSuggestion } from "../types/storefront";

export function Navbar() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const accountRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const productCount = useCartStore((state) => state.getProductCount());
  const subtotal = useCartStore((state) => state.getSubtotal());
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const logout = useAuthStore((state) => state.logout);

  const customerLocation = useLocationStore((state) => state.location);
  const isResolvingLocation = useLocationStore((state) => state.isResolving);
  const requestCurrentLocation = useLocationStore((state) => state.requestCurrentLocation);

  const [query, setQuery] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  const [cartAnimationToken, setCartAnimationToken] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const customerName = (profile?.name || session?.name || "").trim() || session?.phoneNumber || "Customer";
  const customerMeta = (profile?.email || session?.email || session?.phoneNumber || "").trim();
  const customerInitial = customerName.charAt(0).toUpperCase();
  const activeQueryFromUrl = useMemo(
    () => new URLSearchParams(routerLocation.search).get("q") || "",
    [routerLocation.search],
  );

  useEffect(() => {
    if (routerLocation.pathname === "/shop" && activeQueryFromUrl) {
      setQuery(activeQueryFromUrl);
      return;
    }

    setQuery("");
  }, [activeQueryFromUrl, routerLocation.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setShowAccountMenu(false);
    setShowSearchSuggestions(false);
    setSuggestions([]);
  }, [routerLocation.pathname, routerLocation.search]);

  useEffect(() => {
    const keyword = query.trim();

    if (!showSearchSuggestions) return;
    if (!keyword) {
      setSuggestions([]);
      setIsSearchingSuggestions(false);
      return;
    }

    let isMounted = true;
    setIsSearchingSuggestions(true);

    const timeout = window.setTimeout(() => {
      getProductSuggestions(keyword)
        .then((nextSuggestions) => {
          if (isMounted) {
            setSuggestions(nextSuggestions);
          }
        })
        .catch(() => {
          if (isMounted) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsSearchingSuggestions(false);
          }
        });
    }, 180);

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, [query, showSearchSuggestions]);

  useEffect(() => {
    const handleCartBump = () => {
      setCartAnimationToken((current) => current + 1);
    };

    window.addEventListener(CART_BUMP_EVENT, handleCartBump);
    return () => window.removeEventListener(CART_BUMP_EVENT, handleCartBump);
  }, []);

  useEffect(() => {
    if (!session?.accessToken || !session.customerId) {
      setWalletBalance(null);
      return;
    }

    let isMounted = true;
    getWalletBalance(session.customerId)
      .then((balance) => {
        if (isMounted) {
          setWalletBalance(balance);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWalletBalance(session.walletBalance ?? null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, session?.customerId, session?.walletBalance]);

  const handleSearchSubmit = (nextKeyword?: string) => {
    const keyword = (nextKeyword ?? query).trim();
    setShowSearchSuggestions(false);
    setSuggestions([]);
    if (!keyword) {
      navigate("/shop");
      return;
    }
    saveRecentSearch(keyword);
    setRecentSearches(getRecentSearches());
    navigate(`/shop?q=${encodeURIComponent(keyword)}`);
  };

  const handleSuggestionSelect = (suggestion: ProductSuggestion) => {
    setQuery(suggestion.name);
    setShowSearchSuggestions(false);
    setSuggestions([]);
    navigate(getProductHref({ id: suggestion.id, name: suggestion.name }));
  };

  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/shop", label: "Shop" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Support" },
    ],
    [],
  );

  const isActiveLink = (path: string) =>
    path === "/"
      ? routerLocation.pathname === path
      : routerLocation.pathname === path || routerLocation.pathname.startsWith(`${path}/`);

  const locationLabel = customerLocation.shortLabel || `${APP_COPY.defaultCity}, ${APP_COPY.defaultState}`;
  const trimmedQuery = query.trim();
  const trendingSearches = ["milk", "bread", "rice", "fruits", "snacks", "oil"];
  const showSuggestionPanel = showSearchSuggestions && (trimmedQuery.length > 0 || isSearchingSuggestions || recentSearches.length > 0);

  const searchSuggestionDropdown = (
              <AnimatePresence>
                {showSuggestionPanel ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-x-0 top-[calc(100%+0.75rem)] z-50 overflow-hidden rounded-[1.8rem] border border-[#d9e4cf] bg-white/98 shadow-[0_26px_50px_rgba(20,38,25,0.12)] backdrop-blur"
                  >

                    {!trimmedQuery && recentSearches.length > 0 ? (
                      <div className="border-b border-[#e8eee1] px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#768777]">
                          Recent searches
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {recentSearches.map((item) => (
                            <button
                              type="button"
                              key={item}
                              onClick={() => {
                                setQuery(item);
                                handleSearchSubmit(item);
                              }}
                              className="rounded-full border border-[#d9e4cf] bg-[#f8fbf4] px-3 py-2 text-xs font-semibold text-[#244b2b]"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {!trimmedQuery ? (
                      <div className="border-b border-[#e8eee1] px-4 py-4">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#768777]">
                          Trending searches
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {trendingSearches.map((item) => (
                            <button
                              type="button"
                              key={item}
                              onClick={() => {
                                setQuery(item);
                                handleSearchSubmit(item);
                              }}
                              className="rounded-full bg-[#edf4e3] px-3 py-2 text-xs font-semibold text-[#244b2b]"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {isSearchingSuggestions ? (
                      <div className="flex items-center gap-2 px-4 py-5 text-sm text-[#406144]">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Looking for matching products...
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="max-h-[440px] space-y-2 overflow-y-auto bg-[#f8faf5] p-2.5">
                        {suggestions.map((suggestion) => (
                          <button
                            type="button"
                            key={suggestion.id}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="group flex w-full items-center gap-3 rounded-[1.1rem] border border-transparent bg-transparent p-2 text-left transition duration-200 hover:bg-[#edf3e6] sm:gap-4 sm:p-3"
                          >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#edf1e7] bg-white shadow-sm sm:h-16 sm:w-16">
                              {suggestion.imageUrl ? (
                                <img src={suggestion.imageUrl} alt={suggestion.name} className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
                              ) : (
                                <Search className="h-4 w-4 text-[#608261]" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-bold text-[#17311d] sm:text-[15px]">{suggestion.name}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] sm:mt-1.5 sm:text-[10px]">
                                {suggestion.variantName ? (
                                  <span className="rounded-[0.4rem] border border-[#d6e5cd] bg-[#edf5e7] px-2 py-0.5 text-[#285333]">
                                    {suggestion.variantName}
                                  </span>
                                ) : null}
                                <span className={suggestion.isInStock ? "text-[#2f6a3a]" : "text-[#965c52]"}>
                                  {suggestion.isInStock ? "In stock" : "Out of stock"}
                                </span>
                              </div>
                              <div className="mt-1 truncate text-[10px] uppercase tracking-[0.1em] text-[#7b8c7c] sm:text-[11px]">
                                {[suggestion.categoryName, suggestion.subCategoryName].filter(Boolean).join(" • ")}
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end pl-2 sm:min-w-[100px]">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[15px] font-extrabold text-[#17311d] sm:text-lg">{formatCurrency(suggestion.price)}</span>
                                {suggestion.originalPrice > suggestion.price ? (
                                  <span className="text-[10px] text-[#9aa89d] line-through sm:text-xs">{formatCurrency(suggestion.originalPrice)}</span>
                                ) : null}
                              </div>
                              {suggestion.discountPercent > 0 ? (
                                <span className="mt-1 rounded-[0.4rem] bg-[#fff1d8] px-1.5 py-0.5 text-[9px] font-bold text-[#8a5a12] sm:px-2 sm:text-[10px]">
                                  {suggestion.discountPercent}% OFF
                                </span>
                              ) : null}
                            </div>
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleSearchSubmit()}
                          className="mt-2 flex w-full items-center justify-center rounded-[1.35rem] border border-[#d9e4cf] bg-[#f8fbf4] px-4 py-3 text-sm font-semibold text-[#204627] transition hover:bg-[#edf4e3]"
                        >
                          See all results for "{trimmedQuery}"
                        </button>
                      </div>
                    ) : trimmedQuery ? (
                      <div className="px-4 py-5 text-sm text-[#607361]">
                        No instant matches yet. Smart search will still check spellings and local keywords for "{trimmedQuery}".
                      </div>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-2xl transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-black/40">
      <div className="app-shell !py-4">
        <div className="flex flex-col gap-4">
          <div className="relative z-20 flex items-center justify-between gap-4">
            <div className="hidden min-w-0 items-center gap-3 lg:flex">
              <Link to="/" className="flex min-w-0 items-center gap-3">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.8,
                  }}
                  src="/brand-logo.png"
                  alt={APP_COPY.brand}
                  className="h-12 w-12 rounded-[1.1rem] border border-white/80 bg-white object-cover shadow-[0_18px_30px_rgba(18,42,25,0.12)] sm:h-14 sm:w-14 sm:rounded-[1.2rem]"
                />
                <div className="min-w-0">
                  <div className="truncate font-['Fraunces'] text-[clamp(1.55rem,4.8vw,2.55rem)] font-semibold tracking-tight text-[#17311d]">
                    {APP_COPY.brand}
                  </div>
                  <div className="truncate text-[11px] font-semibold uppercase tracking-[0.24em] text-[#728672]">
                    Fresh groceries for everyday ordering
                  </div>
                </div>
              </Link>
            </div>

            <nav className="hidden items-center gap-2 rounded-full border border-white/40 bg-white/50 px-2 py-2 shadow-sm backdrop-blur-md lg:flex">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActiveLink(link.to)
                      ? "bg-[#17381f] text-white"
                      : "text-[#24442b] hover:bg-[#edf4e3]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={() => void requestCurrentLocation()}
                title={customerLocation.fullLabel}
                className="inline-flex max-w-[260px] items-center gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-3 text-left shadow-[0_8px_16px_rgba(0,0,0,0.04)] backdrop-blur transition-all hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#e0f2d8] to-[#d1e9c5] text-[#2f6a3a] shadow-inner">
                  {isResolvingLocation ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#7a8b7b]">Current location</div>
                  <div className="truncate text-sm font-semibold text-[#17311d]">{locationLabel}</div>
                </div>
              </button>

              <div ref={accountRef} className="relative order-3">
                {session ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAccountMenu((value) => !value)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8e2cd] bg-white px-4 py-3 text-sm font-semibold text-[#18361d] shadow-[0_12px_24px_rgba(28,45,31,0.06)] transition hover:bg-[#f7faef]"
                    >
                      <UserRound className="h-4 w-4 text-[#2f6a3a]" />
                      <span className="max-w-[132px] truncate">{customerName}</span>
                    </button>

                    <AnimatePresence>
                      {showAccountMenu ? (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 12 }}
                          className="absolute right-0 top-[calc(100%+0.85rem)] z-[60] w-[min(22rem,calc(100vw-2rem))] rounded-[1.6rem] border border-[#dbe4d2] bg-white/98 p-4 shadow-[0_24px_48px_rgba(20,38,25,0.16)] backdrop-blur"
                        >
                          <div className="rounded-[1.35rem] border border-[#e2ead9] bg-[linear-gradient(180deg,#fbfcf8,#f4f8ef)] p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17381f] text-lg font-semibold text-white shadow-[0_12px_24px_rgba(22,56,31,0.18)]">
                                {customerInitial}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7a8d7a]">Signed in</p>
                                <h3 className="mt-2 truncate font-['Fraunces'] text-[1.9rem] leading-none text-[#17311d]">{customerName}</h3>
                                {customerMeta ? <p className="mt-2 truncate text-sm text-[#607160]">{customerMeta}</p> : null}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#dbe5d1] bg-[#f8fbf4] px-4 py-3">
                              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#214b29]">
                                <CreditCard className="h-4 w-4" />
                                Wallet
                              </div>
                              <div className="font-semibold text-[#17311d]">
                                {walletBalance == null ? "Syncing" : formatCurrency(walletBalance)}
                              </div>
                            </div>
                            <Link
                              to="/account"
                              onClick={() => setShowAccountMenu(false)}
                              className="rounded-2xl border border-[#dbe5d1] bg-[#f8fbf4] px-4 py-3 text-sm font-semibold text-[#214b29] transition hover:bg-[#eff6e7]"
                            >
                              My account
                            </Link>
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                to="/account?tab=orders"
                                onClick={() => setShowAccountMenu(false)}
                                className="rounded-2xl border border-[#dbe5d1] px-4 py-3 text-center text-sm font-semibold text-[#214b29] transition hover:bg-[#f8fbf4]"
                              >
                                Orders
                              </Link>
                              <Link
                                to="/account?tab=addresses"
                                onClick={() => setShowAccountMenu(false)}
                                className="rounded-2xl border border-[#dbe5d1] px-4 py-3 text-center text-sm font-semibold text-[#214b29] transition hover:bg-[#f8fbf4]"
                              >
                                Addresses
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                to="/account?tab=tracking"
                                onClick={() => setShowAccountMenu(false)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d8dfd0] px-4 py-3 text-sm font-semibold text-[#214b29] transition hover:bg-[#f8fbf4]"
                              >
                                <Truck className="h-4 w-4" />
                                Track
                              </Link>
                              <Link
                                to="/checkout"
                                onClick={() => setShowAccountMenu(false)}
                                className="inline-flex items-center justify-center rounded-2xl bg-[#edf4e3] px-4 py-3 text-sm font-semibold text-[#204627] transition hover:bg-[#e4efd6]"
                              >
                                Checkout
                              </Link>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setShowAccountMenu(false);
                                void logout();
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#ead4cf] px-4 py-3 text-sm font-semibold text-[#72433a] transition hover:bg-[#fff5f2]"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="inline-flex min-w-[126px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#d9e4cf] bg-white px-5 py-3 text-sm font-semibold text-[#18361d] shadow-[0_12px_24px_rgba(28,45,31,0.06)] transition hover:bg-[#f7faef]"
                  >
                    <UserRound className="h-4 w-4 text-[#2f6a3a]" />
                    Sign in
                  </button>
                )}
              </div>

              <motion.div
                key={`desktop-cart-${cartAnimationToken}`}
                initial={{ scale: 1 }}
                animate={cartAnimationToken === 0 ? { scale: 1 } : { scale: [1, 1.08, 0.98, 1] }}
                transition={{ duration: 0.38, ease: "easeOut" }}
                className="order-2"
              >
                <button
                  type="button"
                  onClick={openCartDrawer}
                  data-cart-target="true"
                  className="inline-flex min-w-[168px] items-center gap-3 rounded-full bg-[#17381f] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(22,56,31,0.22)]"
                >
                  <div className="relative">
                    <ShoppingBag className="h-4 w-4" />
                    {productCount > 0 ? (
                      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b7f35c] px-1 text-[10px] font-bold text-[#17311d]">
                        {productCount}
                      </span>
                    ) : null}
                  </div>
                  <div className="leading-tight">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">Cart</div>
                    <div className="whitespace-nowrap">{productCount > 0 ? formatCurrency(subtotal) : "View cart"}</div>
                  </div>
                </button>
              </motion.div>
            </div>

            <div className="flex w-full items-center gap-2 lg:hidden">
              <Link to="/" className="shrink-0">
                <motion.img 
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, duration: 0.8 }}
                  src="/brand-logo.png" 
                  alt="Logo" 
                  className="h-9 w-9 rounded-xl border-2 border-white/80 object-cover shadow-sm" 
                />
              </Link>

              <button
                type="button"
                onClick={() => void requestCurrentLocation()}
                className="flex shrink-0 items-center gap-0.5 text-left"
              >
                <MapPin className="h-4 w-4 text-[#10b981]" />
                <div className="max-w-[70px] truncate text-[11px] font-bold text-[#17311d]">
                  {customerLocation.shortLabel || "Location"}
                </div>
                <ChevronDown className="h-3 w-3 text-[#17311d]" />
              </button>

              <div className="relative flex-1" ref={searchRef}>
                <div
                  className={`flex items-center rounded-full border bg-white/90 px-2.5 py-2 shadow-sm transition ${
                    showSuggestionPanel
                      ? "border-[#cfe0bf]"
                      : "border-[#d9e4cf]"
                  }`}
                >
                  <Search className="mr-1.5 h-3.5 w-3.5 text-[#608261]" />
                  <input
                    type="text"
                    value={query}
                    onFocus={() => setShowSearchSuggestions(true)}
                    onClick={() => setRecentSearches(getRecentSearches())}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setShowSearchSuggestions(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearchSubmit();
                      }
                      if (event.key === "Escape") {
                        setShowSearchSuggestions(false);
                      }
                    }}
                    placeholder="Search..."
                    className="w-full bg-transparent text-[11px] text-[#112417] outline-none placeholder:text-[#8aa08b]"
                  />
                </div>
                {searchSuggestionDropdown}
              </div>
              
              <Link to="/account" className="relative shrink-0 text-[#17311d] hover:text-[#10b981] ml-0.5">
                <Bell className="h-5 w-5" />
                {productCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border-[1.5px] border-white bg-[#10b981]" />
                ) : null}
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-3">
            <div className="relative">
              <div
                className={`flex items-center rounded-[1.7rem] border bg-white/90 px-4 py-3 shadow-[0_14px_34px_rgba(23,42,28,0.05)] transition ${
                  showSuggestionPanel
                    ? "border-[#cfe0bf] shadow-[0_18px_40px_rgba(23,42,28,0.09)]"
                    : "border-[#d9e4cf]"
                }`}
              >
                <Search className="mr-3 h-4 w-4 text-[#608261]" />
                <input
                  type="text"
                  value={query}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onClick={() => setRecentSearches(getRecentSearches())}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                    if (event.key === "Escape") {
                      setShowSearchSuggestions(false);
                    }
                  }}
                  placeholder="Search milk, rice, biyyam, snacks..."
                  className="w-full bg-transparent text-sm text-[#112417] outline-none placeholder:text-[#8aa08b]"
                />
                <button
                  type="button"
                  onClick={() => handleSearchSubmit()}
                  className="inline-flex items-center justify-center rounded-full bg-[#edf4e3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#244b2b] transition hover:bg-[#e0eed3]"
                >
                  Search
                </button>
              </div>

              {searchSuggestionDropdown}
            </div>

            {/* Replaced Mobile Location/Account */}
          </div>

          {/* Removed Mobile Menu Items */}
        </div>
      </div>
    </header>
  );
}
