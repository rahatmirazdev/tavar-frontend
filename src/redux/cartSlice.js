import { createSlice } from '@reduxjs/toolkit';

// ── Helpers ────────────────────────────────────────────────────────────────

const getColorKey = (color) => {
  if (!color) return 'default';
  if (typeof color === 'string') return color;
  return color.name || color.hex || JSON.stringify(color);
};

export const makeCartItemId = (productId, size, color) =>
  `${productId}|${size || 'default'}|${getColorKey(color)}`;

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

// ── Slice ───────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadFromStorage(),
  },
  reducers: {
    addToCart(state, action) {
      const incoming = action.payload; // expects cartItemId on the payload
      const existing = state.items.find((i) => i.cartItemId === incoming.cartItemId);
      if (existing) {
        existing.quantity += incoming.quantity ?? 1;
      } else {
        state.items.push({ ...incoming, quantity: incoming.quantity ?? 1 });
      }
      saveToStorage(state.items);
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.cartItemId !== action.payload);
      saveToStorage(state.items);
    },

    updateQuantity(state, action) {
      const { cartItemId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.cartItemId !== cartItemId);
      } else {
        const item = state.items.find((i) => i.cartItemId === cartItemId);
        if (item) item.quantity = quantity;
      }
      saveToStorage(state.items);
    },

    clearCart(state) {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// ── Selectors ───────────────────────────────────────────────────────────────

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price =
      typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price).replace(/[^\d.-]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

export default cartSlice.reducer;
