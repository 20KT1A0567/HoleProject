import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  Gift,
  Globe,
  Heart,
  Info,
  LoaderCircle,
  LocateFixed,
  LogOut,
  MapPin,
  PackageCheck,
  Phone,
  PhoneCall,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { APP_COPY } from "../lib/config";
import { downloadInvoicePdf } from "../lib/customerExperience";
import { formatPaymentMethodLabel } from "../lib/storefrontUtils";
import {
  deleteAddress,
  getActiveCoupons,
  getAddresses,
  getDeliveryRatingStatus,
  getOrderTracking,
  getOrders,
  getProductById,
  getWalletBalance,
  getWalletHistory,
  getWishlist,
  requestRefund,
  saveAddress,
  submitDeliveryRating,
} from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import type { Address, OrderTracking, PlacedOrder, Product, Variant } from "../types/storefront";

type AccountTab = "overview" | "orders" | "addresses" | "tracking" | "wishlist" | "coupons" | "payments" | "notifications" | "help" | "settings" | "language";

const accountTabs: AccountTab[] = ["overview", "orders", "addresses", "tracking", "wishlist", "coupons", "payments", "notifications", "help", "settings", "language"];

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeOrderStatus = (value?: string) => (value || "PENDING").trim().toUpperCase().replace(/[\s-]+/g, "_");

const isTrackableStatus = (value?: string) => {
  const status = normalizeOrderStatus(value);
  return !["DELIVERED", "CANCELLED", "STORE_REJECTED", "REJECTED"].includes(status);
};

