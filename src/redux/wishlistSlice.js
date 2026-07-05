import { createSlice } from '@reduxjs/toolkit';

// ── Persistence ─────────────────────────────────────────────────────────────

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem('wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (items) => {
  localStorage.setItem('wishlist', JSON.stringify(items));
};

// ── Slice ────────────────────────────────────────────────────────────────────

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadFromStorage(),
  },
  reducers: {
    toggleWishlist(state, action) {
      const product = action.payload;
      const index = state.items.findIndex((item) => item.id === product.id);
      if (index !== -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images,
          category: product.category,
          badge: product.badge || null,
          rating: product.rating || 0,
          numReviews: product.numReviews || 0,
          sizes: product.sizes || [],
          colors: product.colors || [],
        });
      }
      saveToStorage(state.items);
    },

    removeFromWishlist(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveToStorage(state.items);
    },

    clearWishlist(state) {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

export const selectWishlistItems = (state) => state.wishlist.items;

export const selectWishlistCount = (state) => state.wishlist.items.length;

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((item) => item.id === productId);

export default wishlistSlice.reducer;
