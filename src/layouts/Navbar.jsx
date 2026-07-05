import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/authSlice";
import { logout as logoutAPI } from "../services/authService";
import { selectCartCount } from "../redux/cartSlice";
import { selectWishlistCount } from "../redux/wishlistSlice";
import {
  ShoppingBagIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      // Even if API call fails, still clear client-side auth
    } finally {
      dispatch(logout());
      setUserMenuOpen(false);
      navigate("/");
    }
  };

  const navigation = [
    {
      name: "Tops",
      href: "/products?category=tops",
      featuredImage:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop",
      featuredTitle: "New Season Hoodies",
      submenu: [
        { name: "Oversized Tees", href: "/products?category=tops" },
        { name: "Heavyweight Hoodies", href: "/products?category=tops" },
        { name: "Flannels & Shirts", href: "/products?category=tops" },
        { name: "Graphic Tees", href: "/products?category=tops" },
      ],
    },
    {
      name: "Bottoms",
      href: "/products?category=bottoms",
      featuredImage:
        "https://images.unsplash.com/photo-1715532098304-1e81e1f42600?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      featuredTitle: "Cargo Revolution",
      submenu: [
        { name: "Cargo Pants", href: "/products?category=bottoms" },
        { name: "Baggy Jeans", href: "/products?category=bottoms" },
        { name: "Sweatpants", href: "/products?category=bottoms" },
        { name: "Jorts / Shorts", href: "/products?category=bottoms" },
      ],
    },
    {
      name: "Outerwear",
      href: "/products?category=outerwear",
      featuredImage:
        "https://images.unsplash.com/photo-1640182837191-0620ae2d9b9c?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      featuredTitle: "Varsity Jackets",
      submenu: [
        { name: "Bomber Jackets", href: "/products?category=outerwear" },
        { name: "Puffer Jackets", href: "/products?category=outerwear" },
        { name: "Denim Jackets", href: "/products?category=outerwear" },
      ],
    },
    { name: "Accessories", href: "/products?category=accessories" },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="fixed w-full z-100 font-sans">
      <div className="bg-black text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase text-center py-2 relative z-50">
        Global Shipping Available <span className="mx-2 text-gray-600">|</span> New Drop This Friday
      </div>

      <nav
        className={`
          w-full transition-all duration-300 border-b border-gray-100 relative z-40
          ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-white py-4 sm:py-6"}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex md:hidden">
              <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-gray-900">
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none">
              <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900 uppercase italic">
                Tavar<span className="text-red-600 not-italic">.</span>
              </Link>
            </div>

            <div className="hidden md:flex space-x-8 items-center justify-center flex-1">
              {navigation.map((item) => (
                <div key={item.name} className="group h-full static">
                  <Link
                    to={item.href}
                    className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black py-2 relative"
                  >
                    {item.name}
                    {item.submenu && <span className="ml-1 text-[10px] opacity-50">▼</span>}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                  </Link>

                  {item.submenu && (
                    <div className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                      <div className="max-w-7xl mx-auto px-8 py-8">
                        <div className="grid grid-cols-12 gap-8">
                          <div className="col-span-3 border-r border-gray-100">
                            <h3 className="font-black text-sm uppercase tracking-widest mb-4 text-gray-900">Shop {item.name}</h3>
                            <ul className="space-y-3">
                              {item.submenu.map((sub) => (
                                <li key={sub.name}>
                                  <Link to={sub.href} className="text-sm text-gray-500 hover:text-red-600 transition-colors hover:pl-1 block duration-200">
                                    {sub.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="col-span-9 flex items-center bg-gray-50 rounded-none overflow-hidden relative group/card">
                            <div className="w-1/2 p-8 relative z-10">
                              <p className="text-red-600 font-bold text-xs uppercase tracking-widest mb-2">Featured</p>
                              <h4 className="text-3xl font-black uppercase text-gray-900 mb-4">{item.featuredTitle}</h4>
                              <Link to={item.href} className="inline-flex items-center text-sm font-bold border-b-2 border-black pb-1 hover:text-red-600 hover:border-red-600 transition-colors">
                                Shop Now <ArrowRightIcon className="h-4 w-4 ml-2" />
                              </Link>
                            </div>
                            <div className="w-1/2 h-64 relative">
                              <img
                                src={item.featuredImage}
                                alt={item.featuredTitle}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-105"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6 justify-end">
              <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-900 hover:text-gray-600 transition-colors">
                {searchOpen ? <XMarkIcon className="h-5 w-5" /> : <MagnifyingGlassIcon className="h-5 w-5 stroke-2" />}
              </button>

              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center justify-center w-8 h-8 rounded-none bg-black text-white text-xs font-black uppercase hover:bg-gray-800 transition-colors"
                  >
                    {userInitial}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-lg py-1">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      >
                        My Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                      >
                        My Orders
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'staff') && (
                        <>
                          <div className="border-t border-gray-100" />
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          >
                            Admin Panel
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-xs font-bold uppercase tracking-widest text-white bg-black px-4 py-2 hover:bg-gray-800 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              <Link to="/wishlist" className="group flex items-center relative">
                <HeartIcon className="h-5 w-5 text-gray-900 group-hover:text-red-600 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="group flex items-center relative">
                <ShoppingBagIcon className="h-5 w-5 text-gray-900 group-hover:text-gray-600 transition-colors stroke-2" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        <div
          className={`
            absolute top-full left-0 w-full bg-white border-b border-gray-100 overflow-hidden transition-all duration-300 ease-in-out
            ${searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <MagnifyingGlassIcon className="absolute left-0 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for 'Oversized T-shirt'..."
                className="w-full pl-8 pr-4 py-2 text-lg font-medium text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none focus:ring-0"
              />
            </form>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[100] flex ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />
        <div className={`relative w-[85%] max-w-sm bg-white h-full shadow-2xl transition-transform duration-300 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 flex justify-between items-center border-b border-gray-100">
            <span className="text-xl font-black uppercase tracking-tighter">Menu</span>
            <button onClick={() => setMobileOpen(false)}><XMarkIcon className="h-6 w-6" /></button>
          </div>
          <div className="p-6 space-y-6">
            {navigation.map(item => (
              <div key={item.name}>
                <Link to={item.href} onClick={() => setMobileOpen(false)} className="block text-lg font-bold uppercase tracking-wide mb-2">{item.name}</Link>
                {item.submenu && (
                  <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                    {item.submenu.map(sub => (
                      <Link key={sub.name} to={sub.href} onClick={() => setMobileOpen(false)} className="block text-gray-500 text-sm">{sub.name}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="border-t border-gray-100 pt-6 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center text-xs font-black">
                      {userInitial}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm font-bold uppercase tracking-wide text-gray-900"
                  >
                    My Orders
                  </Link>
                  {(user?.role === 'admin' || user?.role === 'staff') && (
                    <>
                      <div className="border-t border-gray-100 pt-3" />
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-bold uppercase tracking-wide text-red-600"
                      >
                        Admin Dashboard
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block text-sm font-bold uppercase tracking-wide text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-lg font-bold uppercase tracking-wide">
                    Login
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="block text-lg font-bold uppercase tracking-wide text-red-600">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
