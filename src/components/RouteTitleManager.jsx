import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const BRAND_NAME = 'Tavar';

const STATIC_TITLES = {
  '/': `Home | ${BRAND_NAME}`,
  '/products': `All Products | ${BRAND_NAME}`,
  '/cart': `Cart | ${BRAND_NAME}`,
  '/wishlist': `Wishlist | ${BRAND_NAME}`,
  '/login': `Login | ${BRAND_NAME}`,
  '/signup': `Sign Up | ${BRAND_NAME}`,
  '/checkout': `Checkout | ${BRAND_NAME}`,
  '/track-order': `Track Order | ${BRAND_NAME}`,
  '/orders': `Order History | ${BRAND_NAME}`,
  '/dashboard': `Dashboard | ${BRAND_NAME}`,
  '/admin': `Admin Dashboard | ${BRAND_NAME}`,
  '/admin/products': `Admin Products | ${BRAND_NAME}`,
  '/admin/orders': `Admin Orders | ${BRAND_NAME}`,
  '/admin/customers': `Admin Customers | ${BRAND_NAME}`,
  '/admin/coupons': `Admin Coupons | ${BRAND_NAME}`,
  '/admin/staff': `Admin Staff | ${BRAND_NAME}`,
  '/admin/categories': `Admin Categories | ${BRAND_NAME}`,
};

const toTitleCase = (value = '') =>
  decodeURIComponent(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const resolveDynamicTitle = (pathname, search) => {
  const productMatch = matchPath('/product/:id', pathname);
  if (productMatch) return `Product Details | ${BRAND_NAME}`;

  const orderDetailsMatch = matchPath('/orders/:orderId', pathname);
  if (orderDetailsMatch) return `Order Details | ${BRAND_NAME}`;

  const orderConfirmationMatch =
    matchPath('/order-confirmation/:orderId/:email', pathname) ||
    matchPath('/order-confirmation/:orderId', pathname);
  if (orderConfirmationMatch) return `Order Confirmation | ${BRAND_NAME}`;

  const categorySubMatch = matchPath('/shop/:category/:subcategory', pathname);
  if (categorySubMatch) {
    const category = toTitleCase(categorySubMatch.params.category);
    const subcategory = toTitleCase(categorySubMatch.params.subcategory);
    return `${subcategory} - ${category} | ${BRAND_NAME}`;
  }

  const categoryMatch = matchPath('/shop/:category', pathname);
  if (categoryMatch) {
    const category = toTitleCase(categoryMatch.params.category);
    return `${category} | ${BRAND_NAME}`;
  }

  if (pathname === '/products') {
    const params = new URLSearchParams(search);
    const searchQuery = params.get('search');
    const category = params.get('category');

    if (searchQuery) return `Search: ${toTitleCase(searchQuery)} | ${BRAND_NAME}`;
    if (category) return `${toTitleCase(category)} Products | ${BRAND_NAME}`;
  }

  return null;
};

export default function RouteTitleManager() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const dynamicTitle = resolveDynamicTitle(pathname, search);
    const title = dynamicTitle || STATIC_TITLES[pathname] || BRAND_NAME;
    document.title = title;
  }, [pathname, search]);

  return null;
}