import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart, makeCartItemId } from '../redux/cartSlice';
import {
  XMarkIcon,
  CheckIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

export default function QuickAddModal({ product, onClose }) {
  const dispatch = useDispatch();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Initialise selections whenever product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || null);
      setSelectedColor(product.colors?.[0] || null);
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!product) return null;

  const isOutOfStock = product.stock === 0 || product.badge === 'Sold Out';
  const maxQty = product.stock > 0 ? Math.min(product.stock, 99) : 99;

  const handleAdd = () => {
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
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const image = product.images?.[0];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick add ${product.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — slides up from bottom on mobile, centred on desktop */}
      <div className="relative w-full sm:max-w-md bg-white shadow-2xl z-10 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start gap-4 p-5 border-b border-gray-100">
          {image && (
            <div className="w-14 h-[72px] flex-shrink-0 bg-gray-100 overflow-hidden rounded">
              <img
                src={image}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-tight text-gray-900 line-clamp-2 leading-tight">
              {product.name}
            </p>
            <p className="text-sm font-black text-gray-900 mt-1">
              {formatPrice(product.price)}
            </p>
            {isOutOfStock && (
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-red-600">
                Out of Stock
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">

          {/* Color picker */}
          {product.colors?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                Color
                {selectedColor && (
                  <span className="ml-2 font-normal normal-case tracking-normal text-gray-500">
                    — {typeof selectedColor === 'string' ? selectedColor : selectedColor.name}
                  </span>
                )}
              </p>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color, i) => {
                  const isString = typeof color === 'string';
                  const label = isString ? color : color.name;
                  const bg = isString ? color : (color.hex || color.value || color.name);
                  const isActive = selectedColor === color;
                  const isHex = bg?.startsWith('#');
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      title={label}
                      style={isHex ? { backgroundColor: bg } : {}}
                      className={`w-8 h-8 rounded-none border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-black ${
                        !isHex ? bg : ''
                      } ${isActive ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                      aria-label={label}
                      aria-pressed={isActive}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size picker */}
          {product.sizes?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                Size
                {selectedSize && (
                  <span className="ml-2 font-normal normal-case tracking-normal text-gray-500">
                    — {selectedSize}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-colors focus:outline-none ${
                      selectedSize === size
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                    }`}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
              Quantity
            </p>
            <div className="flex items-center border-2 border-gray-200 w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-gray-900 select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                disabled={quantity >= maxQty}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-2 animate-pulse">
                Only {product.stock} left in stock
              </p>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`w-full py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              added
                ? 'bg-green-600 text-white'
                : isOutOfStock
                ? 'bg-gray-200 text-gray-500'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : added ? (
              <><CheckIcon className="h-4 w-4" /> Added to Cart!</>
            ) : (
              <><ShoppingBagIcon className="h-4 w-4" /> Add to Cart</>
            )}
          </button>

          {/* View full details */}
          <Link
            to={`/product/${product.id}`}
            onClick={onClose}
            className="block text-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors py-1"
          >
            View Full Details
          </Link>
        </div>
      </div>
    </div>
  );
}
