import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link, useSearchParams } from "react-router";
import { Filter, LoaderCircle, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { CategoryCard } from "./CategoryCard";
import { ProductCard } from "./ProductCard";
import { getCategoryHref, sortProducts } from "../lib/storefrontUtils";
import { getCategories, getCategoryById, getProducts, getSubcategories } from "../services/storefrontApi";
import type { Category, Product, ProductSort, SubCategory } from "../types/storefront";

interface CatalogExperienceProps {
  fixedCategoryId?: number;
  title?: string;
  subtitle?: string;
}

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "relevance", label: "Best match" },
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "discount", label: "Best discounts" },
  { value: "name", label: "Alphabetical" },
  { value: "newest", label: "Newest picks" },
];

const numberFromParam = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

interface SearchParamsUpdater {
  [key: string]: string | null | undefined;
}

export function CatalogExperience({ fixedCategoryId, title, subtitle }: CatalogExperienceProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const activeCategoryId = fixedCategoryId ?? numberFromParam(searchParams.get("category"));
  const activeSubCategoryId = numberFromParam(searchParams.get("sub"));
  const keyword = searchParams.get("q") || "";
  const trending = searchParams.get("trending") === "1";
  const requestedSort = searchParams.get("sort") as ProductSort | null;
  const sortBy =
    requestedSort && (requestedSort !== "relevance" || Boolean(keyword))
      ? requestedSort
      : keyword
        ? "relevance"
        : "featured";
  const sortOptions = keyword ? SORT_OPTIONS : SORT_OPTIONS.filter((option) => option.value !== "relevance");

  const [draftQuery, setDraftQuery] = useState(keyword);

  useEffect(() => {
    setDraftQuery(keyword);
  }, [keyword]);

  useEffect(() => {
    if (!searchParams.has("min") && !searchParams.has("max")) return;

    const next = new URLSearchParams(searchParams);
    next.delete("min");
    next.delete("max");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const updateParams = (updates: SearchParamsUpdater) => {
    const next = new URLSearchParams(searchParams);
    next.delete("min");
    next.delete("max");
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    setSearchParams(next);
  };

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((nextCategories) => {
        if (!isMounted) return;
        setCategories(nextCategories);
      })
      .catch((loadError: any) => {
        if (!isMounted) return;
        setError(loadError?.message || "Unable to load filters right now.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!activeCategoryId) {
      setSubcategories([]);
      setCurrentCategory(null);
      return () => {
        isMounted = false;
      };
    }

    Promise.all([getCategoryById(activeCategoryId), getSubcategories(activeCategoryId)])
      .then(([category, nextSubcategories]) => {
        if (!isMounted) return;
        setCurrentCategory(category);
        setSubcategories(nextSubcategories);
      })
      .catch((loadError: any) => {
        if (!isMounted) return;
        setError(loadError?.message || "Unable to load category details.");
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategoryId]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    getProducts({
      categoryId: activeCategoryId,
      subCategoryId: activeSubCategoryId,
      trending: trending || undefined,
      keyword: keyword || undefined,
    })
      .then((nextProducts) => {
        if (!isMounted) return;
        setProducts(nextProducts);
      })
      .catch((loadError: any) => {
        if (!isMounted) return;
        setError(loadError?.message || "Unable to load products.");
        setProducts([]);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategoryId, activeSubCategoryId, keyword, trending]);

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  const visibleTitle = title || currentCategory?.name || "Shop by category";
  const visibleSubtitle =
    subtitle ||
    (currentCategory?.description
      ? currentCategory.description
      : keyword
        ? `Showing smart results for "${keyword}" with typo correction and local grocery keywords.`
        : "Browse categories, refine with subcategories, and compare products on one clean page.");

  const appliedFilters = useMemo(() => {
    const labels: string[] = [];
    if (currentCategory?.name) labels.push(currentCategory.name);
    if (keyword) labels.push(`Search: ${keyword}`);
    if (activeSubCategoryId) {
      const match = subcategories.find((subcategory) => subcategory.id === activeSubCategoryId);
      if (match) labels.push(match.name);
    }
    if (trending) labels.push("Trending");
    return labels;
  }, [activeSubCategoryId, currentCategory?.name, keyword, subcategories, trending]);

  const shouldShowCategoryGrid = !activeCategoryId && !keyword && !activeSubCategoryId && !trending;

  return (
    <div className="app-shell pb-16">
      <div className="flex w-full items-start gap-1 sm:gap-6">
        <aside className="w-[65px] sm:w-[80px] md:w-[20%] xl:w-[290px] shrink-0 sticky top-[72px] lg:top-28 self-start max-h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
          <section className="flex flex-col gap-1 sm:gap-4 xl:rounded-[2.2rem] xl:border xl:border-white/50 xl:bg-white/70 xl:backdrop-blur-xl xl:p-6 xl:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:bg-white/5 dark:border-white/10 pt-2 xl:pt-6">
            <div className="hidden xl:flex mb-4 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#edf4e3] text-[#24452b]">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#7a8d7b]">Filters</div>
                <div className="text-sm font-semibold text-[#18331f]">Refine your shop</div>
              </div>
            </div>

            {!fixedCategoryId ? (
              <div>
                <div className="mb-2 hidden xl:block text-sm font-semibold text-[#1b361f]">Categories</div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => updateParams({ category: null })}
                    className={`flex flex-col items-center justify-center w-full rounded-xl p-1 pt-2 sm:p-3 text-center transition ${
                      !activeCategoryId ? "bg-[#17381f] text-white shadow-md" : "bg-transparent text-[#284d30] hover:bg-[#eef4e4]"
                    }`}
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/5 mb-1 shrink-0">
                      <Sparkles className="h-5 w-5 opacity-70" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">All</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => updateParams({ category: String(category.id), sub: null })}
                      className={`flex flex-col items-center justify-center w-full rounded-xl p-1 pt-2 sm:p-3 text-center transition ${
                        activeCategoryId === category.id
                          ? "bg-[#17381f] text-white shadow-md"
                          : "bg-transparent text-[#284d30] hover:bg-[#eef4e4]"
                      }`}
                    >
                      <img src={category.imageUrl} alt={category.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover mb-1 shrink-0 bg-white" />
                      <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {currentCategory ? (
                  <div className="hidden xl:block rounded-[1.6rem] border border-[#d9e4d0] bg-[#f8fbf5] p-4 mb-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-[#7a8b7b]">Current category</div>
                    <div className="mt-2 font-['Fraunces'] text-2xl text-[#17311d]">{currentCategory.name}</div>
                  </div>
                ) : null}

                {subcategories.length > 0 ? (
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => updateParams({ sub: null })}
                      className={`flex flex-col items-center justify-center w-full rounded-xl p-1 pt-2 sm:p-3 text-center transition ${
                        !activeSubCategoryId ? "bg-[#17381f] text-white shadow-md" : "bg-transparent text-[#284d30] hover:bg-[#eef4e4]"
                      }`}
                    >
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-black/5 mb-1 shrink-0">
                        <Sparkles className="h-5 w-5 opacity-70" />
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">All</span>
                    </button>
                    {subcategories.map((subcategory) => (
                      <button
                        type="button"
                        key={subcategory.id}
                        onClick={() => updateParams({ sub: String(subcategory.id) })}
                        className={`flex flex-col items-center justify-center w-full rounded-xl p-1 pt-2 sm:p-3 text-center transition ${
                          activeSubCategoryId === subcategory.id
                            ? "bg-[#17381f] text-white shadow-md"
                            : "bg-transparent text-[#284d30] hover:bg-[#eef4e4]"
                        }`}
                      >
                        <img src={subcategory.imageUrl} alt={subcategory.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover mb-1 shrink-0 bg-white" />
                        <span className="text-[10px] sm:text-[11px] font-semibold leading-tight">{subcategory.name}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </section>
        </aside>

        <section className="min-w-0 flex-1">
          <section className="rounded-2xl sm:rounded-[2.5rem] border border-white/40 bg-white/60 backdrop-blur-3xl p-3 sm:p-8 shadow-[0_20px_55px_rgba(0,0,0,0.06)] dark:bg-black/40 dark:border-white/10">
            <div className="mb-4 sm:mb-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="section-title">
                    {activeCategoryId ? "Category products" : keyword ? "Search matches" : "All products"}
                  </h2>
                  <p className="mt-1 text-sm text-[#627562]">
                    {sortedProducts.length} result{sortedProducts.length === 1 ? "" : "s"} ready to explore.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#708371]">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(event) => updateParams({ sort: event.target.value })}
                    className="rounded-xl border border-[#d6e2ce] bg-[#fdfefb] px-3 py-2 text-sm font-semibold text-[#17311d] outline-none shadow-sm"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {appliedFilters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {appliedFilters.map((filter) => (
                    <span
                      key={filter}
                      className="rounded-full bg-[#eef4e4] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#274a2d]"
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {isLoading ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-[1.8rem] border border-[#dbe4d2] bg-white/70 text-[#406144]">
                <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
                Loading products...
              </div>
            ) : error ? (
              <div className="rounded-[1.8rem] border border-[#ebc9c3] bg-[#fff5f2] px-5 py-4 text-sm text-[#a55749]">
                {error}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="rounded-[1.8rem] border border-dashed border-[#d9e3cf] bg-[#f9faf6] px-6 py-14 text-center">
                <h3 className="font-['Fraunces'] text-2xl text-[#18311d]">No products match these filters</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#677a68]">
                  Try broader terms, small spelling changes, or grocery names like rice, biyyam, milk, or paalu.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </div>
  );
}
