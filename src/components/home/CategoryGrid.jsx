import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/productSlice";
import { ArrowLongRightIcon } from "@heroicons/react/24/outline";

// Bento grid tile classes by position (cycles if more than 4 categories)
const TILE_CLASSES = [
  "col-span-1 md:col-span-2 md:row-span-2",
  "col-span-1 md:col-span-1 md:row-span-2",
  "col-span-1 md:col-span-1 md:row-span-1",
  "col-span-1 md:col-span-1 md:row-span-1",
];

// Fallback static categories shown while loading or if API has no data
const FALLBACK_CATEGORIES = [
  {
    id: "f1",
    name: "Heavyweight Tees",
    description: "220 GSM • Puff Print • Oversized",
    href: "/shop/tees",
    imageSrc: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
    className: TILE_CLASSES[0],
  },
  {
    id: "f2",
    name: "Utility Cargos",
    description: "6-Pocket Design • Relaxed Fit",
    href: "/shop/pants",
    imageSrc: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
    className: TILE_CLASSES[1],
  },
  {
    id: "f3",
    name: "Casual Shirts",
    description: "Flannels & Cubans",
    href: "/shop/shirts",
    imageSrc: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    className: TILE_CLASSES[2],
  },
  {
    id: "f4",
    name: "Spring Layers",
    description: "Vests & Windbreakers",
    href: "/shop/outerwear",
    imageSrc: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
    className: TILE_CLASSES[3],
  },
];

const CATEGORY_IMAGES = {
  'tops': 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop',
  'bottoms': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
  'outerwear': 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop',
  'accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
};

const toTile = (cat, i) => {
  const catNameLower = (cat.name || '').toLowerCase();
  return {
    id: cat._id || cat.id || i,
    name: cat.name,
    description: cat.description || cat.subtitle || "",
    href: cat.slug ? `/shop/${cat.slug}` : `/products?category=${encodeURIComponent(cat.name)}`,
    imageSrc: cat.image || cat.imageSrc || CATEGORY_IMAGES[catNameLower] || FALLBACK_CATEGORIES[0].imageSrc,
    className: TILE_CLASSES[i % TILE_CLASSES.length],
  };
};

export default function CategoryGrid() {
  const dispatch = useDispatch();
  const { categories, categoriesStatus } = useSelector((state) => state.products);

  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoriesStatus]);

  const tiles =
    categoriesStatus === "succeeded" && categories.length > 0
      ? categories.slice(0, 4).map(toTile)
      : FALLBACK_CATEGORIES;

  const isLoading = categoriesStatus === "loading";

  return (
    <section className="bg-gray-50 py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex justify-between items-end gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight leading-tight">
              Shop By Category
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500">Essentials for the modern rotation.</p>
          </div>
          <Link to="/products" className="hidden md:flex items-center text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-orange-600 transition-colors">
            View All <ArrowLongRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[240px] sm:auto-rows-[280px] md:auto-rows-auto md:h-[600px]">
          {isLoading
            ? TILE_CLASSES.map((cls, i) => (
                <div key={i} className={`${cls} bg-gray-200 rounded-none animate-pulse`} />
              ))
            : tiles.map((category) => (
                <Link
                  key={category.id}
                  to={category.href}
                  className={`group relative overflow-hidden rounded-none bg-gray-200 ${category.className}`}
                >
                  <img
                    src={category.imageSrc}
                    alt={category.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8">
                    {category.description && (
                      <p className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                        {category.description}
                      </p>
                    )}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight">
                      {category.name}
                    </h3>
                    <div className="mt-3 sm:mt-4 flex items-center text-white opacity-100 md:opacity-0 transform translate-y-0 md:translate-y-4 transition-all duration-300 md:group-hover:opacity-100 md:group-hover:translate-y-0">
                      <span className="text-sm font-bold uppercase tracking-widest border-b-2 border-white pb-1">Shop Now</span>
                    </div>
                  </div>
                </Link>
              ))}
        </div>

        {/* Mobile "View All" */}
        <div className="mt-8 md:hidden">
          <Link to="/products" className="flex w-full items-center justify-center rounded-none border border-gray-300 bg-white px-4 py-3 text-sm font-bold uppercase tracking-widest text-gray-900 hover:bg-gray-50">
            View All Categories
          </Link>
        </div>

      </div>
    </section>
  );
}