const formatOrderDate = (value?: string) => {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatTrackingUpdate = (value?: string) => {
  if (!value) return "Waiting for the next delivery update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Waiting for the next delivery update";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatAddressSummary = (address?: Address | PlacedOrder["address"] | null) =>
  [
    address?.flatNumber,
    address?.addressLine1,
    address?.addressLine2,
    address?.landmark,
    address?.city,
    address?.state,
    address?.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

const statusTone = (value?: string) => {
  const status = normalizeOrderStatus(value);

  if (["DELIVERED", "COMPLETED"].includes(status)) {
    return {
      label: "Delivered",
      className: "border-[#d2e7cb] bg-[#eef9e7] text-[#26613a]",
    };
  }

  if (["CANCELLED", "STORE_REJECTED", "REJECTED"].includes(status)) {
    return {
      label: status === "STORE_REJECTED" ? "Store rejected" : "Cancelled",
      className: "border-[#f0d4cf] bg-[#fff3f1] text-[#8c4a40]",
    };
  }

  if (["OUT_FOR_DELIVERY", "EN_ROUTE_TO_CUSTOMER"].includes(status)) {
    return {
      label: "Out for delivery",
      className: "border-[#d6e6ff] bg-[#eef5ff] text-[#2857a6]",
    };
  }

  if (["RIDER_ASSIGNED", "ASSIGNED", "BROADCASTED_TO_RIDERS", "REACHED_STORE", "EN_ROUTE_TO_STORE", "PICKED_UP", "PICKUP_OTP_VERIFIED"].includes(status)) {
    return {
      label: "Rider assigned",
      className: "border-[#d6e6ff] bg-[#eef5ff] text-[#2857a6]",
    };
  }

  if (["STORE_ACCEPTED", "ACCEPTED", "CONFIRMED", "PROCESSING", "PACKED", "READY", "PICKUP_OTP_GENERATED", "STORE_NOTIFIED"].includes(status)) {
    return {
      label: "Store confirmed",
      className: "border-[#efe3c5] bg-[#fff8ea] text-[#8c6631]",
    };
  }

  return {
    label: toTitleCase(status),
    className: "border-[#dce5d4] bg-[#f4f8ef] text-[#4f6a55]",
  };
};

const getTrackingStepIndex = (value?: string) => {
  const status = normalizeOrderStatus(value);

  if (["DELIVERED", "COMPLETED"].includes(status)) return 4;
  if (["OUT_FOR_DELIVERY", "EN_ROUTE_TO_CUSTOMER"].includes(status)) return 3;
  if (["RIDER_ASSIGNED", "ASSIGNED", "BROADCASTED_TO_RIDERS", "REACHED_STORE", "EN_ROUTE_TO_STORE", "PICKED_UP", "PICKUP_OTP_VERIFIED"].includes(status)) return 2;
  if (["STORE_ACCEPTED", "ACCEPTED", "CONFIRMED", "PROCESSING", "PACKED", "READY", "PICKUP_OTP_GENERATED", "STORE_NOTIFIED"].includes(status)) return 1;
  return 0;
};

const buildFallbackVariant = (item: PlacedOrder["items"][number]): Variant => ({
  id: item.variantId,
  name: item.variantName || "Standard pack",
  price: item.unitPrice,
  stock: 999,
  isActive: true,
});

const buildFallbackProduct = (item: PlacedOrder["items"][number]): Product => {
  const fallbackVariant = buildFallbackVariant(item);

  return {
    id: item.productId,
    name: item.productName,
    description: "",
    isActive: true,
    isTrending: false,
    bestSeller: false,
    displayOrder: 0,
    imageUrl: item.imageUrl || "",
    videoUrl: null,
    categoryId: null,
    categoryName: "",
    subCategoryId: null,
    subCategoryName: "",
    storeId: null,
    storeName: item.storeName || "",
    images: item.imageUrl ? [item.imageUrl] : [],
    variants: [fallbackVariant],
    minPrice: item.unitPrice,
    maxPrice: item.unitPrice,
    primaryVariant: fallbackVariant,
    discountPercent: 0,
    hasDiscount: false,
    isInStock: true,
  };
};

export function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const addItem = useCartStore((state) => state.addItem);

  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletHistory, setWalletHistory] = useState<Array<{ id?: number; amount: number; type?: string; description?: string; createdAt?: string }>>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [reorderingOrderId, setReorderingOrderId] = useState<number | null>(null);
  const [refundOrderId, setRefundOrderId] = useState<number | null>(null);
  const [ratingOrderId, setRatingOrderId] = useState<number | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [defaultingAddressId, setDefaultingAddressId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const activeTab = useMemo<AccountTab>(() => {
    const tab = searchParams.get("tab");
    return accountTabs.includes(tab as AccountTab) ? (tab as AccountTab) : "overview";
  }, [searchParams]);

  const selectedTrackingOrderId = Number(searchParams.get("order") || "");
  const customerName = profile?.name || session?.name || "Customer";

  const updateSearch = (nextValues: Partial<Record<"tab" | "order", string | null>>) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const loadCustomerData = async (silent = false) => {
    if (!session?.accessToken) {
      setOrders([]);
      setAddresses([]);
      setTracking(null);
      setWalletBalance(null);
      setWalletHistory([]);
      setWishlist([]);
      setCoupons([]);
      setIsLoading(false);
      return;
    }

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [nextOrders, nextAddresses, nextWalletBalance, nextWalletHistory, nextWishlist, nextCoupons] = await Promise.all([
        getOrders(),
        getAddresses(),
        session.customerId ? getWalletBalance(session.customerId).catch(() => null) : Promise.resolve(null),
        session.customerId ? getWalletHistory(session.customerId).catch(() => []) : Promise.resolve([]),
        getWishlist().catch(() => []),
        getActiveCoupons().catch(() => []),
      ]);

      setOrders(
        [...nextOrders].sort(
          (left, right) =>
            new Date(right.placedAt || right.createdAt || 0).getTime() -
            new Date(left.placedAt || left.createdAt || 0).getTime(),
        ),
      );
      setAddresses(
        [...nextAddresses].sort((left, right) => Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))),
      );
      setWalletBalance(nextWalletBalance);
      setWalletHistory(nextWalletHistory);
      setWishlist(nextWishlist);
      setCoupons(nextCoupons);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load your account right now.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadCustomerData();
  }, [session?.accessToken]);

  const activeOrders = useMemo(
    () => orders.filter((order) => isTrackableStatus(order.status || order.orderStatus)),
    [orders],
  );

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) || addresses[0] || null,
    [addresses],
  );

  const selectedTrackingOrder = useMemo(
    () => orders.find((order) => order.id === selectedTrackingOrderId) || activeOrders[0] || orders[0] || null,
    [activeOrders, orders, selectedTrackingOrderId],
  );

  useEffect(() => {
    if (activeTab !== "tracking" || !selectedTrackingOrder?.orderNumber || !session?.accessToken) {
      setTracking(null);
      setIsTrackingLoading(false);
      return;
    }

    let isMounted = true;

    const loadTracking = async (silent = false) => {
      if (!silent) {
        setIsTrackingLoading(true);
      }

      try {
        const nextTracking = await getOrderTracking(selectedTrackingOrder.orderNumber);
        if (isMounted) {
          setTracking(nextTracking);
        }
      } catch {
        if (isMounted) {
          setTracking(null);
        }
      } finally {
        if (isMounted) {
          setIsTrackingLoading(false);
        }
      }
    };

    void loadTracking();

    if (!isTrackableStatus(selectedTrackingOrder.status || selectedTrackingOrder.orderStatus)) {
      return () => {
        isMounted = false;
      };
    }

    const interval = window.setInterval(() => {
      void loadTracking(true);
      void loadCustomerData(true);
    }, 12000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [activeTab, selectedTrackingOrder?.orderNumber, selectedTrackingOrder?.status, session?.accessToken]);

  const handleReorder = async (order: PlacedOrder) => {
    const reorderableItems = order.items.filter((item) => !item.freeItem);

    if (!reorderableItems.length) {
      toast.error("No reorderable items were found in this order.");
      return;
    }

    setReorderingOrderId(order.id);

    try {
      const products = await Promise.all(
        reorderableItems.map(async (item) => {
          try {
            const product = await getProductById(item.productId);
            const variant = product.variants.find((candidate) => candidate.id === item.variantId) || product.primaryVariant;

            return {
              product,
              variant: variant || buildFallbackVariant(item),
              quantity: item.quantity,
            };
          } catch {
            const fallbackProduct = buildFallbackProduct(item);
            return {
              product: fallbackProduct,
              variant: fallbackProduct.primaryVariant,
              quantity: item.quantity,
            };
          }
        }),
      );

      products.forEach((entry) => {
        addItem(entry.product, entry.variant, entry.quantity);
      });

      toast.success(`${reorderableItems.length} item${reorderableItems.length === 1 ? "" : "s"} added back to your cart.`);
      navigate("/cart");
    } catch (error: any) {
      toast.error(error?.message || "Unable to add these items back to the cart.");
    } finally {
      setReorderingOrderId(null);
    }
  };

  const handleDownloadInvoice = async (order: PlacedOrder) => {
    await downloadInvoicePdf(order);
  };

  const handleRefundRequest = async (order: PlacedOrder) => {
    const confirmed = window.confirm("Send a refund/return request for this order?");
    if (!confirmed) return;

    setRefundOrderId(order.id);
    try {
      await requestRefund({
        orderId: order.id,
        reason: "Customer requested return/refund from website account page",
      });
      toast.success("Refund request sent.");
      void loadCustomerData(true);
    } catch (error: any) {
      toast.error(error?.message || "Unable to request refund for this order.");
    } finally {
      setRefundOrderId(null);
    }
  };

  const handleRateDelivery = async (order: PlacedOrder) => {
    const starsText = window.prompt("Rate delivery from 1 to 5 stars", "5");
    if (!starsText) return;
    const rating = Number(starsText);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      toast.error("Please enter a rating from 1 to 5.");
      return;
    }
    const feedback = window.prompt("Optional feedback for this delivery", "") || "";

    setRatingOrderId(order.id);
    try {
      const status = await getDeliveryRatingStatus(order.orderNumber).catch(() => null);
      if (status && status.canRate === false) {
        toast.error(status.alreadyRated ? "You already rated this delivery." : "Delivery can be rated after it is delivered.");
        return;
      }
      await submitDeliveryRating(order.orderNumber, { rating, feedback });
      toast.success("Thanks, delivery rating submitted.");
      void loadCustomerData(true);
    } catch (error: any) {
      toast.error(error?.message || "Unable to submit delivery rating.");
    } finally {
      setRatingOrderId(null);
    }
  };

  const handleDeleteAddress = async (address: Address) => {
    const confirmed = window.confirm("Remove this address from your account?");
    if (!confirmed) return;

    setDeletingAddressId(address.id);

    try {
      await deleteAddress(address.id);
      const nextAddresses = await getAddresses();
      setAddresses(nextAddresses);
      toast.success("Address removed.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to remove this address.");
    } finally {
      setDeletingAddressId(null);
    }
  };

  const handleMakeDefault = async (address: Address) => {
    setDefaultingAddressId(address.id);

    try {
      const savedAddress = await saveAddress(
        {
          addressType: address.addressType,
          flatNumber: address.flatNumber,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          latitude: address.latitude,
          longitude: address.longitude,
          isDefault: true,
          contactName: address.contactName,
          contactPhone: address.contactPhone,
        },
        address.id,
      );

      setAddresses((current) =>
        current
          .map((entry) => ({ ...entry, isDefault: entry.id === savedAddress.id }))
          .sort((left, right) => Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault))),
      );
      toast.success("Default address updated.");
    } catch (error: any) {
      toast.error(error?.message || "Unable to update the default address.");
    } finally {
      setDefaultingAddressId(null);
    }
  };

  const trackingStatus = tracking?.status || selectedTrackingOrder?.status || selectedTrackingOrder?.orderStatus;
  const trackingStepIndex = getTrackingStepIndex(trackingStatus);
  const selectedTrackingTone = statusTone(trackingStatus);
  const liveTrackingPhone = tracking?.deliveryPersonPhone || selectedTrackingOrder?.deliveryPersonPhone || "";
  const liveTrackingName = tracking?.deliveryPersonName || selectedTrackingOrder?.deliveryPersonName || "";

  const menuItems = [
    {
      id: "orders",
      icon: ShoppingBag,
      title: "My Orders",
      subtitle: "View Current & Previous Orders",
      action: () => updateSearch({ tab: "orders" }),
    },
    {
      id: "addresses",
      icon: MapPin,
      title: "My Addresses",
      subtitle: "Home • Office • Add New",
      action: () => updateSearch({ tab: "addresses" }),
    },
    {
      id: "wishlist",
      icon: Heart,
      title: "Wishlist",
      subtitle: "Saved Products",
      action: () => updateSearch({ tab: "wishlist" }),
    },
    {
      id: "coupons",
      icon: Gift,
      title: "Coupons & Rewards",
      subtitle: "Available Coupons • Reward Points",
      action: () => updateSearch({ tab: "coupons" }),
    },
    {
      id: "payments",
      icon: CreditCard,
      title: "Payment Methods",
      subtitle: "UPI • Cards • Wallet",
      action: () => updateSearch({ tab: "payments" }),
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notifications",
      subtitle: "Updates & Alerts",
      action: () => updateSearch({ tab: "notifications" }),
    },
    {
      id: "help",
      icon: Phone,
      title: "Help & Support",
      subtitle: "Reach out to us",
      action: () => updateSearch({ tab: "help" }),
    },
    {
      id: "settings",
      icon: Settings,
      title: "Settings",
      subtitle: "App preferences",
      action: () => updateSearch({ tab: "settings" }),
    },
    {
      id: "language",
      icon: Globe,
      title: "Language",
      subtitle: "తెలుగు | English | हिन्दी",
      action: () => updateSearch({ tab: "language" }),
    },
    {
      id: "about",
      icon: Info,
      title: "About Anusha Bazaar",
      subtitle: "v1.0.0",
      action: () => window.alert("About Anusha Bazaar"),
    },
    {
      id: "logout",
      icon: LogOut,
      title: "Logout",
      subtitle: "Sign out of your account",
      action: () => void logout(),
      className: "text-red-500",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <section className="rounded-[2rem] border border-white/40 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#047857] text-2xl font-bold text-white shadow-lg">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#17311d] dark:text-white">Hello, {customerName}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-[#607361] dark:text-gray-300">
              <Phone className="h-4 w-4" />
              {profile?.phoneNumber || session?.phoneNumber || "Add phone number"}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#dbe5d1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fef08a]">
              <Star className="h-5 w-5 text-[#ca8a04]" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7b8d7b]">Status</div>
              <div className="font-bold text-[#17311d] dark:text-white">Gold Member</div>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#dbe5d1] bg-white p-4 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c7d2fe]">
              <CreditCard className="h-5 w-5 text-[#4338ca]" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#7b8d7b]">Wallet Balance</div>
              <div className="font-bold text-[#17311d] dark:text-white">
                {walletBalance == null ? "Syncing..." : `₹${walletBalance.toLocaleString("en-IN")}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu List */}
      <section className="overflow-hidden rounded-[2rem] border border-white/40 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-black/40 dark:border-white/10">
        <div className="divide-y divide-[#f1f5f9] dark:divide-gray-800">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="flex w-full items-center justify-between p-4 px-6 text-left transition hover:bg-[#f8fbf4] active:bg-[#f1f5f9] dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${item.className ? 'bg-red-50 text-red-500' : 'bg-[#eff8e8] text-[#10b981]'}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className={`text-[15px] font-semibold ${item.className || 'text-[#17311d] dark:text-white'}`}>{item.title}</div>
                  <div className="text-xs text-[#607361] dark:text-gray-400 mt-0.5">{item.subtitle}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  const renderWishlist = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Wishlist</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Your saved products</h2>
        </div>
      </div>
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 xl:gap-4">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={(v) => addItem(product, v)} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4e4]">
            <Heart className="h-5 w-5 text-[#789076]" />
          </div>
          <div className="mt-4 font-semibold text-[#17311d]">Your wishlist is empty</div>
          <div className="mt-1 text-sm text-[#607361]">Items you like will appear here.</div>
        </div>
      )}
    </section>
  );

  const renderCoupons = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Coupons & Rewards</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Active offers just for you</h2>
        </div>
      </div>
      {coupons.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {coupons.map((coupon) => (
            <div key={coupon.id || coupon.code} className="rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-bold tracking-widest text-[#92400e] uppercase border border-[#fde68a]">
                    {coupon.code}
                  </div>
                  <div className="text-sm font-semibold text-[#10b981]">{coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}</div>
                </div>
                <p className="mt-3 text-sm text-[#607361]">{coupon.description || 'Use this code at checkout to claim your discount.'}</p>
                {coupon.minCartValue && <p className="mt-1 text-xs text-[#7b8d7b]">Min. order: ₹{coupon.minCartValue}</p>}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(coupon.code);
                  toast.success(`Copied ${coupon.code} to clipboard`);
                }}
                className="mt-4 w-full rounded-xl bg-[#f8fbf4] py-2 text-sm font-semibold text-[#214b29] hover:bg-[#eef4e4] transition"
              >
                Copy Code
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-5 py-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4e4]">
            <Gift className="h-5 w-5 text-[#789076]" />
          </div>
          <div className="mt-4 font-semibold text-[#17311d]">No active coupons</div>
          <div className="mt-1 text-sm text-[#607361]">Check back later for new offers and rewards.</div>
        </div>
      )}
    </section>
  );

  const renderPaymentMethods = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Payment Methods</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Supported Payments</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm text-center flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] mb-3">
            <CreditCard className="h-5 w-5 text-[#1d4ed8]" />
          </div>
          <div className="font-semibold text-[#17311d]">UPI / BHIM</div>
          <div className="mt-1 text-xs text-[#607361]">Google Pay, PhonePe, Paytm</div>
        </div>
        <div className="rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm text-center flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] mb-3">
            <CreditCard className="h-5 w-5 text-[#1d4ed8]" />
          </div>
          <div className="font-semibold text-[#17311d]">Cards</div>
          <div className="mt-1 text-xs text-[#607361]">Credit & Debit Cards</div>
        </div>
        <div className="rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm text-center flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] mb-3">
            <CreditCard className="h-5 w-5 text-[#1d4ed8]" />
          </div>
          <div className="font-semibold text-[#17311d]">Anusha Wallet</div>
          <div className="mt-1 text-xs text-[#607361]">Instant refunds & credits</div>
        </div>
      </div>
      <p className="mt-6 text-sm text-[#607361] text-center">
        Payment methods are managed securely during checkout via Cashfree. We do not store your card details.
      </p>
    </section>
  );

  const renderNotifications = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Notifications</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Updates & Alerts</h2>
        </div>
      </div>
      <div className="rounded-[1.8rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4e4]">
          <Bell className="h-5 w-5 text-[#789076]" />
        </div>
        <div className="mt-4 font-semibold text-[#17311d]">No new notifications</div>
        <div className="mt-1 text-sm text-[#607361]">You're all caught up!</div>
      </div>
    </section>
  );

  const renderHelpSupport = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Help & Support</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">We're here to help</h2>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <a href="tel:+918000000000" className="flex items-center gap-4 rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm transition hover:bg-[#f8fbf4]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4]">
            <PhoneCall className="h-5 w-5 text-[#15803d]" />
          </div>
          <div>
            <div className="font-semibold text-[#17311d]">Call Us</div>
            <div className="text-sm text-[#607361]">+91 8000 000 000</div>
          </div>
        </a>
        <a href="mailto:support@anushabazaar.com" className="flex items-center gap-4 rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm transition hover:bg-[#f8fbf4]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff]">
            <ExternalLink className="h-5 w-5 text-[#1d4ed8]" />
          </div>
          <div>
            <div className="font-semibold text-[#17311d]">Email Support</div>
            <div className="text-sm text-[#607361]">support@anushabazaar.com</div>
          </div>
        </a>
      </div>
    </section>
  );

  const renderSettings = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Settings</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">App Preferences</h2>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm">
          <div>
            <div className="font-semibold text-[#17311d]">Push Notifications</div>
            <div className="text-sm text-[#607361]">Receive updates about your orders</div>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#10b981] checked:right-0 checked:border-[#10b981] translate-x-6" checked readOnly />
            <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-[#10b981] cursor-pointer"></label>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm">
          <div>
            <div className="font-semibold text-[#17311d]">Email Promotions</div>
            <div className="text-sm text-[#607361]">Receive offers and news via email</div>
          </div>
          <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle2" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-[#d1d5db]" readOnly />
            <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-[#e5e7eb] cursor-pointer"></label>
          </div>
        </div>
      </div>
    </section>
  );

  const renderLanguage = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Language</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Select your preference</h2>
        </div>
      </div>
      <div className="grid gap-3">
        <button className="flex items-center justify-between rounded-[1.6rem] border border-[#10b981] bg-[#f0fdf4] p-5 shadow-sm text-left transition">
          <div className="font-semibold text-[#17311d]">English</div>
          <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
        </button>
        <button className="flex items-center justify-between rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm text-left transition hover:bg-[#f8fbf4]" onClick={() => toast.success("Language saved!")}>
          <div className="font-semibold text-[#17311d]">తెలుగు (Telugu)</div>
        </button>
        <button className="flex items-center justify-between rounded-[1.6rem] border border-[#dbe5d1] bg-white p-5 shadow-sm text-left transition hover:bg-[#f8fbf4]" onClick={() => toast.success("Language saved!")}>
          <div className="font-semibold text-[#17311d]">हिन्दी (Hindi)</div>
        </button>
      </div>
    </section>
  );

  const renderOrders = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Previous orders</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Every basket you have placed</h2>
        </div>
        <button
          type="button"
          onClick={() => void loadCustomerData(true)}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-full border border-[#d7e1ce] px-4 py-2.5 text-sm font-semibold text-[#214b29] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {orders.length ? (
        <div className="mt-6 space-y-5">
          {orders.map((order) => {
            const tone = statusTone(order.status || order.orderStatus);
            const hasTracking = isTrackableStatus(order.status || order.orderStatus);

            return (
              <article
                key={order.id}
                className="rounded-[2rem] border border-[#dbe5d1] bg-white p-6 shadow-sm transition hover:shadow-md dark:bg-black/40 dark:border-white/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4 dark:border-gray-800">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-['Fraunces'] text-2xl font-bold text-[#17311d] dark:text-white">
                        {order.orderNumber}
                      </h3>
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider ${tone.className}`}>
                        {tone.label}
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-[#607361] dark:text-gray-400">
                      <Clock3 className="h-4 w-4" />
                      {formatOrderDate(order.placedAt || order.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#607361] dark:text-gray-400">Total Amount</div>
                    <div className="font-['Fraunces'] text-2xl font-bold text-[#10b981]">
                      Rs {order.grandTotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={`${order.id}-${item.variantId}-${item.productName}`}
                      className="flex items-center gap-2 rounded-xl border border-[#e0e7d8] bg-[#f8fbf4] p-2 pr-4 text-sm font-medium text-[#567057] dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-300"
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e0e7d8] dark:bg-gray-700">
                          <ShoppingBag className="h-5 w-5 text-[#789076]" />
                        </div>
                      )}
                      <div>
                        <div className="max-w-[140px] truncate">{item.productName}</div>
                        <div className="text-xs text-[#758975] dark:text-gray-400">Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-[#dbe5d1] bg-[#fcfdfa] px-5 py-2 text-sm font-medium text-[#758975] dark:bg-gray-800/20 dark:border-gray-700">
                      +{order.items.length - 4} more
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.8rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-5 py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(23,42,28,0.08)]">
            <ShoppingBag className="h-6 w-6 text-[#2f6a3a]" />
          </div>
          <h3 className="mt-4 font-['Fraunces'] text-3xl text-[#17311d]">No orders yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#607361]">
            Start shopping and your complete order history, tracking updates, and reorder shortcuts will appear here.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#17381f] px-5 py-3 text-sm font-semibold text-white"
          >
            Explore products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );

  const renderAddresses = () => (
    <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Saved addresses</div>
          <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Manage every delivery destination</h2>
        </div>
        <Link
          to="/checkout"
          className="inline-flex items-center gap-2 rounded-full bg-[#17381f] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Add new address
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {addresses.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className={`rounded-[1.9rem] border p-5 shadow-[0_16px_36px_rgba(23,42,28,0.04)] ${
                address.isDefault
                  ? "border-[#cfe3bf] bg-[linear-gradient(180deg,#f7fbe9,#eff8e6)]"
                  : "border-[#dbe5d1] bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#758975]">Address type</div>
                  <div className="mt-2 font-['Fraunces'] text-3xl text-[#17311d]">
                    {toTitleCase(address.addressType || "HOME")}
                  </div>
                </div>
                {address.isDefault ? (
                  <div className="rounded-full border border-[#c9ddc2] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#214b29]">
                    Default
                  </div>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-7 text-[#607361]">{formatAddressSummary(address)}</p>

              {(address.contactName || address.contactPhone) ? (
                <div className="mt-4 rounded-[1.3rem] border border-[#dbe5d1] bg-white/80 px-4 py-3 text-sm text-[#567057]">
                  {address.contactName ? <div>{address.contactName}</div> : null}
                  {address.contactPhone ? <div className="mt-1">{address.contactPhone}</div> : null}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                {!address.isDefault ? (
                  <button
                    type="button"
                    onClick={() => void handleMakeDefault(address)}
                    disabled={defaultingAddressId === address.id}
                    className="inline-flex items-center gap-2 rounded-full bg-[#17381f] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {defaultingAddressId === address.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Make default
                  </button>
                ) : (
                  <Link
                    to="/checkout"
                    className="inline-flex items-center gap-2 rounded-full bg-[#17381f] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Use in checkout
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => void handleDeleteAddress(address)}
                  disabled={deletingAddressId === address.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ead4cf] px-4 py-2.5 text-sm font-semibold text-[#8a4f41] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingAddressId === address.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.8rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-5 py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(23,42,28,0.08)]">
            <MapPin className="h-6 w-6 text-[#2f6a3a]" />
          </div>
          <h3 className="mt-4 font-['Fraunces'] text-3xl text-[#17311d]">No saved addresses yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#607361]">
            Add one during checkout and it will stay ready for future grocery deliveries.
          </p>
        </div>
      )}
    </section>
  );

  const renderTracking = () => (
    <section className="space-y-6">
      <div className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Delivery tracking</div>
            <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Follow every order milestone</h2>
          </div>
          <button
            type="button"
            onClick={() => void loadCustomerData(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-full border border-[#d7e1ce] px-4 py-2.5 text-sm font-semibold text-[#214b29] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRefreshing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh orders
          </button>
        </div>

        {orders.length ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {orders.slice(0, 8).map((order) => {
              const tone = statusTone(order.status || order.orderStatus);

              return (
                <button
                  type="button"
                  key={order.id}
                  onClick={() => updateSearch({ tab: "tracking", order: String(order.id) })}
                  className={`rounded-[1.4rem] border px-4 py-3 text-left transition ${
                    selectedTrackingOrder?.id === order.id
                      ? "border-[#1d7c3f] bg-[#eff8e7] shadow-[0_14px_28px_rgba(29,124,63,0.12)]"
                      : "border-[#dbe5d1] bg-white"
                  }`}
                >
                  <div className="font-semibold text-[#17311d]">{order.orderNumber}</div>
                  <div className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone.className}`}>
                    {tone.label}
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {selectedTrackingOrder ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-[#10b981] to-[#047857] p-8 text-white shadow-[0_30px_80px_rgba(16,185,129,0.3)] sm:p-10"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/78">
                    <Sparkles className="h-3.5 w-3.5" />
                    Delivery centre
                  </div>
                  <h3 className="mt-5 font-['Fraunces'] text-4xl">{selectedTrackingOrder.orderNumber}</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82">
                    {tracking?.message || "We are syncing the latest fulfilment updates for this order."}
                  </p>
                </div>

                <div className="rounded-full border border-white/16 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  {selectedTrackingTone.label}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Last update</div>
                  <div className="mt-2 text-lg font-semibold text-white">{formatTrackingUpdate(tracking?.updatedAt)}</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Rider sync</div>
                  <div className="mt-2 text-lg font-semibold text-white">{tracking?.isLive ? "Live location active" : "Status-only tracking"}</div>
                </div>
                <div className="rounded-[1.5rem] border border-white/14 bg-white/10 p-4 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/60">Estimated delivery</div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {selectedTrackingOrder.estimatedDeliveryTime
                      ? formatOrderDate(selectedTrackingOrder.estimatedDeliveryTime)
                      : "Awaiting rider assignment"}
                  </div>
                </div>
              </div>
            </motion.section>

            <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Progress timeline</div>
                  <h3 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">From checkout to doorstep</h3>
                </div>
                {isTrackingLoading ? <LoaderCircle className="h-5 w-5 animate-spin text-[#2f6a3a]" /> : <Clock3 className="h-5 w-5 text-[#2f6a3a]" />}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-5">
                {[
                  { label: "Placed", detail: "Order captured" },
                  { label: "Confirmed", detail: "Store accepted" },
                  { label: "Assigned", detail: "Rider linked" },
                  { label: "On the way", detail: "Heading to you" },
                  { label: "Delivered", detail: "Completed" },
                ].map((step, index) => {
                  const isComplete = index < trackingStepIndex;
                  const isCurrent = index === trackingStepIndex;

                  return (
                    <div
                      key={step.label}
                      className={`rounded-[1.5rem] border p-4 ${
                        isCurrent
                          ? "border-[#cfe3bf] bg-[#eff8e7] shadow-[0_16px_28px_rgba(29,124,63,0.08)]"
                          : isComplete
                            ? "border-[#d8e7cd] bg-[#f7fbf1]"
                            : "border-[#dbe5d1] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isCurrent || isComplete ? "bg-[#17381f] text-white" : "bg-[#eef4e4] text-[#6f876e]"
                          }`}
                        >
                          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-[#17311d]">{step.label}</div>
                          <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#758975]">{step.detail}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Delivery details</div>
              <h3 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Rider, payment, and address</h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.5rem] border border-[#dbe5d1] bg-[#f8fbf4] p-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-[#2f6a3a]" />
                    <div>
                      <div className="font-semibold text-[#17311d]">{liveTrackingName || "Delivery partner pending"}</div>
                      <div className="mt-1 text-sm text-[#607361]">
                        {liveTrackingPhone || "Phone details will appear once a rider is assigned."}
                      </div>
                    </div>
                  </div>
                  {liveTrackingPhone ? (
                    <a
                      href={`tel:${liveTrackingPhone}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#17381f] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <Phone className="h-4 w-4" />
                      Call rider
                    </a>
                  ) : null}
                </div>

                <div className="rounded-[1.5rem] border border-[#dbe5d1] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-[#2f6a3a]" />
                    <div>
                      <div className="font-semibold text-[#17311d]">Delivery address</div>
                      <div className="mt-1 text-sm text-[#607361]">
                        {formatAddressSummary(selectedTrackingOrder.address) || APP_COPY.headquarters}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#dbe5d1] bg-white p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-[#2f6a3a]" />
                    <div>
                      <div className="font-semibold text-[#17311d]">Payment status</div>
                      <div className="mt-1 text-sm text-[#607361]">
                        {formatPaymentMethodLabel(selectedTrackingOrder.paymentMethod)} • {selectedTrackingOrder.paymentStatus || "Pending confirmation"}
                      </div>
                    </div>
                  </div>
                </div>

                {(tracking?.lat != null && tracking?.lng != null) ? (
                  <div className="rounded-[1.5rem] border border-[#dbe5d1] bg-[#f8fbf4] p-4 text-sm text-[#607361]">
                    Live rider coordinates: {tracking.lat.toFixed(5)}, {tracking.lng.toFixed(5)}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Items in this order</div>
              <h3 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">What is being delivered</h3>

              <div className="mt-6 space-y-3">
                {selectedTrackingOrder.items.map((item) => (
                  <div key={`${selectedTrackingOrder.id}-${item.variantId}-${item.productName}`} className="flex items-center gap-3 rounded-[1.3rem] border border-[#dbe5d1] bg-white p-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="h-14 w-14 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4f8ef]">
                        <ShoppingBag className="h-5 w-5 text-[#7a8d7a]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-[#17311d]">{item.productName}</div>
                      <div className="mt-1 text-sm text-[#607361]">
                        {item.variantName || "Standard pack"} • Qty {item.quantity}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-[#17311d]">Rs {(item.totalPrice || item.unitPrice * item.quantity).toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleReorder(selectedTrackingOrder)}
                  disabled={reorderingOrderId === selectedTrackingOrder.id}
                  className="inline-flex items-center gap-2 rounded-full bg-[#17381f] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {reorderingOrderId === selectedTrackingOrder.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  Order again
                </button>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 rounded-full border border-[#d7e1ce] px-4 py-2.5 text-sm font-semibold text-[#214b29]"
                >
                  Open cart
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedTrackingOrder)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d7e1ce] px-4 py-2.5 text-sm font-semibold text-[#214b29]"
                >
                  <Download className="h-4 w-4" />
                  Invoice
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="rounded-[2.2rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-5 py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_24px_rgba(23,42,28,0.08)]">
            <Truck className="h-6 w-6 text-[#2f6a3a]" />
          </div>
          <h3 className="mt-4 font-['Fraunces'] text-3xl text-[#17311d]">No orders available to track</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#607361]">
            Once you place an order, this panel will show store confirmation, rider assignment, and doorstep updates.
          </p>
        </div>
      )}
    </section>
  );

  if (!session?.accessToken) {
    if (activeTab === "orders") {
      return (
        <div className="app-shell-narrow">
          <section className="overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-[#10b981] to-[#047857] px-8 py-12 text-white shadow-[0_30px_80px_rgba(16,185,129,0.3)] sm:px-12">
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Your Orders
                </div>
                <h1 className="mt-5 font-['Fraunces'] text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02]">Track and reorder your past purchases.</h1>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-white/82">
                  Sign in with your mobile OTP to view your complete order history, track active deliveries in real-time, and quickly add your favorite items back to your cart.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17331e]"
                  >
                    Sign in with OTP
                  </button>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="app-shell-narrow">
        <section className="overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-[#10b981] to-[#047857] px-8 py-12 text-white shadow-[0_30px_80px_rgba(16,185,129,0.3)] sm:px-12">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Customer profile
              </div>
              <h1 className="mt-5 font-['Fraunces'] text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02]">Manage your saved addresses and account details.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-white/82">
                Sign in with your mobile OTP to manage your profile, keep home and work addresses ready for instant checkout, and review your payment methods.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17331e]"
                >
                  Sign in with OTP
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === "overview") {
    return (
      <div className="app-shell pb-24">
        {renderOverview()}
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => updateSearch({ tab: "overview" })}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-[#dbe5d1] transition hover:bg-[#f8fbf4]"
        >
          <ChevronRight className="h-5 w-5 text-[#17311d] rotate-180" />
        </button>
        <h1 className="font-['Fraunces'] text-3xl font-bold text-[#17311d]">
          {activeTab === "orders" && "My Orders"}
          {activeTab === "addresses" && "My Addresses"}
          {activeTab === "tracking" && "Delivery Tracking"}
          {activeTab === "wishlist" && "Wishlist"}
          {activeTab === "coupons" && "Coupons & Rewards"}
          {activeTab === "payments" && "Payment Methods"}
          {activeTab === "notifications" && "Notifications"}
          {activeTab === "help" && "Help & Support"}
          {activeTab === "settings" && "Settings"}
          {activeTab === "language" && "Language Preferences"}
        </h1>
      </div>

      <div className="touch-scroll-row mb-6 flex gap-3 overflow-x-auto rounded-[2rem] border border-white/70 bg-white/70 p-3 shadow-[0_18px_48px_rgba(20,38,25,0.06)] backdrop-blur">
        {[
          { value: "orders", label: "Orders", icon: ShoppingBag },
          { value: "addresses", label: "Addresses", icon: MapPin },
          { value: "tracking", label: "Tracking", icon: Truck },
        ].map((tab) => (
          <button
            type="button"
            key={tab.value}
            onClick={() => updateSearch({ tab: tab.value, order: tab.value === "tracking" && selectedTrackingOrder ? String(selectedTrackingOrder.id) : tab.value === "tracking" ? null : searchParams.get("order") })}
            className={`inline-flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === tab.value
                ? "bg-[#17381f] text-white shadow-[0_14px_26px_rgba(22,56,31,0.18)]"
                : "text-[#214b29] hover:bg-[#edf4e3]"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {isLoading ? (
          <div className="rounded-[2.2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,244,236,0.98))] px-6 py-14 text-center shadow-[0_25px_60px_rgba(20,38,25,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4e4]">
              <LoaderCircle className="h-6 w-6 animate-spin text-[#2f6a3a]" />
            </div>
            <h2 className="mt-5 font-['Fraunces'] text-3xl text-[#17311d]">Loading your account</h2>
            <p className="mt-3 text-sm leading-7 text-[#607361]">
              Pulling previous orders, saved addresses, and the latest delivery information.
            </p>
          </div>
        ) : activeTab === "orders" ? (
          renderOrders()
        ) : activeTab === "addresses" ? (
          renderAddresses()
        ) : activeTab === "tracking" ? (
          renderTracking()
        ) : activeTab === "wishlist" ? (
          renderWishlist()
        ) : activeTab === "coupons" ? (
          renderCoupons()
        ) : activeTab === "payments" ? (
          renderPaymentMethods()
        ) : activeTab === "notifications" ? (
          renderNotifications()
        ) : activeTab === "help" ? (
          renderHelpSupport()
        ) : activeTab === "settings" ? (
          renderSettings()
        ) : activeTab === "language" ? (
          renderLanguage()
        ) : null}
      </div>
    </div>
  );
}
