import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectWishlistItems,
  removeFromWishlist,
} from '../redux/wishlistSlice';
import { getCategoryName } from '../utils/category';
import { addToCart, makeCartItemId } from '../redux/cartSlice';
import { HeartIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

export default function WishlistPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const handleQuickAdd = (product) => {
    dispatch(
      addToCart({
        cartItemId: makeCartItemId(product._id, product.sizes?.[0] || null, null),
        id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
        size: product.sizes?.[0] || null,
        color: null,
        quantity: 1,
      })
    );
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <HeartIcon className="h-16 w-16 text-gray-200" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Your Wishlist is Empty
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Save items you love by tapping the heart icon on any product page.
        </p>
        <Link
          to="/products"
          className="mt-2 inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">
            Wishlist
            <span className="ml-3 text-base font-bold text-gray-400 normal-case tracking-normal">
              ({items.length} item{items.length !== 1 ? 's' : ''})
            </span>
          </h1>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((product) => {
            const image = product.images?.[0] || '';
            return (
              <div key={product._id} className="group relative">

                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-100 mb-4">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>

                  {/* Badge */}
                  {product.badge && (
                    <div className={`absolute top-3 left-3 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-none
                      ${product.badge === 'Low Stock' ? 'bg-red-600 animate-pulse' : 'bg-gray-900'}`}>
                      {product.badge}
                    </div>
                  )}

                  {/* Remove from wishlist */}
                  <button
                    onClick={() => dispatch(removeFromWishlist(product.id))}
                    title="Remove from wishlist"
                    className="absolute top-3 right-3 p-2 bg-white rounded-none text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <HeartSolid className="h-5 w-5" />
                  </button>

                  {/* Quick Add to Cart */}
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="absolute bottom-4 left-4 right-4 bg-white text-gray-900 font-bold uppercase text-xs py-3 tracking-widest opacity-0 translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gray-900 hover:text-white shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingBagIcon className="h-4 w-4" /> Add to Cart
                    </div>
                  </button>
                </div>

                {/* Info */}
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 capitalize">
                    {getCategoryName(product.category)}
                  </p>
                  <div className="flex justify-between items-start gap-2">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 hover:text-red-600 transition-colors leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm font-black text-gray-900 flex-shrink-0">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center mt-1.5 space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolid
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-1">({product.numReviews})</span>
                    </div>
                  )}

                  {/* Full-width Add to Cart (always visible on mobile) */}
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="mt-3 w-full bg-black text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 sm:hidden"
                  >
                    <ShoppingBagIcon className="h-4 w-4" /> Add to Cart
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
