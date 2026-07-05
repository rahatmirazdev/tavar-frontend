import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllProducts, getProductById, getTrendingProducts } from '../services/productService';
import { getAllCategories } from '../services/categoryService';

// ── Persistence Helpers ─────────────────────────────────────────────────────
const CACHE_KEY = 'productsCache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    // Check if cache is still valid
    if (Date.now() - data.timestamp < CACHE_DURATION) {
      return data.products;
    }
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const saveToCache = (products) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      products,
      timestamp: Date.now(),
    }));
  } catch {
    // Silently fail if localStorage is full
  }
};

// Normalize a single product from either API or local data shape
const normalize = (p) => ({
  id: p._id || p.id,
  name: p.name,
  price: p.price,
  category: p.category,
  subcategory: p.subcategory || null,
  images: p.images?.length
    ? p.images
    : [p.imageFront || p.imageSrc, p.imageBack || p.imageFront || p.imageSrc].filter(Boolean),
  badge: p.badge || null,
  rating: p.rating || 0,
  reviews: p.numReviews ?? p.reviews ?? 0,
  description: p.description || '',
  sizes: p.sizes?.length ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
  colors: p.colors || [],
  stock: p.stock ?? 0,
});

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getAllProducts(params);
      return Array.isArray(data) ? data : data.products || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchTrendingProducts = createAsyncThunk(
  'products/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getTrendingProducts();
      return Array.isArray(data) ? data : data.products || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch trending');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await getAllCategories();
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await getProductById(id);
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Product not found');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: loadFromCache() || [],  // Load from cache on init
    trending: [],
    categories: [],
    selectedProduct: null,
    itemsStatus: 'idle',
    trendingStatus: 'idle',
    categoriesStatus: 'idle',
    detailStatus: 'idle',
    error: null,
  },
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.itemsStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.itemsStatus = 'succeeded';
        state.items = action.payload.map(normalize);
        saveToCache(state.items);  // ADDED: Save to cache
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.itemsStatus = 'failed';
        state.error = action.payload;
      })

      // fetchTrendingProducts
      .addCase(fetchTrendingProducts.pending, (state) => {
        state.trendingStatus = 'loading';
      })
      .addCase(fetchTrendingProducts.fulfilled, (state, action) => {
        state.trendingStatus = 'succeeded';
        state.trending = action.payload.map(normalize);
      })
      .addCase(fetchTrendingProducts.rejected, (state, action) => {
        state.trendingStatus = 'failed';
        state.error = action.payload;
      })

      // fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed';
        state.error = action.payload;
      })

      // fetchProductById
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading';
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedProduct = normalize(action.payload);
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
