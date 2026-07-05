import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartItems, selectCartSubtotal, clearCart } from '../redux/cartSlice';
import { createOrder, createGuestOrder, applyCoupon } from '../services/orderService';
import {
  CreditCardIcon,
  BanknotesIcon,
  TruckIcon,
  CheckCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

const formatPrice = (price) => {
  if (typeof price === 'string') return price.startsWith('৳') ? price : `৳${price}`;
  return `৳${Number(price).toLocaleString('en-IN')}`;
};

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  return parseFloat(String(price).replace(/[^\d.-]/g, '')) || 0;
};

// ── Static config ────────────────────────────────────────────────────────────

const ZONES = [
  {
    id: 'dhaka_inside',
    label: 'Inside Dhaka',
    description: 'Dhaka City Corporation area',
    charge: 60,
  },
  {
    id: 'dhaka_outside',
    label: 'Outside Dhaka',
    description: 'Dhaka Division (excluding city)',
    charge: 120,
  },
  {
    id: 'nationwide',
    label: 'Nationwide Delivery',
    description: 'All other districts',
    charge: 150,
  },
];

const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your order arrives',
    Icon: BanknotesIcon,
  },
  {
    id: 'sslcommerz',
    label: 'Online Payment',
    description: 'Cards, mobile banking, internet banking via SSLCommerz',
    Icon: CreditCardIcon,
  },
];

