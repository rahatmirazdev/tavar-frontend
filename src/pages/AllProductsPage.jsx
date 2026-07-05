import { ShoppingBagIcon, HeartIcon, AdjustmentsHorizontalIcon, XMarkIcon, StarIcon, SparklesIcon, TruckIcon, ShieldCheckIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchCategories } from "../redux/productSlice";
import { toggleWishlist, selectIsWishlisted } from "../redux/wishlistSlice";
import { getCategoryName } from "../utils/category";
import QuickAddModal from "../components/QuickAddModal";
import { searchProducts } from "../services/productService";

// Map URL sort values to backend sort keys
const SORT_TO_BACKEND = {
  "price-low": "priceLow",
  "price-high": "priceHigh",
  "rating": "rating",
  "newest": "newest",
};

const formatPrice = (price) => {
  if (typeof price === "string") return price.startsWith("৳") ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString("en-IN")}`;
};

const parsePrice = (price) => {
  if (typeof price === "number") return price;
  return parseInt(String(price).replace(/[^\d.-]/g, "")) || 0;
};

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full rounded-none bg-gradient-to-br from-gray-100 to-gray-200 mb-4 shadow-sm" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded-none w-1/3" />
        <div className="h-4 bg-gray-100 rounded-none w-3/4" />
        <div className="h-3 bg-gray-100 rounded-none w-1/2" />
      </div>
    </div>
  );
}

// Star Rating Component
function StarRating({ rating, numReviews }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            {i < fullStars ? (
              <StarSolid className="h-3.5 w-3.5 text-amber-400" />
            ) : i === fullStars && hasHalfStar ? (
              <div className="relative w-3.5 h-3.5">
                <StarIcon className="h-3.5 w-3.5 text-gray-300" />
                <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                  <StarSolid className="h-3.5 w-3.5 text-amber-400" />
                </div>
              </div>
            ) : (
              <StarIcon className="h-3.5 w-3.5 text-gray-300" />
            )}
          </div>
        ))}
      </div>
      {numReviews > 0 && (
        <span className="text-xs text-gray-500">({numReviews})</span>
      )}
    </div>
  );
}

function ProductCard({ product, onQuickAdd }) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product.id));

  const stockStatus = product.stock > 20 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock';
  const stockColor = product.stock > 20 ? 'text-green-600 bg-green-50' : product.stock > 0 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';

  return (
    <div className="group h-full flex flex-col">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none bg-gray-100 mb-4 shadow-md hover:shadow-xl transition-shadow duration-300">
          <img
            src={product.images?.[0]}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white rounded-none bg-gradient-to-r from-gray-900 to-gray-800 shadow-md flex items-center gap-1">
              <SparklesIcon className="h-3 w-3" />
              {product.badge}
            </div>
          )}

          {/* Stock Status Badge */}
          <div className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-none ${stockColor} shadow-md`}>
            {stockStatus}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dispatch(toggleWishlist(product));
            }}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute bottom-4 right-4 p-2.5 bg-white rounded-none shadow-lg transition-all duration-300 hover:scale-110 ${
              isWishlisted
                ? 'text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            {isWishlisted
              ? <HeartSolid className="h-5 w-5" />
              : <HeartIcon className="h-5 w-5" />
            }
          </button>

          {/* Quick Add Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickAdd(product);
            }}
            className="absolute bottom-4 left-4 right-12 bg-black text-white font-bold uppercase text-xs py-2.5 tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-800 shadow-lg rounded-none flex items-center justify-center gap-2"
          >
            <ShoppingBagIcon className="h-4 w-4" /> Quick Add
          </button>

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-grow flex flex-col">
        <p className="text-xs text-gray-500 mb-2 capitalize font-semibold tracking-wider">
          {getCategoryName(product.category)}
        </p>
        
        <h3 className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-tight leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="mb-3">
            <StarRating rating={product.rating} numReviews={product.numReviews} />
          </div>
        )}

        {/* Price and CTA */}
        <div className="mt-auto flex items-end justify-between gap-2">
          <p className="text-lg md:text-xl font-black text-gray-900">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AllProductsPage() {
  const dispatch = useDispatch();
  const { items, itemsStatus, error, categories, categoriesStatus } = useSelector(
    (state) => state.products
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  // Extract URL params as primitives so useEffect deps are stable
  const urlCategory = searchParams.get("category") || "";
  const urlSort = searchParams.get("sort") || "";
  const urlSearch = searchParams.get("search") || "";

  // Local UI state
  const [sortBy, setSortBy] = useState(urlSort || "featured");
  const [searchTerm, setSearchTerm] = useState(urlSearch || "");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(
    urlCategory ? urlCategory.split(",") : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories once on mount
  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesStatus]);

  // Handle search with debounce
  useEffect(() => {
    if (!urlSearch) {
      setSearchResults(null);
      return;
    }

    const performSearch = async () => {
      try {
        setSearchLoading(true);
        const results = await searchProducts(urlSearch, { limit: 50, sort: 'relevance' });
        setSearchResults(results);
      } catch (err) {
        setSearchResults({ products: [], total: 0 });
      } finally {
        setSearchLoading(false);
      }
    };

    const timer = setTimeout(performSearch, 300); // Debounce 300ms
    return () => clearTimeout(timer);
  }, [urlSearch]);

  // Re-fetch products from backend whenever URL category or sort changes
  useEffect(() => {
    const params = {};
    if (urlCategory) params.category = urlCategory;
    if (urlSort && SORT_TO_BACKEND[urlSort]) params.sort = SORT_TO_BACKEND[urlSort];

    dispatch(fetchProducts(params));

    // Sync local UI state to URL
    setSelectedCategories(urlCategory ? urlCategory.split(",") : []);
    setSortBy(urlSort || "featured");
    // Reset subcategory selection when category changes
    setSelectedSubcategories([]);
  }, [dispatch, urlCategory, urlSort]);

  // Build the URL from current filter state
  const updateURL = (newCategories, newSort) => {
    const params = new URLSearchParams();
    if (newCategories.length > 0) params.set("category", newCategories.join(","));
    if (newSort && newSort !== "featured") params.set("sort", newSort);
    setSearchParams(params, { replace: true });
  };

  // Handle search input
  const handleSearch = (query) => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("search", query.trim());
    }
    setSearchParams(params, { replace: true });
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm("");
    const params = new URLSearchParams();
    setSearchParams(params, { replace: true });
    setSearchResults(null);
  };

  // When user toggles a category checkbox → update URL (which triggers the useEffect above)
  const toggleCategory = (category) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    updateURL(updated, sortBy);
  };

  const toggleSubcategory = (sub) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    updateURL(selectedCategories, sort);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubcategories([]);
    setPriceRange([0, 5000]);
    updateURL([], "featured");
  };

  // Subcategories to show in sidebar — only when exactly one category is selected
  // and that category has subcategories coming from the API
  const sidebarSubcategories = useMemo(() => {
    if (selectedCategories.length !== 1) return [];
    const match = categories.find(
      (c) => c.name.toLowerCase() === selectedCategories[0].toLowerCase()
    );
    return match?.subcategories || [];
  }, [categories, selectedCategories]);

  // Client-side filtering on top of backend results:
  //   backend already handles: category, sort, AND search (if search is active)
  //   frontend handles: subcategory, priceRange
  const filteredProducts = useMemo(() => {
    // If searching, use search results instead of all products
    const sourceProducts = searchResults ? searchResults.products : items;
    let results = [...sourceProducts];

    if (selectedSubcategories.length > 0) {
      results = results.filter((p) =>
        selectedSubcategories.some(
          (sub) => (p.subcategory || "").toLowerCase() === sub.toLowerCase()
        )
      );
    }

    results = results.filter((p) => {
      const price = parsePrice(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return results;
  }, [items, searchResults, selectedSubcategories, priceRange]);

  const pageTitle =
    urlSearch
      ? `Search: "${urlSearch}"`
      : selectedCategories.length > 0
      ? selectedCategories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(" & ")
      : "All Products";

  const isLoading = (urlSearch && searchLoading) || (!urlSearch && (itemsStatus === "idle" || itemsStatus === "loading"));

  return (
    <>
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div className="bg-white border-b border-gray-200 py-8 md:py-10 px-4 pt-24 md:pt-32">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 text-gray-900">
            {pageTitle}
          </h1>
          <p className="text-gray-600 text-base mb-5">
            {selectedCategories.length > 0
              ? "Discover our premium selection handpicked just for you"
              : "Explore our complete collection of premium clothing, accessories & more"}
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TruckIcon className="h-4 w-4" />
              <span>Free shipping on orders over ৳500</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>100% authentic products</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Error banner */}
        {itemsStatus === "failed" && (
          <div className="mb-8 px-4 py-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded">
            <p className="font-bold">Unable to load products</p>
            <p>{error || "Please refresh the page or try again later."}</p>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
              className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-none text-gray-900 font-medium focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            )}
            {urlSearch && searchLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-black rounded-full" />
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
            <div className="flex flex-wrap gap-2 items-center">
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-none text-sm font-semibold">
                  {cat}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 5000) && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-none text-sm font-semibold">
                  ৳{priceRange[0]} - ৳{priceRange[1]}
                  <button
                    onClick={() => setPriceRange([0, 5000])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-8 flex-col lg:flex-row">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all rounded-none shadow-md"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden lg:block"
            } fixed lg:relative inset-0 lg:inset-auto top-0 left-0 z-50 w-full lg:w-72 lg:flex-shrink-0 bg-white lg:bg-transparent overflow-y-auto lg:overflow-visible`}
          >
            <button
              onClick={() => setShowFilters(false)}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-none"
            >
              <XMarkIcon className="h-6 w-6 text-gray-900" />
            </button>

            <div className="p-6 lg:p-0 lg:bg-gray-50 lg:rounded-none lg:border lg:border-gray-200 lg:p-6">
              <div className="flex justify-between items-center mb-8 mt-12 lg:mt-0">
                <h3 className="text-lg font-black uppercase tracking-tight">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-600 hover:text-black font-bold uppercase tracking-widest transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-gray-900">Category</h4>
                {categoriesStatus === "loading" ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-5 bg-gray-100 rounded-none animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <label key={cat._id} className="flex items-center cursor-pointer gap-3 group">
                        <input
                          type="checkbox"
                          checked={selectedCategories.some(
                            (sc) => sc.toLowerCase() === cat.name.toLowerCase()
                          )}
                          onChange={() => toggleCategory(cat.name.toLowerCase())}
                          className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-black transition-colors cursor-pointer accent-black"
                        />
                        <span className="text-sm text-gray-700 capitalize font-medium">{cat.name}</span>
                        {cat.productCount !== undefined && (
                          <span className="ml-auto text-xs text-gray-400 font-semibold">({cat.productCount})</span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Subcategory Filter */}
              {sidebarSubcategories.length > 0 && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h4 className="font-bold uppercase tracking-widest text-xs mb-4 text-gray-900">Style</h4>
                  <div className="space-y-3">
                    {sidebarSubcategories.map((sub) => (
                      <label key={sub} className="flex items-center cursor-pointer gap-3 group">
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(sub)}
                          onChange={() => toggleSubcategory(sub)}
                          className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-black transition-colors cursor-pointer accent-black"
                        />
                        <span className="text-sm text-gray-700 font-medium">{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="mb-8">
                <h4 className="font-bold uppercase tracking-widest text-xs mb-5 text-gray-900">Price Range</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Min Price</label>
                      <span className="text-sm font-bold text-black">৳{priceRange[0]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val <= priceRange[1]) setPriceRange([val, priceRange[1]]);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Max Price</label>
                      <span className="text-sm font-bold text-black">৳{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= priceRange[0]) setPriceRange([priceRange[0], val]);
                      }}
                      className="w-full h-2 bg-gray-200 rounded-none appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                  className="lg:hidden w-full px-4 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all mt-6 rounded-none"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Overlay for mobile */}
          {showFilters && (
            <div
              onClick={() => setShowFilters(false)}
              className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
          )}

          {/* Main Content */}
          <div className="flex-1 w-full lg:w-auto">
            {/* Sort + Count bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-600 font-semibold">
                  <span className="font-black text-black">{filteredProducts.length}</span> product{filteredProducts.length !== 1 ? "s" : ""} found
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="flex-1 sm:flex-none px-4 py-2.5 border-2 border-gray-300 text-gray-900 font-bold text-sm rounded-none focus:outline-none focus:border-black focus:ring-2 focus:ring-black/20 transition-all"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-none mb-4">
                  <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-bold mb-2">
                  {urlSearch ? "No search results found" : "No products found"}
                </p>
                <p className="text-gray-500 mb-6">
                  {urlSearch 
                    ? `No products match "${urlSearch}". Try searching for something else.`
                    : "Try adjusting your filters or search term"}
                </p>
                <button
                  onClick={urlSearch ? handleClearSearch : clearFilters}
                  className="inline-block px-6 py-3 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-none hover:bg-gray-800 transition-all"
                >
                  {urlSearch ? "Clear Search" : "Clear Filters"}
                </button>
              </div>
            ) : (
              <>
                {/* Results Summary */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-semibold">
                    Showing <span className="text-black font-bold">{filteredProducts.length}</span> of{" "}
                    <span className="text-black font-bold">
                      {searchResults ? searchResults.total : items.length}
                    </span>{" "}
                    products
                    {urlSearch && ` for "${urlSearch}"`}
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickAdd={setQuickAddProduct}
                    />
                  ))}
                </div>
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>

    {quickAddProduct && (
      <QuickAddModal
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
      />
    )}
    </>
  );
}
