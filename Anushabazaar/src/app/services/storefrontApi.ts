import { API_BASE_URL } from "../lib/config";
import {
  calculateDiscountPercent,
  getVariantOriginalPrice,
  getVariantPrice,
  normalizeMediaUrl,
} from "../lib/storefrontUtils";
import { mapProductToSuggestion, mergeRankedProducts, mergeSuggestions, rankProductsForSearch } from "../lib/smartSearch";
import { getActiveAccessToken, refreshCustomerSession } from "../lib/session";
import type {
  Address,
  AddressPayload,
  AppliedCoupon,
  Banner,
  Category,
  CheckoutSettings,
  Coupon,
  CustomerProfile,
  CustomerSession,
  FreeItemOffer,
  OrderStoreGroup,
  OrderTracking,
  PaymentMethod,
  PlacedOrder,
  PolicyContent,
  Product,
  ProductSuggestion,
  ServerCart,
  Store,
  SubCategory,
  Variant,
} from "../types/storefront";

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT = 12000;
const SEARCH_CATALOG_TTL_MS = 5 * 60 * 1000;

let cachedSearchCatalogPromise: Promise<Product[]> | null = null;
let cachedSearchCatalogAt = 0;

const withTimeout = (promise: Promise<Response>, timeoutMs: number) =>
  new Promise<Response>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Request timed out")), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timeout);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });

const parseErrorMessage = async (response: Response) => {
  const text = await response.text().catch(() => "");
  if (!text) return `Request failed with status ${response.status}`;

  try {
    const parsed = JSON.parse(text);
    return parsed?.message || parsed?.error || text;
  } catch {
    return text;
  }
};

