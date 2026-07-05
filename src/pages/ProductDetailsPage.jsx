import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearSelectedProduct } from '../redux/productSlice';
import { addToCart, makeCartItemId } from '../redux/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../redux/wishlistSlice';
import { getCategoryName } from '../utils/category';
import { getProductReviews, submitReview, checkHasPurchased } from '../services/reviewService';
import { sanitizeHtml } from '../utils/sanitize';
import {
  ShoppingBagIcon,
  HeartIcon as HeartOutline,
  ArrowLeftIcon,
  MinusIcon,
  PlusIcon,
  CheckIcon,
  LockClosedIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/** Simple deterministic colour for a reviewer's avatar circle */
const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-600',
  'bg-teal-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600',
];
const avatarColor = (name = '') => {
  const code = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** 1–5 filled/hollow stars */
function Stars({ rating, size = 'h-4 w-4', emptyClass = 'text-gray-200' }) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarSolid
          key={n}
          className={`${size} ${n <= Math.round(rating) ? 'text-yellow-400' : emptyClass}`}
        />
      ))}
    </div>
  );
}

/** Interactive star picker used inside the review form */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          <StarSolid
            className={`h-7 w-7 transition-colors ${n <= display ? 'text-yellow-400' : 'text-gray-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

/** Rating distribution bars (1-star → 5-star) */
function RatingBars({ reviews }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count }) => (
        <div key={star} className="flex items-center gap-2 text-xs">
          <span className="w-3 text-right font-bold text-gray-500">{star}</span>
          <StarSolid className="h-3 w-3 text-yellow-400 flex-shrink-0" />
          <div className="flex-1 h-2 bg-gray-100 overflow-hidden rounded-none">
            <div
              className="h-full bg-yellow-400 rounded-none transition-all duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="w-4 text-gray-400 font-bold">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { selectedProduct: product, detailStatus, error } = useSelector(
    (state) => state.products
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const isWishlisted = useSelector(selectIsWishlisted(product?.id ?? null));

  // Product UI state
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize]   = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity]           = useState(1);
  const [added, setAdded]                 = useState(false);

  // Reviews state
  const [reviews, setReviews]               = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasPurchased, setHasPurchased]     = useState(false);
  const [reviewRating, setReviewRating]     = useState(5);
  const [reviewComment, setReviewComment]   = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError]       = useState('');
  const [reviewSuccess, setReviewSuccess]   = useState('');

  // Fetch product
  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSelectedProduct());
  }, [dispatch, id]);

  // Reset selectors when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes?.[0] || null);
      setSelectedColor(product.colors?.[0] || null);
      setQuantity(1);
    }
  }, [product]);

  // Fetch reviews + purchased check whenever product loads
  useEffect(() => {
    if (!product?.id) return;

    setReviews([]);
    setReviewsLoading(true);
    getProductReviews(product.id)
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));

    if (isAuthenticated) {
      checkHasPurchased(product.id)
        .then((data) => setHasPurchased(data?.hasPurchased ?? false))
        .catch(() => setHasPurchased(false));
    }
  }, [product?.id, isAuthenticated]); // eslint-disable-line

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(
      addToCart({
        cartItemId: makeCartItemId(product.id, selectedSize, selectedColor),
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
        size: selectedSize,
        color: selectedColor,
        quantity,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Please write a comment before submitting.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    setReviewSuccess('');
    try {
        const newReview = await submitReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [newReview, ...prev]);
      setReviewSuccess('Your review has been submitted. Thank you!');
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      setReviewError(
        err?.response?.data?.message || 'Could not submit your review. Please try again.'
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (detailStatus === 'loading') {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="space-y-8 w-full max-w-5xl px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="flex gap-8 lg:gap-12 flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 space-y-4">
              <div className="aspect-square w-full bg-gray-200 rounded-none" />
              <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-none" />
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-5">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="pt-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-10 bg-gray-200 rounded w-1/2 mt-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (detailStatus === 'failed' || !product) {
    return (
      <div className="min-h-screen bg-white pt-32 flex flex-col items-center justify-center gap-6">
        <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
          {error || 'Product not found'}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Products
        </Link>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const images = product.images?.length ? product.images : [product.imageSrc].filter(Boolean);
  const reviewCount = reviews.length || product.reviews || product.numReviews || 0;
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating || 0;

  const isOutOfStock = product.stock === 0;
  const maxQty = product.stock > 0 ? Math.min(product.stock, 99) : 1;

  const hasAlreadyReviewed =
    isAuthenticated &&
    reviews.some(
      (r) => r.user === user?._id || (r.user?._id && r.user._id === user?._id)
    );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-7">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-bold">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition-colors">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                to={`/products?category=${getCategoryName(product.category)}`}
                className="hover:text-black transition-colors capitalize"
              >
                {getCategoryName(product.category)}
              </Link>
            </>
          )}
        </nav>

        {/* ── 2-column: Gallery + Info ────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Left: Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Gallery Container */}
            <div className="mb-5">
              {/* Main Image - Enhanced for precision viewing */}
              <div className="relative aspect-square w-full overflow-hidden bg-white border border-gray-200 rounded-none mb-5 group">
                {images[selectedImage] && (
                  <div className="h-full w-full">
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Badge */}
                {product.badge && (
                  <div
                    className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white rounded-none shadow-md
                      ${product.badge === 'Low Stock' ? 'bg-red-600 animate-pulse' : 'bg-gradient-to-r from-gray-900 to-gray-800'}`}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold rounded-none">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery - Refined layout with sliding */}
              {images.length > 1 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">View All</p>
                  <div className="grid grid-cols-4 gap-3 overflow-x-auto pb-2">
                    {images.map((img, i) =>
                      img ? (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className="group relative aspect-square overflow-hidden rounded-none border-2 transition-all duration-200 cursor-pointer hover:border-gray-400"
                        >
                          <img
                            src={img}
                            alt={`Product view ${i + 1}`}
                            className={`h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
                              selectedImage === i ? 'border-black shadow-md' : ''
                            }`}
                            title={`View image ${i + 1}`}
                          />
                          {selectedImage === i && (
                            <div className="absolute inset-0 bg-black/5 rounded-none" />
                          )}
                        </button>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            {/* Category */}
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 capitalize">
              {getCategoryName(product.category)}
            </p>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Stars rating={avgRating} />
                <span className="text-sm font-bold text-gray-900">{avgRating}</span>
              </div>
              <span className="text-sm text-gray-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
            </div>

            {/* Price */}
            <p className="text-3xl font-black text-gray-900 mb-8">
              {formatPrice(product.price)}
            </p>

            {/* Stock Status */}
            {product.stock === 0 ? (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-none">
                <p className="text-sm font-bold text-red-700">Out of Stock</p>
              </div>
            ) : product.stock <= 10 ? (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-none">
                <p className="text-sm font-bold text-orange-700">Only {product.stock} left in stock</p>
              </div>
            ) : null}

            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                  Color
                  {selectedColor && (
                    <span className="ml-2 font-normal normal-case text-gray-500">
                      — {typeof selectedColor === 'string' ? selectedColor : selectedColor.name}
                    </span>
                  )}
                </label>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color, i) => {
                    const isString = typeof color === 'string';
                    const label = isString ? color : color.name;
                    const bg = isString ? color : color.hex || color.value || color.name;
                    const isActive = selectedColor === color;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        title={label}
                        style={bg.startsWith('#') ? { backgroundColor: bg } : {}}
                        className={`w-9 h-9 rounded-none border-3 transition-all shadow-sm ${bg} ${
                          isActive ? 'border-black scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                  Size
                  {selectedSize && (
                    <span className="ml-2 font-normal normal-case text-gray-500">
                      — {selectedSize}
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-2 rounded-none transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center border-2 border-gray-300 rounded-none w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                  title="Decrease quantity"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-14 text-center text-sm font-bold text-gray-900 select-none">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={isOutOfStock || quantity >= maxQty}
                  className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                  title="Increase quantity"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 text-xs font-black uppercase tracking-widest py-4 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed rounded-none font-semibold ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : added
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                    : 'bg-black text-white hover:bg-gray-900 shadow-md'
                }`}
              >
                {isOutOfStock ? (
                  'Out of Stock'
                ) : added ? (
                  <>
                    <CheckIcon className="h-5 w-5" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={() => dispatch(toggleWishlist(product))}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`p-4 rounded-none border-2 transition-all flex items-center justify-center ${
                  isWishlisted
                    ? 'border-red-600 bg-red-50 text-red-600 shadow-md'
                    : 'border-gray-300 hover:border-red-600 text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {isWishlisted
                  ? <HeartSolid className="h-5 w-5" />
                  : <HeartOutline className="h-5 w-5" />
                }
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                  About This Product
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{sanitizeHtml(product.description)}</p>
              </div>
            )}

            {/* Back Link */}
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back to Products
            </Link>
          </div>
        </div>

        {/* ── Reviews Section ─────────────────────────────────────────────── */}
        <div className="mt-24 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-12">
            Customer Reviews
            <span className="ml-3 text-lg text-gray-400">({reviewCount})</span>
          </h2>

          {reviewsLoading ? (
            /* Skeleton */
            <div className="space-y-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-none bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-300 rounded-none bg-gray-50">
              <StarSolid className="h-10 w-10 text-gray-300 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                No reviews yet
              </p>
              <p className="text-xs text-gray-400 mt-2 max-w-xs">
                Be the first to share your experience with this product after purchasing.
              </p>
            </div>
          ) : (
            /* Reviews grid: overview + cards */
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

              {/* Rating overview */}
              <div className="lg:w-56 flex-shrink-0">
                <div className="text-center mb-6">
                  <p className="text-6xl font-black text-gray-900 leading-none">{avgRating}</p>
                  <p className="text-xs text-gray-400 mb-2">out of 5</p>
                  <Stars rating={avgRating} size="h-5 w-5" />
                  <p className="text-xs text-gray-400 mt-2">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <RatingBars reviews={reviews} />
              </div>

              {/* Review cards */}
              <div className="flex-1 space-y-8">
                {reviews.map((review, i) => {
                  const name = review.user?.name || review.name || 'Anonymous';
                  const initial = name.charAt(0).toUpperCase();
                  return (
                    <div key={review._id || i} className="flex gap-4">
                      {/* Avatar */}
                      <div
                        className={`w-10 h-10 rounded-none flex-shrink-0 flex items-center justify-center text-white text-sm font-black ${avatarColor(name)}`}
                      >
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-black uppercase tracking-tight text-gray-900">
                            {name}
                          </p>
                          {review.createdAt && (
                            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
                          )}
                        </div>
                        <Stars rating={review.rating} size="h-3.5 w-3.5" />
                        {review.comment && (
                          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                            {sanitizeHtml(review.comment)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Write a Review ──────────────────────────────────────────────── */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-8">
            Share Your Thoughts
          </h2>

          {/* Case 1: not authenticated */}
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-gray-50 border border-gray-200 rounded-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Sign in to leave a review</p>
                <p className="text-xs text-gray-500 mt-1">
                  You need to be logged in to share your thoughts.
                </p>
              </div>
              <Link
                to="/login"
                className="flex-shrink-0 inline-flex items-center justify-center text-xs font-bold uppercase tracking-widest px-5 py-3 bg-black text-white hover:bg-gray-900 transition-colors rounded-none"
              >
                Login
              </Link>
            </div>
          )}

          {/* Case 2: authenticated but hasn't purchased */}
          {isAuthenticated && !hasPurchased && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-gray-50 border border-gray-200 rounded-none">
              <ShoppingCartIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900">Purchase required to review</p>
                <p className="text-xs text-gray-500 mt-1">
                  Only customers who purchased this product can leave a review.
                </p>
              </div>
            </div>
          )}

          {/* Case 3: purchased and already reviewed */}
          {isAuthenticated && hasPurchased && hasAlreadyReviewed && (
            <div className="flex items-center gap-3 p-5 bg-green-50 border border-green-200">
              <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm font-bold text-green-700">
                You&apos;ve already reviewed this product. Thank you!
              </p>
            </div>
          )}

          {/* Case 4: purchased, not yet reviewed → show form */}
          {isAuthenticated && hasPurchased && !hasAlreadyReviewed && (
            <form onSubmit={handleSubmitReview} className="max-w-xl space-y-5">

              {/* Star picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                  Your Rating
                </label>
                <StarPicker value={reviewRating} onChange={setReviewRating} />
              </div>

              {/* Comment */}
              <div>
                <label
                  htmlFor="review-comment"
                  className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2"
                >
                  Your Review
                </label>
                <textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product…"
                  className="w-full border-2 border-gray-200 focus:border-black outline-none px-4 py-3 text-sm text-gray-900 placeholder-gray-300 resize-none transition-colors"
                />
              </div>

              {/* Feedback messages */}
              {reviewError && (
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
                  {reviewError}
                </p>
              )}
              {reviewSuccess && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckIcon className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">{reviewSuccess}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="inline-flex items-center justify-center px-8 py-4 text-xs font-black uppercase tracking-widest bg-black text-white hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
