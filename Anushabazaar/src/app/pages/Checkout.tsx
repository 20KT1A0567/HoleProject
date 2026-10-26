import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  LocateFixed,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router";
import { APP_COPY } from "../lib/config";
import { buildUnlockedFreeItems } from "../lib/freeItemOffers";
import { calculateCheckoutFeeBreakdown, formatCurrency, formatPaymentMethodLabel } from "../lib/storefrontUtils";
import {
  applyCoupon,
  getAddresses,
  getActiveCoupons,
  getActiveFreeItemOffers,
  getCheckoutSettings,
  getCustomerProfile,
  initiateOnlinePayment,
  placeOrder,
  saveAddress,
  syncCartToServer,
  verifyOnlinePayment,
} from "../services/storefrontApi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useLocationStore } from "../store/locationStore";
import type { Address, AddressPayload, AppliedCoupon, CheckoutSettings, Coupon, FreeItemOffer, PaymentMethod, PlacedOrder, ServerCart } from "../types/storefront";

const defaultSettings: CheckoutSettings = {
  deliveryCharge: 0,
  platformFee: 0,
  handlingCharge: 0,
  smallCartFee: 0,
  smallCartThreshold: 0,
  onlinePaymentEnabled: true,
  cashOnDeliveryEnabled: true,
};

const defaultLatitude = 17.385;
const defaultLongitude = 78.4867;
type BaseCheckoutPaymentMethod = Extract<PaymentMethod, "COD" | "ONLINE">;

const formatCouponHeadline = (coupon: Coupon) => {
  if (coupon.discountType === "PERCENTAGE") {
    const cap = coupon.maxDiscountAmount ? ` up to ${formatCurrency(coupon.maxDiscountAmount)}` : "";
    return `${coupon.discountValue}% off${cap}`;
  }
  return `${formatCurrency(coupon.discountValue)} off`;
};

const ensureCashfreeScript = async () => {
  const existing = document.querySelector<HTMLScriptElement>('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
  if (existing) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Cashfree checkout."));
    document.body.appendChild(script);
  });
};

const reverseGeocodeAddress = async (latitude: number, longitude: number) => {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
  );

  if (!response.ok) {
    throw new Error("Unable to read your current area.");
  }

  const data = await response.json();
  const informativeNames = Array.isArray(data?.localityInfo?.informative)
    ? data.localityInfo.informative
        .map((entry: { name?: string }) => entry?.name?.trim())
        .filter(Boolean)
    : [];
  const administrativeNames = Array.isArray(data?.localityInfo?.administrative)
    ? data.localityInfo.administrative
        .map((entry: { name?: string }) => entry?.name?.trim())
        .filter(Boolean)
    : [];

  const locality =
    data?.locality ||
    informativeNames[0] ||
    data?.city ||
    data?.principalSubdivisionCity ||
    "";
  const city = data?.city || data?.principalSubdivisionCity || locality || APP_COPY.defaultCity;
  const state = data?.principalSubdivision || APP_COPY.defaultState;
  const postalCode = data?.postcode || data?.postalCode || "";
  const shortLabel = [locality, city].filter(Boolean).slice(0, locality === city ? 1 : 2).join(", ");

  return {
    locality,
    city,
    state,
    postalCode,
    shortLabel: shortLabel || `${APP_COPY.defaultCity}, ${APP_COPY.defaultState}`,
    addressLine1:
      [locality, city].filter(Boolean).slice(0, locality === city ? 1 : 2).join(", ") ||
      `${APP_COPY.defaultCity}, ${APP_COPY.defaultState}`,
    addressLine2: [informativeNames[1], administrativeNames[0], postalCode].filter(Boolean).join(", "),
  };
};