const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { auth = false, body, headers, timeoutMs = DEFAULT_TIMEOUT, ...rest } = options;
  const requestHeaders = new Headers(headers || {});
  requestHeaders.set("Accept", "application/json");

  let accessToken = auth ? await getActiveAccessToken() : null;
  if (auth && !accessToken) {
    throw new Error("Please sign in to continue.");
  }

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const runRequest = () =>
    withTimeout(
      fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
      timeoutMs,
    );

  let response = await runRequest();

  if (auth && response.status === 401) {
    const nextSession = await refreshCustomerSession();
    if (nextSession?.accessToken) {
      requestHeaders.set("Authorization", `Bearer ${nextSession.accessToken}`);
      response = await runRequest();
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};

const mapVariant = (variant: any): Variant => ({
  id: Number(variant?.id),
  name: variant?.name || "Standard pack",
  sku: variant?.sku,
  price: Number(variant?.price || 0),
  discountPrice: variant?.discountPrice != null ? Number(variant.discountPrice) : null,
  stock: Number(variant?.stock || 0),
  isActive: variant?.isActive !== false,
  displayOrder: Number(variant?.displayOrder || 0),
});

const mapProduct = (product: any): Product => {
  const variants = Array.isArray(product?.variants) ? product.variants.map(mapVariant) : [];
  const orderedVariants = variants.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const primaryVariant = orderedVariants[0] || null;
  const primaryPrice = getVariantPrice(primaryVariant);
  const originalPrice = getVariantOriginalPrice(primaryVariant);
  const gallery = Array.isArray(product?.images)
    ? product.images
        .map((item: any) => normalizeMediaUrl(item?.imageUrl || item))
        .filter(Boolean)
    : [];
  const heroImage = normalizeMediaUrl(product?.imageUrl || gallery[0]) || "";

  return {
    id: Number(product?.id),
    name: product?.name || "Untitled product",
    description: product?.description || "",
    isActive: product?.isActive !== false,
    isTrending: Boolean(product?.isTrending),
    bestSeller: Boolean(product?.bestSeller),
    displayOrder: Number(product?.displayOrder || 0),
    imageUrl: heroImage,
    videoUrl: product?.videoUrl || null,
    categoryId: product?.categoryId != null ? Number(product.categoryId) : null,
    categoryName: product?.categoryName || "",
    subCategoryId: product?.subCategoryId != null ? Number(product.subCategoryId) : null,
    subCategoryName: product?.subCategoryName || "",
    storeId: product?.storeId != null ? Number(product.storeId) : null,
    storeName: product?.storeName || "",
    hsnCode: product?.hsnCode || "",
    gstRate: Number(product?.gstRate || 0),
    images: [heroImage, ...gallery].filter((value, index, array) => value && array.indexOf(value) === index),
    variants: orderedVariants,
    minPrice: Number(product?.minPrice || primaryPrice || 0),
    maxPrice: Number(product?.maxPrice || primaryPrice || 0),
    primaryVariant,
    discountPercent: calculateDiscountPercent(originalPrice, primaryPrice),
    hasDiscount: primaryPrice > 0 && originalPrice > primaryPrice,
    isInStock: orderedVariants.some((variant) => Number(variant.stock || 0) > 0),
  };
};

const mapCategory = (category: any): Category => ({
  id: Number(category?.id),
  name: category?.name || "Category",
  description: category?.description || "",
  isActive: category?.isActive !== false,
  displayOrder: Number(category?.displayOrder || 0),
  discount: Number(category?.discount || 0),
  imageUrl: normalizeMediaUrl(category?.imageUrl || category?.image) || "",
  videoUrl: category?.videoUrl || null,
  createdAt: category?.createdAt,
  updatedAt: category?.updatedAt,
});

const mapSubCategory = (subCategory: any): SubCategory => ({
  id: Number(subCategory?.id),
  name: subCategory?.name || "Subcategory",
  description: subCategory?.description || "",
  isActive: subCategory?.isActive !== false,
  displayOrder: Number(subCategory?.displayOrder || 0),
  discount: Number(subCategory?.discount || 0),
  categoryId: subCategory?.categoryId != null ? Number(subCategory.categoryId) : undefined,
  categoryName: subCategory?.categoryName || "",
  imageUrl: normalizeMediaUrl(subCategory?.imageUrl || subCategory?.image) || "",
  videoUrl: subCategory?.videoUrl || null,
  createdAt: subCategory?.createdAt,
  updatedAt: subCategory?.updatedAt,
});

const mapStore = (store: any): Store => ({
  id: Number(store?.id),
  name: store?.name || "Store",
  label: store?.label || "",
  displayOrder: Number(store?.displayOrder || 0),
  active: store?.active !== false,
  imageUrl: normalizeMediaUrl(store?.imageUrl || store?.image) || "",
  address: store?.address || "",
  city: store?.city || "",
  pincode: store?.pincode || "",
  phoneNumber: store?.phoneNumber || "",
  priceRange: store?.priceRange || "",
  timings: store?.timings || "",
  announcement: store?.announcement || "",
  delivery: store?.delivery || "",
  packageCost: store?.packageCost || "",
  rating: Number(store?.rating || 0),
  preferredOrder: Number(store?.preferredOrder || 0),
  latitude: store?.latitude != null ? Number(store.latitude) : undefined,
  longitude: store?.longitude != null ? Number(store.longitude) : undefined,
  createdAt: store?.createdAt,
  updatedAt: store?.updatedAt,
});

const mapCoupon = (coupon: any): Coupon => ({
  id: Number(coupon?.id),
  code: coupon?.code || "",
  description: coupon?.description || "",
  discountType: coupon?.discountType || "FIXED_AMOUNT",
  discountValue: Number(coupon?.discountValue || 0),
  minCartValue: Number(coupon?.minCartValue || 0),
  maxDiscountAmount: coupon?.maxDiscountAmount != null ? Number(coupon.maxDiscountAmount) : null,
  startDate: coupon?.startDate,
  expiryDate: coupon?.expiryDate,
  usageLimit: coupon?.usageLimit != null ? Number(coupon.usageLimit) : null,
  usageLimitPerUser: coupon?.usageLimitPerUser != null ? Number(coupon.usageLimitPerUser) : null,
  firstTimeUserOnly: Boolean(coupon?.firstTimeUserOnly),
  isActive: coupon?.isActive !== false,
});

const mapFreeItemOffer = (offer: any): FreeItemOffer => ({
  id: Number(offer?.id),
  name: offer?.name || "",
  description: offer?.description || "",
  qualifyingVariantId: offer?.qualifyingVariantId != null ? Number(offer.qualifyingVariantId) : null,
  qualifyingProductId: offer?.qualifyingProductId != null ? Number(offer.qualifyingProductId) : null,
  qualifyingProductName: offer?.qualifyingProductName || "",
  qualifyingProductImage: normalizeMediaUrl(offer?.qualifyingProductImage) || "",
  qualifyingVariantName: offer?.qualifyingVariantName || "",
  qualifyingVariantSku: offer?.qualifyingVariantSku || "",
  qualifyingQuantity: Number(offer?.qualifyingQuantity || 1),
  qualifyingByProduct: Boolean(offer?.qualifyingByProduct),
  freeVariantId: offer?.freeVariantId != null ? Number(offer.freeVariantId) : null,
  freeProductId: offer?.freeProductId != null ? Number(offer.freeProductId) : null,
  freeProductName: offer?.freeProductName || "",
  freeProductImage: normalizeMediaUrl(offer?.freeProductImage) || "",
  freeVariantName: offer?.freeVariantName || "",
  freeVariantSku: offer?.freeVariantSku || "",
  freeQuantity: Number(offer?.freeQuantity || 1),
  startDate: offer?.startDate,
  expiryDate: offer?.expiryDate,
  active: offer?.active !== false,
});

const mapSession = (payload: any): CustomerSession => {
  const expiresInSeconds = Number(payload?.expiresIn || 0);
  return {
    accessToken: payload?.accessToken || payload?.jwtToken,
    refreshToken: payload?.refreshToken,
    expiresAt: expiresInSeconds > 0 ? Date.now() + expiresInSeconds * 1000 : undefined,
    customerId: Number(payload?.customerId),
    phoneNumber: payload?.phoneNumber,
    name: payload?.name || "",
    email: payload?.email || "",
    walletBalance: payload?.walletBalance != null ? Number(payload.walletBalance) : undefined,
    roles: payload?.roles || null,
  };
};

const mapAddress = (address: any): Address => ({
  id: Number(address?.id),
  addressType: address?.addressType || "HOME",
  flatNumber: address?.flatNumber || "",
  addressLine1: address?.addressLine1 || "",
  addressLine2: address?.addressLine2 || "",
  landmark: address?.landmark || "",
  city: address?.city || "",
  state: address?.state || "",
  postalCode: address?.postalCode || "",
  latitude: Number(address?.latitude || 0),
  longitude: Number(address?.longitude || 0),
  isDefault: Boolean(address?.isDefault),
  contactName: address?.contactName || "",
  contactPhone: address?.contactPhone || "",
});

const mapOrderItem = (item: any) => ({
  id: item?.id != null ? Number(item.id) : undefined,
  productId: Number(item?.productId),
  variantId: Number(item?.variantId),
  productName: item?.productName || "",
  variantName: item?.variantName || "",
  sku: item?.sku || "",
  quantity: Number(item?.quantity || 0),
  unitPrice: Number(item?.unitPrice || 0),
  totalPrice: Number(item?.totalPrice || 0),
  hsnCode: item?.hsnCode || "",
  gstRate: Number(item?.gstRate || 0),
  taxableAmount: Number(item?.taxableAmount || 0),
  cgstRate: Number(item?.cgstRate || 0),
  sgstRate: Number(item?.sgstRate || 0),
  igstRate: Number(item?.igstRate || 0),
  cgstAmount: Number(item?.cgstAmount || 0),
  sgstAmount: Number(item?.sgstAmount || 0),
  igstAmount: Number(item?.igstAmount || 0),
  totalTaxAmount: Number(item?.totalTaxAmount || 0),
  imageUrl: normalizeMediaUrl(item?.imageUrl || item?.productImage || item?.image) || "",
  storeName: item?.storeName || "",
  freeItem: Boolean(item?.freeItem),
  offerName: item?.offerName || "",
});

const mapOrderStoreGroup = (group: any): OrderStoreGroup => ({
  storeId: group?.storeId != null ? Number(group.storeId) : undefined,
  storeName: group?.storeName || "Store",
  status: group?.status || "",
  subtotal: group?.subtotal != null ? Number(group.subtotal) : undefined,
  items: (group?.items || []).map(mapOrderItem),
});

const mapPlacedOrder = (data: any, fallbackPaymentMethod?: PaymentMethod): PlacedOrder => ({
  id: Number(data?.id || data?.orderId),
  orderId: data?.orderId != null ? Number(data.orderId) : undefined,
  orderNumber: data?.orderNumber || "",
  subtotal: Number(data?.subtotal || 0),
  deliveryCharge: Number(data?.deliveryCharge || 0),
  platformFee: Number(data?.platformFee || 0),
  handlingCharge: Number(data?.handlingCharge || 0),
  smallCartFee: Number(data?.smallCartFee || 0),
  walletApplied: Number(data?.walletApplied || 0),
  paidAmount: Number(data?.paidAmount || 0),
  tax: Number(data?.tax || 0),
  taxableAmount: Number(data?.taxableAmount || 0),
  cgstAmount: Number(data?.cgstAmount || 0),
  sgstAmount: Number(data?.sgstAmount || 0),
  igstAmount: Number(data?.igstAmount || 0),
  discount: Number(data?.discount || 0),
  grandTotal: Number(data?.grandTotal || 0),
  paymentMethod: data?.paymentMethod || fallbackPaymentMethod || "COD",
  orderStatus: data?.orderStatus || data?.status,
  status: data?.status || data?.orderStatus,
  paymentStatus: data?.paymentStatus || "",
  refundStatus: data?.refundStatus || "",
  placedAt: data?.placedAt,
  createdAt: data?.createdAt,
  estimatedDeliveryTime: data?.estimatedDeliveryTime,
  deliveryPersonName: data?.deliveryPersonName || "",
  deliveryPersonPhone: data?.deliveryPersonPhone || "",
  sellerName: data?.sellerName || "ANUSHA BAZAAR",
  sellerGstin: data?.sellerGstin || "36AIJPN3614J1Z4",
  sellerAddress: data?.sellerAddress || "",
  sellerState: data?.sellerState || "Telangana",
  sellerStateCode: data?.sellerStateCode || "36",
  placeOfSupply: data?.placeOfSupply || "",
  placeOfSupplyCode: data?.placeOfSupplyCode || "",
  reverseCharge: Boolean(data?.reverseCharge),
  address: data?.address,
  storeGroups: Array.isArray(data?.storeGroups) ? data.storeGroups.map(mapOrderStoreGroup) : [],
  items: (data?.items || []).map(mapOrderItem),
});

const mapTrackingResponse = (data: any): OrderTracking => ({
  orderNumber: data?.orderNumber || "",
  status: data?.status || "PENDING",
  message: data?.message || "",
  isLive: Boolean(data?.isLive),
  updatedAt: data?.updatedAt || data?.location?.updatedAt,
  deliveryPersonName: data?.deliveryPersonName || data?.riderName || "",
  deliveryPersonPhone: data?.deliveryPersonPhone || data?.riderPhone || "",
  lat:
    data?.lat != null
      ? Number(data.lat)
      : data?.location?.latitude != null
        ? Number(data.location.latitude)
        : data?.location?.lat != null
          ? Number(data.location.lat)
          : null,
  lng:
    data?.lng != null
      ? Number(data.lng)
      : data?.location?.longitude != null
        ? Number(data.location.longitude)
        : data?.location?.lng != null
          ? Number(data.location.lng)
          : null,
});

export const getBanners = async () => {
  const data = await apiRequest<{ banners?: any[] }>("/website/banners");
  return (data?.banners || []).map(
    (banner): Banner => ({
      id: Number(banner?.id),
      name: banner?.name || "Featured banner",
      imageUrl: normalizeMediaUrl(banner?.imageUrl) || "",
      videoUrl: banner?.videoUrl || null,
      targetUrl: banner?.targetUrl || null,
      targetApp: banner?.targetApp || null,
      actionType: banner?.actionType || null,
      actionValue: banner?.actionValue || null,
      isActive: banner?.isActive !== false,
      displayOrder: Number(banner?.displayOrder || 0),
      createdAt: banner?.createdAt,
    }),
  );
};

export const getCategories = async () => {
  const data = await apiRequest<any[]>("/categories");
  return (data || []).map(mapCategory).filter((item) => item.isActive !== false);
};

export const getCategoryById = async (categoryId: number) => {
  const data = await apiRequest<any>(`/categories/${categoryId}`);
  return mapCategory(data);
};

export const getSubcategories = async (categoryId?: number) => {
  const path = categoryId ? `/subcategories/${categoryId}` : "/subcategories";
  const data = await apiRequest<any[]>(path);
  return (data || []).map(mapSubCategory).filter((item) => item.isActive !== false);
};

export const getStores = async (query?: { name?: string; page?: number; size?: number }) => {
  const search = new URLSearchParams();
  if (query?.name) search.set("name", query.name);
  if (query?.page != null) search.set("page", String(query.page));
  if (query?.size != null) search.set("size", String(query.size));
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const data = await apiRequest<{ content?: any[] }>(`/stores${suffix}`);
  return (data?.content || []).map(mapStore);
};

const fetchProducts = async (query?: {
  storeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  trending?: boolean;
  keyword?: string;
}) => {
  const params = new URLSearchParams();
  if (query?.storeId != null) params.set("storeId", String(query.storeId));

  const useFilterEndpoint =
    query?.categoryId != null ||
    query?.subCategoryId != null ||
    query?.minPrice != null ||
    query?.maxPrice != null ||
    query?.trending != null ||
    Boolean(query?.keyword);

  if (query?.categoryId != null) params.set("categoryId", String(query.categoryId));
  if (query?.subCategoryId != null) params.set("subCategoryId", String(query.subCategoryId));
  if (query?.minPrice != null) params.set("minPrice", String(query.minPrice));
  if (query?.maxPrice != null) params.set("maxPrice", String(query.maxPrice));
  if (query?.trending != null) params.set("trending", String(query.trending));
  if (query?.keyword) params.set("keyword", query.keyword);

  const endpoint = useFilterEndpoint ? "/products/filter" : "/products";
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const data = await apiRequest<any[]>(`${endpoint}${suffix}`);
  return (data || []).map(mapProduct).filter((item) => item.isActive !== false);
};

const getSearchCatalog = async () => {
  const isFresh = cachedSearchCatalogPromise && Date.now() - cachedSearchCatalogAt < SEARCH_CATALOG_TTL_MS;
  if (isFresh && cachedSearchCatalogPromise) {
    return cachedSearchCatalogPromise;
  }

  cachedSearchCatalogAt = Date.now();
  cachedSearchCatalogPromise = fetchProducts().catch((error) => {
    cachedSearchCatalogPromise = null;
    cachedSearchCatalogAt = 0;
    throw error;
  });

  return cachedSearchCatalogPromise;
};

export const getProducts = async (query?: {
  storeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  trending?: boolean;
  keyword?: string;
}) => {
  const products = await fetchProducts(query);

  if (!query?.keyword) {
    return products;
  }

  const rankedProducts = rankProductsForSearch(products, query.keyword);
  const initialResults = rankedProducts.length > 0 ? rankedProducts : products;

  if (initialResults.length >= 8) {
    return initialResults;
  }

  const fallbackPool = await fetchProducts({
    storeId: query.storeId,
    categoryId: query.categoryId,
    subCategoryId: query.subCategoryId,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    trending: query.trending,
  });

  const fallbackMatches = rankProductsForSearch(fallbackPool, query.keyword);
  return mergeRankedProducts(initialResults, fallbackMatches);
};

export const getTrendingProducts = async () => {
  const data = await apiRequest<any[]>("/products/trending");
  return (data || []).map(mapProduct);
};

export const getBestSellerProducts = async () => {
  const data = await apiRequest<any[]>("/products/bestseller");
  return (data || []).map(mapProduct);
};

export const getProductSuggestions = async (keyword: string) => {
  const query = keyword.trim();
  if (!query) return [] as ProductSuggestion[];

  const directSuggestions = await apiRequest<any[]>(
    `/products/suggestions?q=${encodeURIComponent(query)}&limit=8`,
  )
    .then((data) => (data || []).map((item) => mapProductToSuggestion(mapProduct(item))))
    .catch(() => [] as ProductSuggestion[]);

  if (directSuggestions.length >= 8) {
    return directSuggestions;
  }

  const searchCatalog = await getSearchCatalog().catch(() => [] as Product[]);
  const smartSuggestions = rankProductsForSearch(searchCatalog, query, 8).map(mapProductToSuggestion);
  return mergeSuggestions(directSuggestions, smartSuggestions, 8);
};

export const getProductById = async (productId: number) => {
  const data = await apiRequest<any>(`/products/${productId}`);
  return mapProduct(data);
};

export const getCheckoutSettings = async () => {
  const data = await apiRequest<{ settings?: any }>("/checkout-settings");
  const settings = data?.settings || {};
  return {
    id: settings?.id != null ? Number(settings.id) : undefined,
    deliveryCharge: Number(settings?.deliveryCharge || 0),
    platformFee: Number(settings?.platformFee || 0),
    handlingCharge: Number(settings?.handlingCharge || 0),
    smallCartFee: Number(settings?.smallCartFee || 0),
    smallCartThreshold: Number(settings?.smallCartThreshold || 0),
    onlinePaymentEnabled: Boolean(settings?.onlinePaymentEnabled),
    cashOnDeliveryEnabled: settings?.cashOnDeliveryEnabled !== false,
    updatedAt: settings?.updatedAt,
  } satisfies CheckoutSettings;
};

export const getActiveCoupons = async () => {
  const data = await apiRequest<any[]>("/coupons/active");
  return (data || []).map(mapCoupon).filter((coupon) => coupon.isActive !== false);
};

export const getActiveFreeItemOffers = async () => {
  const data = await apiRequest<any[]>("/free-item-offers/active");
  return (data || []).map(mapFreeItemOffer).filter((offer) => offer.active !== false);
};

export const applyCoupon = async (payload: { code: string; customerId: number; cartValue: number }) => {
  const params = new URLSearchParams({
    code: payload.code.trim().toUpperCase(),
    customerId: String(payload.customerId),
    cartValue: String(payload.cartValue),
  });

  const data = await apiRequest<any>(`/coupons/apply?${params.toString()}`, {
    auth: true,
  });

  return {
    success: data?.success !== false,
    code: data?.code || payload.code.trim().toUpperCase(),
    discount: Number(data?.discount || 0),
    finalValue: Number(data?.finalValue || 0),
  } satisfies AppliedCoupon;
};

export const getWishlist = async () => {
  const data = await apiRequest<any[]>("/customer/products/wishlist", { auth: true });
  return (data || []).map(mapProduct);
};

export const addToWishlist = async (productId: number) => {
  await apiRequest<{ success: boolean }>("/customer/products/wishlist", {
    method: "POST",
    body: { productId },
    auth: true,
  });
};

export const removeFromWishlist = async (productId: number) => {
  await apiRequest<{ success: boolean }>(`/customer/products/wishlist?productId=${productId}`, {
    method: "DELETE",
    auth: true,
  });
};

export const getPolicy = async (type: string) => {
  const data = await apiRequest<{ policy?: any }>(`/policies/${type}`);
  return {
    id: data?.policy?.id != null ? Number(data.policy.id) : undefined,
    type: data?.policy?.type || type,
    content: data?.policy?.content || "",
    updatedAt: data?.policy?.updatedAt,
  } satisfies PolicyContent;
};

export const checkPhoneExists = async (phone: string) => {
  const data = await apiRequest<{ exists?: boolean }>(
    `/auth/website/check-phone/${encodeURIComponent(phone)}`,
  );
  return Boolean(data?.exists);
};

export const loginWithFirebaseToken = async (firebaseIdToken: string) => {
  const data = await apiRequest<any>("/auth/website/login", {
    method: "POST",
    body: {
      firebaseIdToken,
    },
  });

  return mapSession(data);
};

export const signupWithFirebaseToken = async (firebaseIdToken: string, name: string, email?: string) => {
  const data = await apiRequest<any>("/auth/website/signup", {
    method: "POST",
    body: {
      firebaseIdToken,
      name,
      email,
    },
  });

  return mapSession(data);
};

export const logoutCustomerSession = async (refreshToken?: string) => {
  if (!refreshToken) return;
  try {
    await apiRequest("/auth/website/logout", {
      method: "POST",
      body: {
        refreshToken,
      },
    });
  } catch {
    // Swallow logout network errors.
  }
};

export const getCustomerProfile = async () => {
  const data = await apiRequest<any>("/customer/profile", {
    auth: true,
  });
  return {
    id: Number(data?.id),
    name: data?.name || "",
    phoneNumber: data?.phoneNumber || "",
    email: data?.email || "",
    walletBalance: data?.walletBalance != null ? Number(data.walletBalance) : undefined,
    isActive: data?.isActive !== false,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  } satisfies CustomerProfile;
};

export const updateCustomerProfile = async (payload: { name?: string; email?: string }) => {
  const data = await apiRequest<any>("/customer/profile", {
    auth: true,
    method: "PUT",
    body: payload,
  });
  return {
    id: Number(data?.id),
    name: data?.name || "",
    phoneNumber: data?.phoneNumber || "",
    email: data?.email || "",
    walletBalance: data?.walletBalance != null ? Number(data.walletBalance) : undefined,
    isActive: data?.isActive !== false,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  } satisfies CustomerProfile;
};

export const getAddresses = async () => {
  const data = await apiRequest<any[]>("/addresses", {
    auth: true,
  });
  return (data || []).map(mapAddress);
};

export const saveAddress = async (payload: AddressPayload, addressId?: number) => {
  const path = addressId != null ? `/addresses/${addressId}` : "/addresses";
  const method = addressId != null ? "PUT" : "POST";
  const data = await apiRequest<any>(path, {
    auth: true,
    method,
    body: payload,
  });

  return mapAddress({
    ...payload,
    ...data,
    latitude: data?.latitude ?? payload.latitude,
    longitude: data?.longitude ?? payload.longitude,
  });
};

export const deleteAddress = async (addressId: number) => {
  await apiRequest(`/addresses/${addressId}`, {
    auth: true,
    method: "DELETE",
  });
};

export const syncCartToServer = async (items: Array<{ variantId: number; quantity: number }>) => {
  if (!items.length) {
    return {
      items: [],
      subtotal: 0,
      deliveryCharge: 0,
      platformFee: 0,
      grandTotal: 0,
    } satisfies ServerCart;
  }

  try {
    await apiRequest("/cart", {
      auth: true,
      method: "DELETE",
    });
  } catch {
    // Ignore stale cart clear failures.
  }

  const data = await apiRequest<any>("/cart/merge", {
    auth: true,
    method: "POST",
    body: items.map((item) => ({
      variantId: Number(item.variantId),
      quantity: Number(item.quantity),
    })),
  });

  return {
    cartId: data?.cartId != null ? Number(data.cartId) : undefined,
    items: (data?.items || []).map((item: any) => ({
      id: item?.id != null ? Number(item.id) : undefined,
      variantId: Number(item?.variantId),
      variantName: item?.variantName || "",
      productId: Number(item?.productId),
      productName: item?.productName || "",
      productImage: normalizeMediaUrl(item?.productImage) || "",
      quantity: Number(item?.quantity || 0),
      unitPrice: Number(item?.unitPrice || 0),
      totalPrice: Number(item?.totalPrice || 0),
      freeItem: Boolean(item?.freeItem),
      offerName: item?.offerName || "",
    })),
    freeItems: (data?.freeItems || []).map((item: any) => ({
      variantId: Number(item?.variantId),
      variantName: item?.variantName || "",
      productId: Number(item?.productId),
      productName: item?.productName || "",
      productImage: normalizeMediaUrl(item?.productImage) || "",
      quantity: Number(item?.quantity || 0),
      unitPrice: Number(item?.unitPrice || 0),
      totalPrice: Number(item?.totalPrice || 0),
      freeItem: Boolean(item?.freeItem),
      offerName: item?.offerName || "",
    })),
    subtotal: Number(data?.subtotal || 0),
    estimatedDeliveryCharge: Number(data?.estimatedDeliveryCharge || 0),
    deliveryCharge: Number(data?.deliveryCharge || 0),
    platformFee: Number(data?.platformFee || 0),
    grandTotal: Number(data?.grandTotal || 0),
  } satisfies ServerCart;
};

export const placeOrder = async (payload: {
  addressId: number;
  paymentMethod: PaymentMethod;
  walletAmount?: number;
  couponCode?: string;
}) => {
  const data = await apiRequest<any>("/orders", {
    auth: true,
    method: "POST",
    body: {
      addressId: Number(payload.addressId),
      paymentMethod: payload.paymentMethod,
      walletAmount: payload.walletAmount,
      couponCode: payload.couponCode,
    },
  });

  return mapPlacedOrder(data, payload.paymentMethod);
};

export const getOrders = async () => {
  const data = await apiRequest<any[]>("/orders", {
    auth: true,
  });

  return (data || []).map((order) => mapPlacedOrder(order));
};

export const getOrderById = async (orderId: number) => {
  const data = await apiRequest<any>(`/orders/${orderId}`, {
    auth: true,
  });

  return mapPlacedOrder(data);
};

export const getOrderTracking = async (orderNumber: string) => {
  const data = await apiRequest<any>(`/tracking/${encodeURIComponent(orderNumber)}`, {
    auth: true,
  });

  return mapTrackingResponse(data);
};

export const initiateOnlinePayment = async (orderId: number) => {
  return apiRequest<{
    cfOrderId: string;
    paymentSessionId: string;
    amountInPaise: number;
    currency: string;
    receipt: string;
    environment: string;
  }>("/payment/initiate", {
    auth: true,
    method: "POST",
    body: {
      orderId,
    },
  });
};

export const verifyOnlinePayment = async (payload: {
  cfOrderId: string;
  receipt: string;
}) => {
  return apiRequest<{ success: boolean; message?: string }>("/payment/verify", {
    auth: true,
    method: "POST",
    body: payload,
  });
};

export const requestRefund = async (payload: { orderId: number; amount?: number; reason?: string }) => {
  return apiRequest<{
    refundStatus?: string;
    refundId?: string;
    refundAmount?: number;
    refundReason?: string;
    message?: string;
  }>("/payment/refund/request", {
    auth: true,
    method: "POST",
    body: payload,
  });
};

export const getWalletBalance = async (customerId: number) => {
  const data = await apiRequest<{ success?: boolean; balance?: number | string }>(`/wallet/balance/${customerId}`, {
    auth: true,
  });
  return Number(data?.balance || 0);
};

export const getWalletHistory = async (customerId: number) => {
  const data = await apiRequest<{ success?: boolean; history?: any[] }>(`/wallet/history/${customerId}`, {
    auth: true,
  });
  return (data?.history || []).map((item) => ({
    id: item?.id != null ? Number(item.id) : undefined,
    amount: Number(item?.amount || 0),
    type: item?.type || item?.transactionType || "",
    description: item?.description || "",
    createdAt: item?.createdAt,
  }));
};

export const submitDeliveryRating = async (orderNumber: string, payload: { rating: number; feedback?: string }) => {
  return apiRequest<{ success?: boolean; message?: string }>(`/orders/${encodeURIComponent(orderNumber)}/rate`, {
    auth: true,
    method: "POST",
    body: payload,
  });
};

export const getDeliveryRatingStatus = async (orderNumber: string) => {
  return apiRequest<{
    orderNumber?: string;
    delivered?: boolean;
    alreadyRated?: boolean;
    rating?: number;
    feedback?: string;
    canRate?: boolean;
  }>(`/orders/${encodeURIComponent(orderNumber)}/rating`, {
    auth: true,
  });
};

export const submitProductRating = async (payload: { productId: number; rating: number; comment?: string }) => {
  return apiRequest<{ success?: boolean; message?: string }>("/customer/products/rating", {
    auth: true,
    method: "POST",
    body: payload,
  });
};

export const getProductRatings = async (productId: number) => {
  const data = await apiRequest<{ success?: boolean; ratings?: any[] }>(`/customer/products/${productId}/ratings`);
  return (data?.ratings || []).map((item) => ({
    id: item?.id != null ? Number(item.id) : undefined,
    rating: Number(item?.rating || 0),
    comment: item?.comment || "",
    createdAt: item?.createdAt,
    customerName: item?.customer?.name || item?.customerName || "Customer",
  }));
};
