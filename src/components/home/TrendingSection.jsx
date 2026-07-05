import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrendingProducts } from "../../redux/productSlice";
import { toggleWishlist, selectIsWishlisted } from "../../redux/wishlistSlice";
import { getCategoryName } from "../../utils/category";
import { ShoppingBagIcon, HeartIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid, HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import QuickAddModal from "../QuickAddModal";

const formatPrice = (price) => {
  if (typeof price === "string") return price.startsWith("৳") ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString("en-IN")}`;
};

const TABS = ["All", "Tees", "Bottoms"];

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full rounded-md bg-gray-100 mb-4" />
      <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
  );
}

function TrendingCard({ product, onQuickAdd }) {
  const dispatch = useDispatch();
  const isWishlisted = useSelector(selectIsWishlisted(product.id));

  const imageFront = product.images?.[0] ?? "";
  const imageBack = product.images?.[1] ?? imageFront;

  return (
    <div className="group relative">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 mb-4">
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={imageFront}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-0"
          />
          <img
            src={imageBack}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </Link>

        {product.badge && (
          <div className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-none pointer-events-none
            ${product.badge === "Low Stock" ? "bg-red-600 animate-pulse" : "bg-gray-900"}`}>
            {product.badge}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => dispatch(toggleWishlist(product))}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-none transition-all translate-y-2 group-hover:translate-y-0 ${
            isWishlisted
              ? "opacity-100 text-red-600"
              : "opacity-0 group-hover:opacity-100 text-gray-900 hover:text-red-600"
          }`}
        >
          {isWishlisted
            ? <HeartSolid className="h-5 w-5 text-red-600" />
            : <HeartIcon className="h-5 w-5" />
          }
        </button>

        {/* Quick Add */}
        <button
          onClick={() => onQuickAdd(product)}
          className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 font-bold uppercase text-xs py-3 tracking-widest opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gray-900 hover:text-white shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <ShoppingBagIcon className="h-4 w-4" /> Quick Add
          </div>
        </button>
      </div>

      {/* Product Info */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-1 capitalize">{getCategoryName(product.category)}</p>
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-tight leading-tight group-hover:text-orange-600 transition-colors">
              <Link to={`/product/${product.id}`}>{product.name}</Link>
            </h3>
          </div>
          <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
        </div>

        <div className="flex items-center mt-2 space-x-1">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-200"}`}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">({product.numReviews})</span>
        </div>
      </div>
    </div>
  );
}

export default function TrendingSection() {
  const dispatch = useDispatch();
  const { trending, trendingStatus } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState("All");
  const [quickAddProduct, setQuickAddProduct] = useState(null);

  useEffect(() => {
    if (trendingStatus === "idle") {
      dispatch(fetchTrendingProducts());
    }
  }, [dispatch, trendingStatus]);

  const filtered =
    activeTab === "All"
      ? trending
      : trending.filter((p) => {
          const categoryName = getCategoryName(p.category);
          return categoryName.toLowerCase().includes(activeTab.toLowerCase());
        });

  const isLoading = trendingStatus === "loading" || trendingStatus === "idle";

  return (
    <>
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-widest text-xs mb-2 block">
              Customer Favorites
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
              Trending Now
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-6 mt-6 md:mt-0 border-b border-gray-200 pb-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-bold uppercase tracking-widest pb-2 -mb-2.5 transition-colors ${
                  activeTab === tab
                    ? "text-gray-900 border-b-2 border-gray-900"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
            ? (
                <p className="col-span-4 text-center text-sm text-gray-400 uppercase tracking-widest font-bold py-12">
                  No products found
                </p>
              )
            : filtered.map((product) => (
                <TrendingCard
                  key={product.id}
                  product={product}
                  onQuickAdd={setQuickAddProduct}
                />
              ))}
        </div>

        {/* View All */}
        <div className="mt-16 text-center">
          <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 font-bold text-gray-900 border-2 border-gray-900 uppercase tracking-widest transition-all hover:bg-gray-900 hover:text-white">
            View All Products
          </Link>
        </div>

      </div>
    </section>

    {quickAddProduct && (
      <QuickAddModal
        product={quickAddProduct}
        onClose={() => setQuickAddProduct(null)}
      />
    )}
    </>
  );
}