// ── Field component ──────────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ step, title, optional }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-900 mb-5">
      <span className="w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-[10px] flex-shrink-0">
        {step}
      </span>
      {title}
      {optional && (
        <span className="text-[10px] font-bold text-gray-400 normal-case tracking-normal ml-1">
          (optional)
        </span>
      )}
    </h2>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [isGuestMode, setIsGuestMode] = useState(!isAuthenticated);

  const [form, setForm] = useState({
    email: '',
    confirmEmail: '', // Email confirmation to prevent typos
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const [selectedZone, setSelectedZone] = useState(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null); // { type, message }
  const [couponLoading, setCouponLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Guard: empty cart → back to cart
  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true });
  }, [items, navigate]);

  // ── Derived totals ─────────────────────────────────────────────────────────

  const deliveryCharge = selectedZone?.charge ?? 0;

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percent'
      ? Math.round((subtotal * appliedCoupon.discount) / 100)  // FIXED: Use Math.round to match backend
      : appliedCoupon.discount
    : 0;

  const grandTotal = subtotal + deliveryCharge - discountAmount;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (isGuestMode) {
      if (!form.email.trim()) errors.email = 'Email is required for guest checkout';
      else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
        errors.email = 'Please enter a valid email address';
      
      // ⚠ Critical: Verify email confirmation matches (prevent lost orders)
      if (!form.confirmEmail.trim()) errors.confirmEmail = 'Please confirm your email address';
      else if (form.email.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase())
        errors.confirmEmail = 'Email addresses do not match. Please check for typos.';
    }
    if (!form.name.trim()) errors.name = 'Full name is required';
    if (!form.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^(?=.*\d)[+\d\s\-()]{7,}$/.test(form.phone.trim()))
      errors.phone = 'Enter a valid phone number (must contain at least one digit)';
    if (!form.address.trim()) errors.address = 'Street address is required';
    if (!form.city.trim()) errors.city = 'City / District is required';
    if (!selectedZone) errors.zone = 'Please select a delivery zone';
    return errors;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponStatus(null);
    try {
      const data = await applyCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon(data);
      const saving =
        data.type === 'percent'
          ? Math.round((subtotal * data.discount) / 100)  // FIXED: Use Math.round to match backend
          : data.discount;
      setCouponStatus({
        type: 'success',
        message: `Coupon applied! You save ${formatPrice(saving)}`,
      });
    } catch (err) {
      setAppliedCoupon(null);
      setCouponStatus({
        type: 'error',
        message: err?.response?.data?.message || 'Invalid or expired coupon code',
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponStatus(null);
  };

  const handlePlaceOrder = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstKey = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstKey}"]`) ||
                 document.getElementById(`zone-selector`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPlacing(true);
    setOrderError('');

    const orderData = {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: parsePrice(item.price),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        images: item.images || [],
      })),
      shippingAddress: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        street: form.address.trim(),
        city: form.city.trim(),
      },
      zone: selectedZone.id,
      couponCode: appliedCoupon?.code || null,
      subtotal,
      deliveryCharge,
      discountAmount,
      total: grandTotal,
      paymentMethod,
    };

    // Add guest email if in guest mode
    if (isGuestMode) {
      orderData.guestEmail = form.email.trim();
    }

    try {
      const result = isGuestMode
        ? await createGuestOrder(orderData)
        : await createOrder(orderData);

      dispatch(clearCart());

      if (paymentMethod === 'sslcommerz' && result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      // Redirect to order confirmation - works for both guest and authenticated
      // For guest orders, use tracking token for security (not email)
      const confirmPath = isGuestMode
        ? `/order-confirmation/${result._id || result.orderId || result.id}/${result.trackingToken || form.email.trim()}`
        : `/order-confirmation/${result._id || result.orderId || result.id}`;

      navigate(confirmPath, { state: { order: result, isGuest: isGuestMode, trackingToken: result.trackingToken } });
    } catch (err) {
      setOrderError(
        err?.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-50 pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-7">

        {/* Breadcrumb + header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-black transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900">
            Checkout
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ═══════════════════════════════════════
              LEFT COLUMN — Form
          ═══════════════════════════════════════ */}
          <div className="flex-1 space-y-5">

            {/* ⓪ Guest / Login Toggle */}
            {!isAuthenticated && (
              <div className="bg-white p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                      Checkout Mode
                    </p>
                    <p className="text-xs text-gray-500">
                      {isGuestMode
                        ? 'Proceeding as guest — no account needed'
                        : 'Sign in to access your account'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsGuestMode(true)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        isGuestMode
                          ? 'bg-black text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-black'
                      }`}
                    >
                      Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                        !isGuestMode
                          ? 'bg-black text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-black'
                      }`}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ① Contact */}
            <div className="bg-white p-6 border border-gray-100">
              <SectionHeader step="1" title="Contact Information" />
              <div className="grid grid-cols-1 gap-4">
                {isGuestMode && (
                  <>
                    <Field label="Email Address" required error={formErrors.email}>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleFormChange}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors ${
                          formErrors.email ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                    </Field>
                    <Field label="Confirm Email Address" required error={formErrors.confirmEmail}>
                      <div className="relative">
                        <input
                          name="confirmEmail"
                          type="email"
                          value={form.confirmEmail}
                          onChange={handleFormChange}
                          placeholder="re-enter your@email.com"
                          className={`w-full px-4 py-3 border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors ${
                            formErrors.confirmEmail ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                        {form.email && form.confirmEmail && form.email.toLowerCase() === form.confirmEmail.toLowerCase() && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xs">✓</span>
                        )}
                      </div>
                    </Field>
                  </>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" required error={formErrors.name}>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleFormChange}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors ${
                        formErrors.name ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </Field>
                  <Field label="Phone Number" required error={formErrors.phone}>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleFormChange}
                      placeholder="+880 1XXX-XXXXXX"
                      className={`w-full px-4 py-3 border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* ② Address */}
            <div className="bg-white p-6 border border-gray-100">
              <SectionHeader step="2" title="Delivery Address" />
              <div className="space-y-4">
                <Field label="Street Address" required error={formErrors.address}>
                  <input
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="House / Road / Block / Area"
                    className={`w-full px-4 py-3 border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors ${
                      formErrors.address ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </Field>
                <Field label="City / District" required error={formErrors.city}>
                  <input
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="e.g. Dhaka, Chittagong, Sylhet"
                    className={`w-full px-4 py-3 border text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black transition-colors ${
                      formErrors.city ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                </Field>
              </div>
            </div>

            {/* ③ Delivery Zone */}
            <div id="zone-selector" className="bg-white p-6 border border-gray-100">
              <SectionHeader step="3" title="Delivery Zone" />
              {formErrors.zone && (
                <p className="mb-3 text-xs text-red-600">{formErrors.zone}</p>
              )}
              <div className="space-y-3">
                {ZONES.map((zone) => {
                  const isSelected = selectedZone?.id === zone.id;
                  return (
                    <label
                      key={zone.id}
                      className={`flex items-center justify-between p-4 border-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-black bg-gray-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-none border-2 flex-shrink-0 transition-colors ${
                            isSelected ? 'border-black bg-black' : 'border-gray-300'
                          }`}
                        />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{zone.label}</p>
                          <p className="text-xs text-gray-500">{zone.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-gray-900 ml-4 flex-shrink-0">
                        {formatPrice(zone.charge)}
                      </span>
                      <input
                        type="radio"
                        name="zone"
                        value={zone.id}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedZone(zone);
                          setFormErrors((prev) => ({ ...prev, zone: '' }));
                        }}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* ④ Coupon */}
            <div className="bg-white p-6 border border-gray-100">
              <SectionHeader step="4" title="Coupon Code" optional />

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-bold text-green-700">
                      {couponStatus?.message}
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors ml-4"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponStatus(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        placeholder="ENTER CODE"
                        className="w-full pl-9 pr-4 py-3 border border-gray-200 text-sm text-gray-900 placeholder-gray-300 uppercase tracking-widest font-bold focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponStatus?.type === 'error' && (
                    <p className="mt-2 text-xs text-red-600">{couponStatus.message}</p>
                  )}
                </>
              )}
            </div>

            {/* ⑤ Payment Method */}
            <div className="bg-white p-6 border border-gray-100">
              <SectionHeader step="5" title="Payment Method" />
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, description, Icon }) => {
                  const isSelected = paymentMethod === id;
                  return (
                    <label
                      key={id}
                      className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-black bg-gray-50'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-none border-2 flex-shrink-0 transition-colors ${
                          isSelected ? 'border-black bg-black' : 'border-gray-300'
                        }`}
                      />
                      <Icon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={id}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(id)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════
              RIGHT COLUMN — Order Summary
          ═══════════════════════════════════════ */}
          <div className="w-full lg:w-96 lg:flex-shrink-0">
            <div className="bg-white border-2 border-gray-900 p-6 sticky top-28">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-5">
                Order Summary
              </h2>

              {/* Cart items (scrollable) */}
              <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 items-start">
                    <div className="w-12 h-16 bg-gray-100 overflow-hidden rounded flex-shrink-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-tight line-clamp-2">
                        {item.name}
                      </p>
                      <div className="flex gap-2 mt-0.5 flex-wrap">
                        {item.size && item.size !== 'default' && (
                          <span className="text-[10px] text-gray-400 uppercase">{item.size}</span>
                        )}
                        <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                      {formatPrice(parsePrice(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 mb-5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-bold text-gray-900">
                    {selectedZone ? (
                      formatPrice(deliveryCharge)
                    ) : (
                      <span className="text-gray-400 text-xs">Select zone</span>
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <TagIcon className="h-3.5 w-3.5" />
                      Coupon ({appliedCoupon?.code})
                    </span>
                    <span className="font-bold">−{formatPrice(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-900 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">
                    Total
                  </span>
                  <span className="text-xl font-black text-gray-900">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Error banner */}
              {orderError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded">
                  {orderError}
                </div>
              )}

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-black text-white text-xs font-black uppercase tracking-widest py-4 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing ? (
                  'Placing Order…'
                ) : paymentMethod === 'sslcommerz' ? (
                  <>
                    <CreditCardIcon className="h-4 w-4" />
                    Pay &amp; Place Order
                  </>
                ) : (
                  <>
                    <TruckIcon className="h-4 w-4" />
                    Place Order · COD
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="block text-center mt-3 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors py-2"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
