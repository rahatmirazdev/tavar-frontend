import { createBrowserRouter } from "react-router-dom";
import Layout from "../layouts/Layouts";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import CategoryPage from "../pages/CategoryPage";
import AllProductsPage from "../pages/AllProductsPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import WishlistPage from "../pages/WishlistPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import GuestOrderTrackingPage from "../pages/GuestOrderTrackingPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import OrderDetailsPage from "../pages/OrderDetailsPage";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminCustomersPage from "../pages/admin/AdminCustomersPage";
import AdminCouponsPage from "../pages/admin/AdminCouponsPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import { ProtectedRoute, AdminOnlyRoute, RequireAuth } from "./protectedRoute";
import ErrorLayout from "../pages/ErrorLayout";

const router = createBrowserRouter([
  // ── Public / customer routes ─────────────────────────────────────────────
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/products", element: <AllProductsPage /> },
      { path: "/product/:id", element: <ProductDetailsPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/wishlist", element: <WishlistPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/order-confirmation/:orderId", element: <OrderConfirmationPage /> },
      { path: "/order-confirmation/:orderId/:email", element: <OrderConfirmationPage /> },
      { path: "/track-order", element: <GuestOrderTrackingPage /> },
      { path: "/orders", element: <OrderHistoryPage /> },
      { path: "/orders/:orderId", element: <OrderDetailsPage /> },
      // Dynamic main category: /shop/:category
      { path: "/shop/:category", element: <CategoryPage /> },
      // Dynamic sub-category: /shop/:category/:subcategory
      { path: "/shop/:category/:subcategory", element: <CategoryPage /> },
    ],
  },

  // ── Dashboard (all authenticated users) ─────────────────────────────────
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },

  // ── Admin / staff routes (requires role === 'admin' or 'staff') ──────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
          { path: "customers", element: <AdminCustomersPage /> },
          { path: "coupons", element: <AdminCouponsPage /> },
          // Admin-only routes (staff cannot access)
          {
            element: <AdminOnlyRoute />,
            children: [
              { path: "staff", element: <AdminStaffPage /> },
              { path: "categories", element: <AdminCategoriesPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
