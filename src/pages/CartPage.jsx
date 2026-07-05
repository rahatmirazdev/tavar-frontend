import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartSubtotal,
} from '../redux/cartSlice';
import { TrashIcon, ShoppingBagIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getCategoryName } from '../utils/category';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  return parseInt(String(price).replace(/[^\d.-]/g, '')) || 0;
};

const getColorLabel = (color) => {
  if (!color || color === 'default') return null;
  if (typeof color === 'string') {
    // Tailwind class like "bg-black" → strip "bg-" prefix
    return color.startsWith('bg-') ? color.replace('bg-', '') : color;
  }
  return color.name || color.hex || null;
};

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  const shipping = subtotal > 2000 ? 0 : 120;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <ShoppingBagIcon className="h-16 w-16 text-gray-200" />
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Looks like you haven&apos;t added anything yet. Start shopping to fill it up.
        </p>
        <Link
          to="/products"
          className="mt-2 inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-black uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors"
        >
          Continue Shopping
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
            Your Cart
            <span className="ml-3 text-base font-bold text-gray-400 normal-case tracking-normal">
              ({items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''})
            </span>
          </h1>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Cart Items ── */}
          <div className="flex-1 space-y-6">
            {items.map((item) => {
              const image = item.images?.[0] || '';
              const lineTotal = parsePrice(item.price) * item.quantity;
              const colorLabel = getColorLabel(item.color);

              return (
                <div
                  key={item.cartItemId}
                  className="flex gap-5 border-b border-gray-100 pb-6"
                >
                  {/* Thumbnail */}
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gray-100 overflow-hidden rounded">
                      {image && (
                        <img
                          src={image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1 capitalize">
                          {getCategoryName(item.category)}
                        </p>
                        <Link to={`/product/${item.id}`}>
                          <h3 className="text-sm font-black uppercase tracking-tight text-gray-900 hover:text-red-600 transition-colors truncate">
                            {item.name}
                          </h3>
                        </Link>

                        {/* Variants */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.size && item.size !== 'default' && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-gray-200 text-gray-600">
                              {item.size}
                            </span>
                          )}
                          {colorLabel && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-gray-200 text-gray-600 capitalize">
                              {colorLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Line total */}
                      <p className="text-sm font-black text-gray-900 flex-shrink-0">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border-2 border-gray-200">
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                cartItemId: item.cartItemId,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-gray-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                cartItemId: item.cartItemId,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                          disabled={item.quantity >= 99}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.cartItemId))}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Order Summary ── */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="border-2 border-gray-900 p-6 sticky top-28">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    Free shipping on orders over ৳2,000
                  </p>
                )}
              </div>

              <div className="border-t-2 border-gray-900 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">Total</span>
                  <span className="text-lg font-black text-gray-900">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-black text-white text-xs font-black uppercase tracking-widest py-4 hover:bg-gray-900 transition-colors mb-3 text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="block text-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors py-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
