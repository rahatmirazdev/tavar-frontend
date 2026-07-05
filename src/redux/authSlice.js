import { createSlice } from '@reduxjs/toolkit';

const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null;

const normalizeRole = (role) => {
  if (!role) return role;
  if (typeof role === 'string') return role;
  if (typeof role === 'object' && role.name) return role.name;
  return role;
};

const normalizeUser = (user) => {
  if (!user) return user;
  return {
    ...user,
    role: normalizeRole(user.role),
  };
};

const initialState = {
  user: normalizeUser(userFromStorage?.user) || null,
  accessToken: userFromStorage?.accessToken || null,
  isAuthenticated: !!userFromStorage?.accessToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = normalizeUser(action.payload.user);
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      // Store user data and accessToken only (refreshToken is in httpOnly cookie)
      localStorage.setItem('user', JSON.stringify({
        user: normalizeUser(action.payload.user),
        accessToken: action.payload.accessToken,
      }));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerSuccess(state, action) {
      state.loading = false;
      state.user = normalizeUser(action.payload.user);
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      // Store user data and accessToken only (refreshToken is in httpOnly cookie)
      localStorage.setItem('user', JSON.stringify({
        user: normalizeUser(action.payload.user),
        accessToken: action.payload.accessToken,
      }));
    },
    registerFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
      // Cookie cleared automatically by backend
    },
    clearError(state) {
      state.error = null;
    },
    updateAccessToken(state, action) {
      state.accessToken = action.payload;
      // Update localStorage
      if (localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        user.accessToken = action.payload;
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
  updateAccessToken,
} = authSlice.actions;

export default authSlice.reducer;
