import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { formatPrice } from '../utils/format'
import { productService } from '../api/services'

const BRANDS = ['Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'Apple']
const RAMS = ['4GB', '8GB', '16GB', '32GB']
const STORAGES = ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '1TB HDD']
const PROCESSORS = ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'Intel Xeon', 'AMD Ryzen 5', 'AMD Ryzen 7']
const CONDITIONS = ['Like New', 'Excellent', 'Good']
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
]

export default function ProductListingPage() {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || ''
  const searchParam = searchParams.get('search') || ''

  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedRAMs, setSelectedRAMs] = useState<string[]>([])
  const [selectedStorages, setSelectedStorages] = useState<string[]>([])
  const [selectedProcessors, setSelectedProcessors] = useState<string[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000])
  const [sortBy, setSortBy] = useState('relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const ITEMS_PER_PAGE = 9

  useEffect(() => {
    setLoading(true)
    productService.getAll({ category: categoryParam || undefined, search: searchParam || undefined, size: 100 })
      .then(data => setAllProducts(data ?? []))
      .finally(() => setLoading(false))
  }, [categoryParam, searchParam])

  const toggleFilter = <T,>(arr: T[], setArr: (v: T[]) => void, val: T) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
    setCurrentPage(1)
  }

  const filteredProducts = useMemo(() => {
    let products = [...allProducts]

    if (categoryParam) products = products.filter((p) => p.category === categoryParam)
    if (searchParam) products = products.filter((p) =>
      p.name.toLowerCase().includes(searchParam.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchParam.toLowerCase())
    )
    if (selectedBrands.length) products = products.filter((p) => selectedBrands.includes(p.brand))
    if (selectedRAMs.length) products = products.filter((p) => selectedRAMs.includes(p.ram))
    if (selectedStorages.length) products = products.filter((p) => selectedStorages.includes(p.storage))
    if (selectedProcessors.length) products = products.filter((p) =>
      selectedProcessors.some((proc) => p.processor.includes(proc))
    )
    if (selectedConditions.length) products = products.filter((p) => selectedConditions.includes(p.condition))
    products = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    switch (sortBy) {
      case 'price_asc': products.sort((a, b) => a.price - b.price); break
      case 'price_desc': products.sort((a, b) => b.price - a.price); break
      case 'rating': products.sort((a, b) => b.rating - a.rating); break
    }

    return products
  }, [categoryParam, searchParam, selectedBrands, selectedRAMs, selectedStorages, selectedProcessors, selectedConditions, priceRange, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const clearAllFilters = () => {
    setSelectedBrands([])
    setSelectedRAMs([])
    setSelectedStorages([])
    setSelectedProcessors([])
    setSelectedConditions([])
    setPriceRange([0, 100000])
    setCurrentPage(1)
  }

  const hasFilters = selectedBrands.length || selectedRAMs.length || selectedStorages.length ||
    selectedProcessors.length || selectedConditions.length || priceRange[0] > 0 || priceRange[1] < 100000

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
    const [open, setOpen] = useState(true)
    return (
      <div className="border-b border-gray-100 pb-4 mb-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full mb-3"
        >
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && children}
      </div>
    )
  }

  const Sidebar = () => (
    <div className="space-y-0">
      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="px-1">
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={priceRange[1]}
            onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value)]); setCurrentPage(1) }}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        {['Laptops', 'Desktops', 'Accessories', 'Monitors'].map((cat) => (
          <label key={cat} className="flex items-center gap-2 cursor-pointer py-1 hover:text-green-600">
            <input type="checkbox" className="accent-green-500" checked={categoryParam === cat} readOnly />
            <span className="text-sm text-gray-700">{cat}</span>
          </label>
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        {BRANDS.map((brand) => (
          <label key={brand} className="flex items-center gap-2 cursor-pointer py-1 hover:text-green-600">
            <input
              type="checkbox"
              className="accent-green-500"
              checked={selectedBrands.includes(brand)}
              onChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
            />
            <span className="text-sm text-gray-700">{brand}</span>
          </label>
        ))}
      </FilterSection>

      {/* RAM */}
      <FilterSection title="RAM">
        {RAMS.map((ram) => (
          <label key={ram} className="flex items-center gap-2 cursor-pointer py-1 hover:text-green-600">
            <input
              type="checkbox"
              className="accent-green-500"
              checked={selectedRAMs.includes(ram)}
              onChange={() => toggleFilter(selectedRAMs, setSelectedRAMs, ram)}
            />
            <span className="text-sm text-gray-700">{ram}</span>
          </label>
        ))}
      </FilterSection>

      {/* Storage */}
      <FilterSection title="Storage">
        {STORAGES.map((st) => (
          <label key={st} className="flex items-center gap-2 cursor-pointer py-1 hover:text-green-600">
            <input
              type="checkbox"
              className="accent-green-500"
              checked={selectedStorages.includes(st)}
              onChange={() => toggleFilter(selectedStorages, setSelectedStorages, st)}
            />
            <span className="text-sm text-gray-700">{st}</span>
          </label>
        ))}
      </FilterSection>

      {/* Processor */}
      <FilterSection title="Processor">
        {PROCESSORS.map((proc) => (
          <label key={proc} className="flex items-center gap-2 cursor-pointer py-1 hover:text-green-600">
            <input
              type="checkbox"
              className="accent-green-500"
              checked={selectedProcessors.includes(proc)}
              onChange={() => toggleFilter(selectedProcessors, setSelectedProcessors, proc)}
            />
            <span className="text-sm text-gray-700">{proc}</span>
          </label>
        ))}
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        {CONDITIONS.map((cond) => (
          <label key={cond} className="flex items-center gap-2 cursor-pointer py-1 hover:text-green-600">
            <input
              type="checkbox"
              className="accent-green-500"
              checked={selectedConditions.includes(cond)}
              onChange={() => toggleFilter(selectedConditions, setSelectedConditions, cond)}
            />
            <span className="text-sm text-gray-700">{cond}</span>
          </label>
        ))}
      </FilterSection>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-green-600">Home</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{categoryParam || (searchParam ? `Search: "${searchParam}"` : 'All Products')}</span>
      </nav>

      <div className="flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Filters</h2>
              {hasFilters ? (
                <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
                  Clear All
                </button>
              ) : null}
            </div>
            <Sidebar />
          </div>
        </aside>

        {/* Products area */}
        <div className="flex-1 min-w-0">
          {/* Controls row */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:border-green-400 transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <p className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> results
                {categoryParam && <> in <span className="text-green-600 font-medium">{categoryParam}</span></>}
              </p>
            </div>

            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 outline-none focus:border-green-400 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedBrands.map((b) => (
                <span key={b} className="flex items-center gap-1 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-200">
                  {b}
                  <button onClick={() => toggleFilter(selectedBrands, setSelectedBrands, b)}><X size={12} /></button>
                </span>
              ))}
              {selectedRAMs.map((r) => (
                <span key={r} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                  {r}
                  <button onClick={() => toggleFilter(selectedRAMs, setSelectedRAMs, r)}><X size={12} /></button>
                </span>
              ))}
              {selectedConditions.map((c) => (
                <span key={c} className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                  {c}
                  <button onClick={() => toggleFilter(selectedConditions, setSelectedConditions, c)}><X size={12} /></button>
                </span>
              ))}
            </div>
          ) : null}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🔍</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {hasFilters ? 'Try adjusting or clearing your filters' : 'No products available yet'}
              </p>
              {hasFilters && (
                <button onClick={clearAllFilters} className="bg-green-500 text-black font-bold px-6 py-3 rounded-xl text-sm">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-green-400 transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-green-500 text-white'
                      : 'border border-gray-200 text-gray-700 hover:border-green-400'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:border-green-400 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <button onClick={clearAllFilters} className="text-xs text-red-500 font-medium">
                    Clear All
                  </button>
                )}
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <Sidebar />
            </div>
            <div className="p-4 sticky bottom-0 bg-white border-t border-gray-100">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-green-500 text-black font-bold py-3 rounded-xl text-sm"
              >
                Apply Filters ({filteredProducts.length} results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