export function Checkout() {
  const [searchParams] = useSearchParams();
  const cart = useCartStore((state) => state.cart);
  const clearCart = useCartStore((state) => state.clearCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const toServerPayload = useCartStore((state) => state.toServerPayload);
  const currentLocation = useLocationStore((state) => state.location);
  const couponFromUrl = (searchParams.get("coupon") || "").trim().toUpperCase();

  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);

  const [settings, setSettings] = useState<CheckoutSettings>(defaultSettings);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<BaseCheckoutPaymentMethod>("COD");
  const [useWallet, setUseWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [serverCartPreview, setServerCartPreview] = useState<ServerCart | null>(null);
  const [isSyncingCartPreview, setIsSyncingCartPreview] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [activeFreeItemOffers, setActiveFreeItemOffers] = useState<FreeItemOffer[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<(AppliedCoupon & { cartValue: number }) | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponStatus, setCouponStatus] = useState("");
  const [addressForm, setAddressForm] = useState({
    addressType: "HOME",
    flatNumber: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: currentLocation.city || APP_COPY.defaultCity,
    state: currentLocation.state || APP_COPY.defaultState,
    postalCode: "",
    latitude: String(currentLocation.latitude || defaultLatitude),
    longitude: String(currentLocation.longitude || defaultLongitude),
    contactName: "",
    contactPhone: "",
  });

  useEffect(() => {
    setAddressForm((current) => ({
      ...current,
      city:
        !current.city.trim() || current.city === APP_COPY.defaultCity
          ? currentLocation.city || APP_COPY.defaultCity
          : current.city,
      state:
        !current.state.trim() || current.state === APP_COPY.defaultState
          ? currentLocation.state || APP_COPY.defaultState
          : current.state,
      latitude:
        !current.latitude.trim() || current.latitude === String(defaultLatitude)
          ? String(currentLocation.latitude || defaultLatitude)
          : current.latitude,
      longitude:
        !current.longitude.trim() || current.longitude === String(defaultLongitude)
          ? String(currentLocation.longitude || defaultLongitude)
          : current.longitude,
    }));
  }, [currentLocation.city, currentLocation.latitude, currentLocation.longitude, currentLocation.state]);

  useEffect(() => {
    let isMounted = true;

    getCheckoutSettings()
      .then((nextSettings) => {
        if (isMounted) {
          setSettings(nextSettings);
          if (nextSettings.cashOnDeliveryEnabled === false && nextSettings.onlinePaymentEnabled) {
            setPaymentMethod("ONLINE");
          }
        }
      })
      .catch(() => {
        // Fallback settings stay active.
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
    if (!couponFromUrl) return;
    setCouponCode(couponFromUrl);
    setCouponStatus((current) => current || "Coupon selected from cart. Apply it below.");
  }, [couponFromUrl]);

  useEffect(() => {
    if (!session?.accessToken) return;

    let isMounted = true;

    Promise.all([
      getAddresses(),
      profile?.id ? Promise.resolve(profile) : getCustomerProfile(),
    ])
      .then(([savedAddresses, customerProfile]) => {
        if (!isMounted) return;
        setAddresses(savedAddresses);
        updateProfile(customerProfile);

        const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }

        setAddressForm((current) => ({
          ...current,
          contactName: current.contactName || customerProfile.name || "",
          contactPhone: current.contactPhone || customerProfile.phoneNumber || session.phoneNumber || "",
        }));
      })
      .catch(() => {
        // Checkout still works with manual address form.
      });

    return () => {
      isMounted = false;
    };
  }, [profile, session?.accessToken, session?.phoneNumber, updateProfile]);

  useEffect(() => {
    let isMounted = true;

    getActiveCoupons()
      .then((nextCoupons) => {
        if (isMounted) {
          setAvailableCoupons(nextCoupons);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvailableCoupons([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  useEffect(() => {
    if (session?.accessToken) return;
    setAppliedCoupon(null);
    setCouponCode(couponFromUrl || "");
    setCouponStatus(couponFromUrl ? "Sign in to apply this coupon." : "");
    setServerCartPreview(null);
  }, [couponFromUrl, session?.accessToken]);

  useEffect(() => {
    if (!appliedCoupon) return;
    if (appliedCoupon.cartValue === subtotal) return;

    setAppliedCoupon(null);
    setCouponStatus("Cart updated. Reapply your coupon to refresh the discount.");
  }, [appliedCoupon, subtotal]);

  useEffect(() => {
    if (!session?.accessToken || !cart.length) {
      setServerCartPreview(null);
      setIsSyncingCartPreview(false);
      return;
    }

    let isMounted = true;
    setIsSyncingCartPreview(true);

    syncCartToServer(toServerPayload())
      .then((nextCart) => {
        if (isMounted) {
          setServerCartPreview(nextCart);
        }
      })
      .catch(() => {
        if (isMounted) {
          setServerCartPreview(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsSyncingCartPreview(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [cart, session?.accessToken, toServerPayload]);

  const feeBreakdown = useMemo(() => {
    return calculateCheckoutFeeBreakdown(subtotal, settings, appliedCoupon?.discount || 0);
  }, [appliedCoupon?.discount, settings, subtotal]);

  const localFreeItems = useMemo(() => buildUnlockedFreeItems(activeFreeItemOffers, cart), [activeFreeItemOffers, cart]);

  const checkoutFreeItems = useMemo(() => {
    if (session?.accessToken && serverCartPreview) {
      return serverCartPreview.freeItems || [];
    }

    return localFreeItems;
  }, [localFreeItems, serverCartPreview, session?.accessToken]);

  const visibleCoupons = useMemo(
    () =>
      availableCoupons
        .map((coupon) => ({
          coupon,
          eligible: subtotal >= (coupon.minCartValue || 0),
        }))
        .sort((a, b) => Number(b.eligible) - Number(a.eligible)),
    [availableCoupons, subtotal],
  );

  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) || null,
    [addresses, selectedAddressId],
  );

  const deliveryDestination = useMemo(() => {
    if (useNewAddress) {
      const city = addressForm.city.trim();
      const state = addressForm.state.trim();
      return [city || currentLocation.city || APP_COPY.defaultCity, state || currentLocation.state || APP_COPY.defaultState]
        .filter(Boolean)
        .join(", ");
    }

    if (selectedAddress) {
      return [selectedAddress.city, selectedAddress.state, selectedAddress.postalCode].filter(Boolean).join(", ");
    }

    return currentLocation.shortLabel || `${APP_COPY.defaultCity}, ${APP_COPY.defaultState}`;
  }, [
    addressForm.city,
    addressForm.state,
    currentLocation.city,
    currentLocation.shortLabel,
    currentLocation.state,
    selectedAddress,
    useNewAddress,
  ]);

  const walletBalance = session?.accessToken
    ? Math.max(0, profile?.walletBalance ?? session?.walletBalance ?? 0)
    : 0;
  const estimatedOrderTotal = feeBreakdown.total;
  const walletApplied = useMemo(
    () => (useWallet ? Math.min(walletBalance, estimatedOrderTotal) : 0),
    [estimatedOrderTotal, useWallet, walletBalance],
  );
  const remainingAfterWallet = Math.max(estimatedOrderTotal - walletApplied, 0);
  const walletCoversOrder = useWallet && remainingAfterWallet <= 0;
  const resolvedPaymentMethod = useMemo<PaymentMethod>(() => {
    if (walletApplied <= 0) {
      return paymentMethod;
    }

    if (remainingAfterWallet <= 0) {
      return "WALLET";
    }

    return paymentMethod === "ONLINE" ? "ONLINE_WALLET" : "COD_WALLET";
  }, [paymentMethod, remainingAfterWallet, walletApplied]);

  const enabledPaymentMethods: Array<{ value: BaseCheckoutPaymentMethod; label: string; description: string }> = [
    settings.cashOnDeliveryEnabled
      ? {
          value: "COD",
          label: "Cash on delivery",
          description: walletApplied > 0 ? "Pay only the remaining amount when the order arrives." : "Pay when the order arrives.",
        }
      : null,
    settings.onlinePaymentEnabled
      ? {
          value: "ONLINE",
          label: "Pay online",
          description: walletApplied > 0 ? "Use wallet first, then pay the remaining balance with Cashfree." : "Complete payment with Cashfree.",
        }
      : null,
  ].filter(Boolean) as Array<{ value: BaseCheckoutPaymentMethod; label: string; description: string }>;

  useEffect(() => {
    if (walletBalance <= 0 && useWallet) {
      setUseWallet(false);
    }
  }, [useWallet, walletBalance]);

  useEffect(() => {
    if (!enabledPaymentMethods.length) return;
    if (enabledPaymentMethods.some((method) => method.value === paymentMethod)) return;
    setPaymentMethod(enabledPaymentMethods[0].value);
  }, [enabledPaymentMethods, paymentMethod]);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not available in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        let resolvedAddress:
          | {
              locality: string;
              city: string;
              state: string;
              postalCode: string;
              shortLabel: string;
              addressLine1: string;
              addressLine2: string;
            }
          | null = null;

        try {
          resolvedAddress = await reverseGeocodeAddress(latitude, longitude);
        } catch {
          resolvedAddress = null;
        }

        setAddressForm((current) => ({
          ...current,
          latitude: String(latitude),
          longitude: String(longitude),
          city:
            !current.city.trim() || current.city === APP_COPY.defaultCity
              ? resolvedAddress?.city || currentLocation.city || APP_COPY.defaultCity
              : current.city,
          state:
            !current.state.trim() || current.state === APP_COPY.defaultState
              ? resolvedAddress?.state || currentLocation.state || APP_COPY.defaultState
              : current.state,
          postalCode: current.postalCode.trim() || resolvedAddress?.postalCode || "",
          addressLine1:
            current.addressLine1.trim() ||
            resolvedAddress?.addressLine1 ||
            currentLocation.fullLabel ||
            currentLocation.shortLabel,
          addressLine2: current.addressLine2.trim() || resolvedAddress?.addressLine2 || "",
          landmark: current.landmark.trim() || resolvedAddress?.locality || "",
        }));
        setIsLocating(false);
        toast.success(
          resolvedAddress
            ? `Address details added from ${resolvedAddress.shortLabel}.`
            : "Location coordinates added to the address form.",
        );
      },
      () => {
        setIsLocating(false);
        toast.error("Could not read your location. Using default Hyderabad coordinates.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleApplyCoupon = async (nextCode?: string) => {
    const normalizedCode = (nextCode || couponCode).trim().toUpperCase();

    if (!normalizedCode) {
      setCouponStatus("Enter a coupon code to continue.");
      return;
    }

    if (!session?.accessToken) {
      openAuthModal();
      setCouponStatus("Sign in to unlock coupons.");
      toast.error("Sign in to apply coupons.");
      return;
    }

    if (subtotal <= 0) {
      setCouponStatus("Add products before applying a coupon.");
      toast.error("Your basket is empty.");
      return;
    }

    const selectedCoupon = availableCoupons.find((coupon) => coupon.code.toUpperCase() === normalizedCode);
    if (selectedCoupon && subtotal < (selectedCoupon.minCartValue || 0)) {
      const message = `Minimum cart value of ${formatCurrency(selectedCoupon.minCartValue || 0)} required for ${selectedCoupon.code}.`;
      setCouponStatus(message);
      toast.error(message);
      return;
    }

    setIsApplyingCoupon(true);
    setCouponStatus("");

    try {
      const coupon = await applyCoupon({
        code: normalizedCode,
        customerId: session.customerId,
        cartValue: subtotal,
      });

      setCouponCode(coupon.code);
      setAppliedCoupon({
        ...coupon,
        cartValue: subtotal,
      });
      toast.success(`Coupon ${coupon.code} applied.`);
    } catch (couponError: any) {
      setAppliedCoupon(null);
      setCouponStatus(couponError?.message || "Unable to apply this coupon right now.");
      toast.error(couponError?.message || "Unable to apply the coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponStatus("");
    toast.success("Coupon removed.");
  };

  const buildAddressPayload = (): AddressPayload => ({
    addressType: addressForm.addressType,
    flatNumber: addressForm.flatNumber,
    addressLine1: addressForm.addressLine1,
    addressLine2: addressForm.addressLine2,
    landmark: addressForm.landmark,
    city: addressForm.city,
    state: addressForm.state,
    postalCode: addressForm.postalCode,
    latitude: Number(addressForm.latitude || defaultLatitude),
    longitude: Number(addressForm.longitude || defaultLongitude),
    isDefault: addresses.length === 0,
    contactName: addressForm.contactName || profile?.name || session?.name || "",
    contactPhone: addressForm.contactPhone || profile?.phoneNumber || session?.phoneNumber || "",
  });

  const openCashfreeCheckout = async (order: PlacedOrder) => {
    await ensureCashfreeScript();

    const payment = await initiateOnlinePayment(order.id || order.orderId || 0);

    return new Promise<void>((resolve, reject) => {
      try {
        if (!window.Cashfree) {
          throw new Error("Cashfree SDK not loaded correctly.");
        }

        const cashfree = window.Cashfree({
          mode: payment.environment === "production" ? "production" : "sandbox",
        });

        cashfree.checkout({
          paymentSessionId: payment.paymentSessionId,
          redirectTarget: "_modal",
        }).then(async () => {
          try {
            await verifyOnlinePayment({
              cfOrderId: payment.cfOrderId,
              receipt: payment.receipt,
            });
            resolve();
          } catch (verifyError) {
            reject(verifyError);
          }
        }).catch((err: any) => {
          reject(err || new Error("Payment was cancelled or failed."));
        });
      } catch (err) {
        reject(err);
      }
    });
  };

  const handlePlaceOrder = async () => {
    if (!cart.length) {
      toast.error("Your basket is empty.");
      return;
    }

    if (!session?.accessToken) {
      openAuthModal();
      toast.error("Sign in to place your order.");
      return;
    }

    if (useNewAddress) {
      if (!addressForm.addressLine1.trim() || !addressForm.city.trim() || !addressForm.postalCode.trim()) {
        toast.error("Add the delivery address before placing the order.");
        return;
      }
    }

    if (!walletCoversOrder && !enabledPaymentMethods.some((method) => method.value === paymentMethod)) {
      toast.error("Choose a valid payment method before placing the order.");
      return;
    }

    setIsSubmitting(true);

    try {
      const syncedCart = await syncCartToServer(toServerPayload());
      setServerCartPreview(syncedCart);

      // Detect items the server rejected (out of stock / unavailable after sync)
      const syncedVariantIds = new Set(
        syncedCart.items.filter((i) => !i.freeItem).map((i) => i.variantId),
      );
      const droppedItems = cart.filter((item) => !syncedVariantIds.has(item.variantId));
      if (droppedItems.length > 0) {
        droppedItems.forEach((item) => removeItem(item.variantId));
        const names = droppedItems.map((i) => `"${i.name}"`).join(", ");
        toast.error(
          droppedItems.length === 1
            ? `${names} is out of stock and was removed from your cart.`
            : `Some items (${names}) are out of stock and were removed from your cart.`,
        );
        setIsSubmitting(false);
        return;
      }

      let addressId = selectedAddressId;
      if (useNewAddress || !addressId) {
        const savedAddress = await saveAddress(buildAddressPayload());
        addressId = savedAddress.id;
        setAddresses((current) => {
          const next = [...current, savedAddress];
          return next;
        });
      }

      if (!addressId) {
        throw new Error("We could not confirm the delivery address.");
      }

      const order = await placeOrder({
        addressId,
        paymentMethod: resolvedPaymentMethod,
        walletAmount: walletApplied > 0 ? Number(walletApplied.toFixed(2)) : undefined,
        couponCode: appliedCoupon?.code,
      });

      if (resolvedPaymentMethod === "ONLINE" || resolvedPaymentMethod === "ONLINE_WALLET") {
        await openCashfreeCheckout(order);
      }

      try {
        const refreshedProfile = await getCustomerProfile();
        updateProfile(refreshedProfile);
      } catch {
        // Keep the checkout success flow intact even if wallet refresh fails.
      }

      clearCart();
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponStatus("");
      setPlacedOrder({
        ...order,
        paymentMethod: resolvedPaymentMethod,
        walletApplied: order.walletApplied ?? walletApplied,
        paymentStatus:
          resolvedPaymentMethod === "ONLINE" || resolvedPaymentMethod === "ONLINE_WALLET" || resolvedPaymentMethod === "WALLET"
            ? "PAID"
            : order.paymentStatus,
      });
      toast.success(`Order ${order.orderNumber} placed successfully.`);
    } catch (submitError: any) {
      const message = submitError?.message || "Unable to place the order.";
      if (message.toLowerCase().includes("sign in")) {
        hydrateFromStorage();
        openAuthModal();
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart.length && !placedOrder) {
    return (
      <div className="app-shell-narrow text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#eef4e4]">
          <ShoppingBag className="h-10 w-10 text-[#2d5e35]" />
        </div>
        <h1 className="page-title mt-6">Nothing to check out yet</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#627562]">
          Add products to your basket first, then come back here to test the end-to-end ordering flow.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#17381f] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(22,56,31,0.22)]"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="app-shell-narrow">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[3rem] border border-white/20 bg-gradient-to-br from-[#10b981] to-[#047857] px-8 py-12 text-white shadow-[0_30px_80px_rgba(16,185,129,0.3)] sm:px-12"
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                Order placed
              </div>
              <h1 className="mt-5 font-['Fraunces'] text-[clamp(2.5rem,6vw,4.2rem)] leading-[1.02]">Thanks, your order is placed.</h1>
              <p className="mt-4 text-sm leading-7 text-white/82">
                Order number <strong>{placedOrder.orderNumber}</strong> is placed with Anusha Bazaar. Payment status:
                {" "}
                <strong>
                  {placedOrder.paymentStatus ||
                    (placedOrder.paymentMethod === "ONLINE" ||
                    placedOrder.paymentMethod === "ONLINE_WALLET" ||
                    placedOrder.paymentMethod === "WALLET"
                      ? "PAID"
                      : "PENDING")}
                </strong>.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-white/20 bg-white/10 p-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Grand total</div>
              <div className="mt-3 font-['Fraunces'] text-[clamp(3rem,6vw,4.5rem)] font-black tracking-tight leading-none">{formatCurrency(placedOrder.grandTotal)}</div>
              <div className="mt-4 text-sm font-semibold text-white/90">Payment method: {formatPaymentMethodLabel(placedOrder.paymentMethod)}</div>
              {placedOrder.walletApplied && placedOrder.walletApplied > 0 ? (
                <div className="mt-2 text-sm font-semibold text-white/90">Wallet used: {formatCurrency(placedOrder.walletApplied)}</div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              "Order created successfully",
              placedOrder.discount && placedOrder.discount > 0 ? `Coupon savings secured: ${formatCurrency(placedOrder.discount)}` : null,
              placedOrder.paymentMethod === "WALLET"
                ? "Wallet balance covered the full order"
                : placedOrder.paymentMethod === "ONLINE" || placedOrder.paymentMethod === "ONLINE_WALLET"
                  ? placedOrder.walletApplied && placedOrder.walletApplied > 0
                    ? `Wallet applied first, then ${formatCurrency(placedOrder.grandTotal - placedOrder.walletApplied)} paid online`
                    : "Online payment captured and verified"
                  : placedOrder.walletApplied && placedOrder.walletApplied > 0
                    ? `Wallet applied first, then ${formatCurrency(placedOrder.grandTotal - placedOrder.walletApplied)} remains for delivery`
                    : "Cash on delivery selected",
              placedOrder.estimatedDeliveryTime
                ? `Estimated delivery: ${placedOrder.estimatedDeliveryTime}`
                : "Delivery pipeline synced for rider assignment",
              placedOrder.deliveryPersonName
                ? `Rider: ${placedOrder.deliveryPersonName}`
                : "Delivery partner details will appear after assignment",
              "Local basket cleared after order success",
            ]
              .filter(Boolean)
              .map((line) => (
              <div key={line} className="rounded-[1.8rem] border border-white/20 bg-white/10 px-5 py-5 backdrop-blur-sm transition-transform hover:-translate-y-1">
                <div className="flex items-center gap-3 text-[1.1rem] font-bold text-white">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  {line}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to={`/account?tab=tracking&order=${placedOrder.id}`}
              className="inline-flex h-14 items-center gap-3 rounded-full bg-white px-8 text-[1.1rem] font-bold text-[#061109] shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all hover:scale-105 hover:bg-white/90"
            >
              Track this order
            </Link>
            <Link
              to="/account?tab=orders"
              className="inline-flex h-14 items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 text-[1.1rem] font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
            >
              View all orders
            </Link>
            <Link
              to="/shop"
              className="inline-flex h-14 items-center gap-3 rounded-full border border-white/20 bg-white/10 px-8 text-[1.1rem] font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
            >
              Continue shopping
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title">Checkout</h1>
          <p className="mt-2 text-sm text-[#607361]">
            Save an address, choose a payment method, review savings, and place your order with confidence.
          </p>
        </div>
        {!session?.accessToken ? (
          <button
            type="button"
            onClick={openAuthModal}
            className="rounded-full bg-[#17381f] px-5 py-3 text-sm font-semibold text-white"
          >
            Sign in to continue
          </button>
        ) : null}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Customer sign-in</div>
                <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">
                  {session?.accessToken ? "Signed in" : "Authentication required"}
                </h2>
              </div>
              <ShieldCheck className="h-10 w-10 text-[#10b981]" />
            </div>
            <p className="mt-5 text-[1.1rem] leading-7 text-[#4d5e50] dark:text-white/70">
              {session?.accessToken
                ? `You are ordering as ${profile?.name || session?.name || "Customer"} (${session.phoneNumber}).`
                : "Sign in with your mobile number to continue to secure checkout."}
            </p>
          </div>

          <div className="rounded-[2.2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,244,236,0.98))] p-6 shadow-[0_25px_60px_rgba(20,38,25,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#7a8d7a]">Delivery address</div>
                <h2 className="mt-2 font-['Fraunces'] text-3xl text-[#17311d]">Choose where this order goes</h2>
              </div>
              <button
                type="button"
                onClick={() => setUseNewAddress(true)}
                className="rounded-full border border-[#d7e1ce] px-4 py-2 text-sm font-semibold text-[#1f4225]"
              >
                Add new address
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="rounded-full border border-[#dbe5d1] bg-[#f8fbf4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d7a5f]">
                {addresses.length} saved address{addresses.length === 1 ? "" : "es"}
              </div>
              <div className="rounded-full border border-[#dbe5d1] bg-[#f8fbf4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d7a5f]">
                OTP-secured checkout
              </div>
              <div className="rounded-full border border-[#dbe5d1] bg-[#f8fbf4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#5d7a5f]">
                Smart location fill
              </div>
            </div>

            {addresses.length > 0 ? (
              <div className="mt-6 grid gap-3">
                {addresses.map((address) => (
                  <button
                    type="button"
                    key={address.id}
                    onClick={() => {
                      setSelectedAddressId(address.id);
                      setUseNewAddress(false);
                    }}
                    className={`rounded-[1.6rem] border px-4 py-4 text-left transition ${
                      !useNewAddress && selectedAddressId === address.id
                        ? "border-[#1d7c3f] bg-[#eff8e7] shadow-[0_14px_28px_rgba(29,124,63,0.12)]"
                        : "border-[#dbe5d1] bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[#17311d]">
                          {address.addressType || "HOME"}
                          {address.isDefault ? " | Default" : ""}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[#607361]">
                          {[address.flatNumber, address.addressLine1, address.addressLine2, address.landmark, address.city, address.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      </div>
                      {!useNewAddress && selectedAddressId === address.id ? (
                        <CheckCircle2 className="h-5 w-5 text-[#1d7c3f]" />
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {(useNewAddress || addresses.length === 0) ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 overflow-hidden rounded-[1.8rem] border border-[#d4e7ca] bg-[linear-gradient(135deg,#f7fbe8,#eff8e7)] p-5 shadow-[0_16px_30px_rgba(29,124,63,0.08)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="text-xs uppercase tracking-[0.18em] text-[#5d7a5f]">Smart address fill</div>
                      <h3 className="mt-2 font-['Fraunces'] text-2xl text-[#17311d]">Use your current location to fill this form faster.</h3>
                      <p className="mt-3 text-sm leading-6 text-[#5a725b]">
                        We will add available city, state, postal code, and locality details from your device location, then you can fine-tune the address before placing the order.
                      </p>
                      <div className="mt-4 rounded-[1.2rem] border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#4e6a52]">
                        Current area: {currentLocation.fullLabel || currentLocation.shortLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLocate}
                      className="inline-flex items-center gap-2 rounded-full bg-[#17381f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(22,56,31,0.18)]"
                    >
                      {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                      Use my location
                    </button>
                  </div>
                </div>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Address type</span>
                  <select
                    value={addressForm.addressType}
                    onChange={(event) => setAddressForm((current) => ({ ...current, addressType: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                  >
                    <option value="HOME">Home</option>
                    <option value="WORK">Work</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Flat or house number</span>
                  <input
                    type="text"
                    value={addressForm.flatNumber}
                    onChange={(event) => setAddressForm((current) => ({ ...current, flatNumber: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="Flat 204 / House number"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Address line 1</span>
                  <input
                    type="text"
                    value={addressForm.addressLine1}
                    onChange={(event) => setAddressForm((current) => ({ ...current, addressLine1: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="Building, street, or locality"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Address line 2</span>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(event) => setAddressForm((current) => ({ ...current, addressLine2: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="Area, colony, landmark"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">City</span>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">State</span>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(event) => setAddressForm((current) => ({ ...current, state: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Postal code</span>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(event) => setAddressForm((current) => ({ ...current, postalCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="500072"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Landmark</span>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(event) => setAddressForm((current) => ({ ...current, landmark: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="Nearby landmark"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Contact name</span>
                  <input
                    type="text"
                    value={addressForm.contactName}
                    onChange={(event) => setAddressForm((current) => ({ ...current, contactName: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="Receiver name"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Contact phone</span>
                  <input
                    type="tel"
                    value={addressForm.contactPhone}
                    onChange={(event) => setAddressForm((current) => ({ ...current, contactPhone: event.target.value }))}
                    className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                    placeholder="+91 98765 43210"
                  />
                </label>

                <div className="sm:col-span-2 rounded-[1.6rem] border border-[#dbe5d1] bg-[#f7faf2] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#18331f]">Delivery precision</div>
                      <p className="mt-1 text-xs leading-5 text-[#607361]">
                        Coordinates help rider assignment and tracking stay accurate. You can still edit any field manually before placing the order.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLocate}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#214b29]"
                    >
                      {isLocating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                      Use my location
                    </button>
                  </div>
                  <div className="mt-3 rounded-[1.2rem] border border-white/80 bg-white/80 px-4 py-3 text-xs uppercase tracking-[0.16em] text-[#6d826d]">
                    Auto-detected area: {currentLocation.fullLabel || currentLocation.shortLabel}
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      value={addressForm.latitude}
                      onChange={(event) => setAddressForm((current) => ({ ...current, latitude: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      value={addressForm.longitude}
                      onChange={(event) => setAddressForm((current) => ({ ...current, longitude: event.target.value }))}
                      className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm text-[#112417] outline-none"
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2.2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,244,236,0.98))] p-6 shadow-[0_25px_60px_rgba(20,38,25,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#7a8d7a]">Coupons & delivery</div>
                <h2 className="mt-2 font-['Fraunces'] text-3xl text-[#17311d]">Lock in savings before payment</h2>
              </div>
              <TicketPercent className="h-7 w-7 text-[#2f6a3a]" />
            </div>

            <div className="mt-6 grid gap-5 2xl:grid-cols-[1.15fr_0.85fr]">
              <div>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#18331f]">Coupon code</span>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(event) => {
                        setCouponCode(event.target.value.toUpperCase());
                        if (couponStatus) {
                          setCouponStatus("");
                        }
                      }}
                      disabled={!session?.accessToken || isApplyingCoupon}
                      className="w-full rounded-2xl border border-[#d7e1ce] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#112417] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[#8aa08b] disabled:cursor-not-allowed disabled:bg-[#f5f7f2]"
                      placeholder={session?.accessToken ? "WELCOME10" : "Sign in to unlock coupons"}
                    />
                    {appliedCoupon ? (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e3d3ce] px-5 py-3 text-sm font-semibold text-[#8a4f41] transition hover:bg-[#fff3f1]"
                      >
                        <X className="h-4 w-4" />
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleApplyCoupon()}
                        disabled={!session?.accessToken || isApplyingCoupon}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1d7c3f] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(29,124,63,0.18)] transition hover:bg-[#166836] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isApplyingCoupon ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <TicketPercent className="h-4 w-4" />}
                        Apply
                      </button>
                    )}
                  </div>
                </label>

                {appliedCoupon ? (
                  <div className="mt-4 rounded-[1.6rem] border border-[#cfe3bf] bg-[#eff8e7] p-4 shadow-[0_14px_28px_rgba(29,124,63,0.08)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-[#6e866f]">Applied coupon</div>
                        <div className="mt-2 text-lg font-semibold text-[#17311d]">{appliedCoupon.code}</div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#1d7c3f]">
                        - {formatCurrency(appliedCoupon.discount)}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#567057]">
                      Coupon discount is now reflected in the payable total below.
                    </p>
                  </div>
                ) : null}

                {couponStatus ? (
                  <p className="mt-3 rounded-[1.2rem] border border-[#e6d8c5] bg-[#fff8ee] px-4 py-3 text-sm text-[#8b5c33]">
                    {couponStatus}
                  </p>
                ) : null}

                {!session?.accessToken ? (
                  <div className="mt-5 rounded-[1.6rem] border border-[#e6d8c5] bg-[#fff8ee] px-4 py-4 text-sm text-[#8b5c33]">
                    Active coupons are visible now. Sign in to apply one to your order.
                  </div>
                ) : null}

                {visibleCoupons.length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {visibleCoupons.slice(0, 4).map(({ coupon, eligible }) => (
                      <button
                        type="button"
                        key={coupon.id}
                        onClick={() => {
                          if (!eligible) {
                            setCouponCode(coupon.code);
                            setCouponStatus(`Minimum cart value of ${formatCurrency(coupon.minCartValue || 0)} required for ${coupon.code}.`);
                            return;
                          }
                          setCouponCode(coupon.code);
                          if (session?.accessToken) {
                            void handleApplyCoupon(coupon.code);
                            return;
                          }
                          setCouponStatus("Sign in to apply this coupon.");
                          openAuthModal();
                        }}
                        className={`rounded-[1.6rem] border p-4 text-left transition ${
                          eligible
                            ? "border-[#dbe5d1] bg-white hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(23,42,28,0.08)]"
                            : "border-[#e6d8c5] bg-[#fff8ee] opacity-80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-[#17311d]">{coupon.code}</div>
                            <div className="mt-1 text-sm text-[#2f6a3a]">{formatCouponHeadline(coupon)}</div>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4e4]">
                            <TicketPercent className="h-4 w-4 text-[#2f6a3a]" />
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-[#6b7c6c]">
                          {coupon.description || "Extra savings on your Anusha Bazaar order."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#718372]">
                          <span>Min cart {formatCurrency(coupon.minCartValue || 0)}</span>
                          <span>{eligible ? (coupon.firstTimeUserOnly ? "First order only" : "Apply now") : "Add more items"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.6rem] border border-dashed border-[#d7e1ce] bg-[#f8fbf4] px-4 py-4 text-sm text-[#607361]">
                    No active coupons are available right now. Check back soon for fresh savings.
                  </div>
                )}
              </div>

              <div className="rounded-[1.8rem] border border-[#dbe5d1] bg-[#f8fbf4] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#748775]">Delivery snapshot</div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[1.4rem] border border-[#dbe5d1] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[#2f6a3a]" />
                      <div>
                        <div className="font-semibold text-[#17311d]">Delivering to</div>
                        <div className="mt-1 text-sm text-[#607361]">{deliveryDestination}</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#dbe5d1] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-[#2f6a3a]" />
                      <div>
                        <div className="font-semibold text-[#17311d]">Delivery charge</div>
                        <div className="mt-1 text-sm text-[#607361]">
                          {feeBreakdown.deliveryCharge > 0
                            ? `${formatCurrency(feeBreakdown.deliveryCharge)} applied because this order is below ${formatCurrency(feeBreakdown.freeDeliveryThreshold)}`
                            : feeBreakdown.freeDeliveryThreshold > 0
                              ? `Free delivery unlocked for orders from ${formatCurrency(feeBreakdown.freeDeliveryThreshold)}`
                              : "Included in the current checkout estimate"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#dbe5d1] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Clock3 className="h-5 w-5 text-[#2f6a3a]" />
                      <div>
                        <div className="font-semibold text-[#17311d]">Checkout flow</div>
                        <div className="mt-1 text-sm text-[#607361]">
                          Address, coupon, and payment are now organized together for faster order placement.
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#dbe5d1] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#2f6a3a]" />
                      <div>
                        <div className="font-semibold text-[#17311d]">Payment options</div>
                        <div className="mt-1 text-sm text-[#607361]">
                          {[walletBalance > 0 ? "Wallet" : null, ...enabledPaymentMethods.map((method) => method.label)]
                            .filter(Boolean)
                            .join(" | ") || "Unavailable right now"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {feeBreakdown.remainingForFreeDelivery > 0 ? (
                    <div className="rounded-[1.4rem] border border-[#efe1ba] bg-[#fff9eb] p-4 text-sm text-[#8a6932]">
                      Add {formatCurrency(feeBreakdown.remainingForFreeDelivery)} more to remove the delivery charge and small-cart fee.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-white/65 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(246,244,236,0.98))] p-6 shadow-[0_25px_60px_rgba(20,38,25,0.08)]">
            <div className="text-xs uppercase tracking-[0.2em] text-[#7a8d7a]">Wallet</div>
            <h2 className="mt-2 font-['Fraunces'] text-3xl text-[#17311d]">Use wallet before the final payment</h2>

            {session?.accessToken ? (
              <>
                <div className="mt-6 rounded-[1.8rem] border border-[#dbe5d1] bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4e4]">
                        <Wallet className="h-5 w-5 text-[#2f6a3a]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#17311d]">Available wallet balance</div>
                        <div className="mt-1 text-sm text-[#607361]">
                          {walletBalance > 0
                            ? "Apply your wallet first, then choose COD or online for the remaining amount."
                            : "Your wallet is currently empty. Add money from your account page anytime."}
                        </div>
                      </div>
                    </div>
                    <div className="rounded-full bg-[#eff8e7] px-3 py-1.5 text-sm font-semibold text-[#1d7c3f]">
                      {formatCurrency(walletBalance)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => walletBalance > 0 && setUseWallet((current) => !current)}
                    disabled={walletBalance <= 0}
                    className={`mt-5 flex w-full items-center justify-between rounded-[1.5rem] border px-4 py-4 text-left transition ${
                      useWallet
                        ? "border-[#1d7c3f] bg-[#eff8e7] shadow-[0_14px_28px_rgba(29,124,63,0.12)]"
                        : "border-[#dbe5d1] bg-[#f8fbf4]"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div>
                      <div className="font-semibold text-[#17311d]">{useWallet ? "Wallet enabled" : "Use wallet balance"}</div>
                      <div className="mt-1 text-sm text-[#607361]">
                        {walletBalance > 0
                          ? `Up to ${formatCurrency(Math.min(walletBalance, estimatedOrderTotal))} will be applied on this order.`
                          : "No wallet balance is available for this order yet."}
                      </div>
                    </div>
                    {useWallet ? <CheckCircle2 className="h-5 w-5 text-[#1d7c3f]" /> : null}
                  </button>
                </div>

                {useWallet ? (
                  <div className="mt-4 rounded-[1.6rem] border border-[#dbe5d1] bg-[#f8fbf4] p-4 text-sm text-[#4c654d]">
                    <div className="flex items-center justify-between gap-3">
                      <span>Wallet applied now</span>
                      <span className="font-semibold text-[#17311d]">- {formatCurrency(walletApplied)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span>{walletCoversOrder ? "Remaining after wallet" : "Remaining to pay"}</span>
                      <span className="font-semibold text-[#17311d]">{formatCurrency(remainingAfterWallet)}</span>
                    </div>
                    <p className="mt-3 leading-6 text-[#607361]">
                      {walletCoversOrder
                        ? "Your wallet fully covers this order, so no COD or online payment step is needed."
                        : paymentMethod === "ONLINE"
                          ? "The remaining amount will be collected through online payment after the order is created."
                          : "The remaining amount will be collected when the order is delivered."}
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-6 rounded-[1.6rem] border border-[#e6d8c5] bg-[#fff8ee] px-4 py-4 text-sm text-[#8b5c33]">
                Sign in first to view and use your wallet balance during checkout.
              </div>
            )}
          </div>

          <div className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Payment method</div>
            <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Choose how to pay</h2>

            {walletCoversOrder ? (
              <div className="mt-8 rounded-[2rem] border border-[#10b981]/20 bg-gradient-to-br from-[#10b981]/10 to-transparent p-6 text-[1.1rem] font-bold text-[#10b981]">
                Wallet is covering the full order. You can place it directly without an extra payment step.
              </div>
            ) : enabledPaymentMethods.length > 0 ? (
              <div className="mt-8 grid gap-4">
                {enabledPaymentMethods.map((method) => (
                  <button
                    type="button"
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`rounded-[2rem] border px-6 py-6 text-left transition-all ${
                      paymentMethod === method.value
                        ? "border-[#10b981] bg-gradient-to-br from-[#10b981]/10 to-transparent shadow-[0_14px_28px_rgba(16,185,129,0.15)]"
                        : "border-white/40 bg-white/50 hover:border-[#10b981]/50 dark:bg-black/30 dark:border-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10b981]/20 to-[#047857]/20">
                          <CreditCard className="h-6 w-6 text-[#10b981]" />
                        </div>
                        <div>
                          <div className="font-bold text-[1.1rem] text-[#061109] dark:text-white">{method.label}</div>
                          <div className="mt-1 text-sm font-semibold text-[#4d5e50] dark:text-white/70">{method.description}</div>
                        </div>
                      </div>
                      {paymentMethod === method.value ? <CheckCircle2 className="h-7 w-7 text-[#10b981]" /> : null}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent p-6 text-[1.1rem] font-bold text-rose-500">
                No extra payment method is available right now. Use wallet only, or try again later.
              </div>
            )}
          </div>
        </section>

        <aside className="xl:sticky xl:top-28 xl:max-h-[calc(100vh-8.5rem)] xl:self-start xl:overflow-y-auto">
          <div className="rounded-[3rem] border border-white/40 bg-white/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-black/30 dark:border-white/10 sm:p-10">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981]">Order summary</div>
            <h2 className="mt-3 font-['Fraunces'] text-[clamp(2rem,4vw,2.8rem)] font-bold tracking-tight text-[#061109] dark:text-white">Review before placing</h2>

            {isLoading ? (
              <div className="mt-6 flex items-center gap-3 text-[1.1rem] font-bold text-[#10b981]">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                Loading checkout settings...
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {cart.map((item) => (
                <div key={item.variantId} className="flex items-center gap-3 rounded-[1.4rem] border border-[#dbe5d1] bg-white p-3">
                  <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[#17311d]">{item.name}</div>
                    <div className="mt-1 text-sm text-[#607361]">
                      {item.variantName} | Qty {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-[#17311d]">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {isSyncingCartPreview || checkoutFreeItems.length > 0 ? (
              <div className="mt-4 rounded-[1.5rem] border border-[#dbe5d1] bg-[#f8fbf4] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#758975]">Included free items</div>
                    <div className="mt-1 text-sm text-[#607361]">
                      {isSyncingCartPreview
                        ? "Confirming eligible offer items..."
                        : session?.accessToken
                          ? "Unlocked from your current offers."
                          : "Unlocked from your current cart items."}
                    </div>
                  </div>
                  <Sparkles className="h-5 w-5 text-[#2f6a3a]" />
                </div>

                {!isSyncingCartPreview && checkoutFreeItems.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {checkoutFreeItems.map((item) => (
                      <div
                        key={`free-${item.variantId}-${item.offerName || item.productName}`}
                        className="flex items-center gap-3 rounded-[1.2rem] border border-[#d6e6cc] bg-white p-3"
                      >
                        <img src={item.productImage} alt={item.productName} className="h-14 w-14 rounded-2xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-[#17311d]">{item.productName}</div>
                          <div className="mt-1 text-sm text-[#607361]">
                            {item.variantName} | Qty {item.quantity}
                          </div>
                          {item.offerName ? (
                            <div className="mt-1 text-xs uppercase tracking-[0.14em] text-[#2f6a3a]">{item.offerName}</div>
                          ) : null}
                        </div>
                        <div className="rounded-full bg-[#eef8e7] px-3 py-1 text-xs font-semibold text-[#2f6339]">
                          FREE
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 space-y-3 border-t border-[#dce6d2] pt-5 text-sm text-[#526553]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#17311d]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery charge</span>
                <span className="font-semibold text-[#17311d]">{formatCurrency(feeBreakdown.deliveryCharge)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform fee</span>
                <span className="font-semibold text-[#17311d]">{formatCurrency(feeBreakdown.platformFee)}</span>
              </div>
              {feeBreakdown.handlingCharge > 0 ? (
                <div className="flex items-center justify-between">
                  <span>Handling</span>
                  <span className="font-semibold text-[#17311d]">{formatCurrency(feeBreakdown.handlingCharge)}</span>
                </div>
              ) : null}
              {feeBreakdown.smallCartFee > 0 ? (
                <div className="flex items-center justify-between">
                  <span>Small cart fee</span>
                  <span className="font-semibold text-[#17311d]">{formatCurrency(feeBreakdown.smallCartFee)}</span>
                </div>
              ) : null}
              {feeBreakdown.couponDiscount > 0 ? (
                <div className="flex items-center justify-between text-[#1f6f38]">
                  <span>Coupon discount</span>
                  <span className="font-semibold">- {formatCurrency(feeBreakdown.couponDiscount)}</span>
                </div>
              ) : null}
              {walletApplied > 0 ? (
                <div className="flex items-center justify-between text-[#1f6f38]">
                  <span>Wallet applied</span>
                  <span className="font-semibold">- {formatCurrency(walletApplied)}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-8 border-t border-white/40 pt-6 dark:border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#10b981]">Order total</span>
                <span className="font-['Fraunces'] text-[2.8rem] font-black leading-none tracking-tight text-[#061109] dark:text-white">{formatCurrency(feeBreakdown.total)}</span>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#10b981]">
                  {walletCoversOrder
                    ? "Paid via wallet"
                    : resolvedPaymentMethod === "ONLINE" || resolvedPaymentMethod === "ONLINE_WALLET"
                      ? "Pay online now"
                      : "Pay on delivery"}
                </span>
                <span className="font-['Fraunces'] text-[2rem] font-black text-[#061109] dark:text-white">
                  {formatCurrency(walletCoversOrder ? walletApplied : remainingAfterWallet)}
                </span>
              </div>
            </div>

            {appliedCoupon ? (
              <div className="mt-5 rounded-[1.5rem] border border-[#cfe3bf] bg-[#eff8e7] px-4 py-3 text-sm text-[#2d6237]">
                {appliedCoupon.code} is active and saving you {formatCurrency(appliedCoupon.discount)} on this order.
              </div>
            ) : null}

            {feeBreakdown.freeDeliveryThreshold > 0 ? (
              <div className="mt-4 rounded-[1.5rem] border border-[#dbe5d1] bg-[#f8fbf4] px-4 py-3 text-sm text-[#607361]">
                Free delivery starts at {formatCurrency(feeBreakdown.freeDeliveryThreshold)}, and all wallet adjustments stay visible before you place the order.
              </div>
            ) : null}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting || (!walletCoversOrder && enabledPaymentMethods.length === 0)}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1d7c3f] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_30px_rgba(29,124,63,0.24)] transition hover:bg-[#166836] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {isSubmitting
                ? "Placing order..."
                : walletCoversOrder
                  ? "Place wallet order"
                  : resolvedPaymentMethod === "ONLINE" || resolvedPaymentMethod === "ONLINE_WALLET"
                    ? "Continue to payment"
                    : "Place order"}
            </button>

            {!session?.accessToken ? (
              <p className="mt-4 rounded-[1.4rem] border border-[#e6d8c5] bg-[#fff8ee] px-4 py-3 text-sm text-[#8b5c33]">
                Sign in with OTP before placing your order.
              </p>
            ) : null}
            {session?.accessToken && !walletCoversOrder && enabledPaymentMethods.length === 0 ? (
              <p className="mt-4 rounded-[1.4rem] border border-[#f1d7cb] bg-[#fff5f1] px-4 py-3 text-sm text-[#9b533c]">
                A remaining balance still needs payment, but no COD or online option is enabled right now.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
