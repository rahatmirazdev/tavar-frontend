import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function HeroSection() {
    return (
        <section className="relative bg-white pt-24 pb-10 sm:pt-28 sm:pb-12 md:pt-40 lg:pt-48 md:pb-20 lg:pb-32 overflow-hidden">

            {/* Background Shape - subtle gray diagonal for depth */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gray-50 -skew-x-12 transform -translate-x-1/4 hidden md:block -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 sm:gap-10 md:gap-12 h-full">

                    {/* LEFT COLUMN: Text & Psychology */}
                    <div className="flex-1 text-center md:text-left z-10">

                        {/* 1. Seasonal Badge - "Bosonto" (Spring) Transition */}
                        <div className="inline-flex items-center gap-2 bg-orange-50 px-3 py-2 sm:px-4 rounded-none mb-5 sm:mb-6 border border-orange-100">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-orange-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-none h-3 w-3 bg-orange-500"></span>
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-800">
                                Bosonto Ready: Feb '26 Drop
                            </span>
                        </div>

                        {/* 2. Headline - Typography fix */}
                        <h1 className="text-3xl max-[360px]:text-[1.75rem] sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] mb-4 sm:mb-6 uppercase tracking-tight">
                            Master The <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                                Transition.
                            </span>
                        </h1>

                        {/* 3. Subheadline - Psychology: Addressing the "Hot/Cold" weather problem */}
                        <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto md:mx-0 mb-7 sm:mb-10 leading-relaxed px-1 sm:px-0">
                            Mornings are cool, afternoons are warm. Upgrade your rotation with our
                            <span className="font-bold text-gray-900"> adaptive layers</span>,
                            heavyweight tees, and utility cargos designed for the Dhaka shift.
                        </p>

                        {/* 4. CTA Buttons - High Contrast */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                            {/* Primary Button: New Drop */}
                            <Link
                                to="/new-arrivals"
                                className="group relative w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white bg-gray-900 uppercase tracking-widest overflow-hidden transition-all hover:bg-black hover:shadow-xl focus:outline-none ring-offset-2 focus:ring-2 ring-gray-900"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Shop New Drop <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>

                            {/* Secondary Button: Shop Bottoms (Direct Access) */}
                            <Link
                                to="/shop/pants"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-gray-900 border-2 border-gray-900 uppercase tracking-widest transition-all hover:bg-gray-900 hover:text-white"
                            >
                                Shop Tops
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Image & Visual Merchandising */}
                    <div className="flex-1 relative w-full h-[320px] max-[360px]:h-[280px] sm:h-[420px] md:h-[540px] lg:h-[650px] group">

                        {/* Image Container with hidden overflow for zoom effect */}
                        <div className="absolute inset-0 bg-gray-200 rounded-none overflow-hidden shadow-2xl">
                            {/* IMPORTANT: Replace this src with your own product image later */}
                            <img
                                src="https://plus.unsplash.com/premium_photo-1673125287084-e90996bad505?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                alt="Man wearing layered outfit for spring transition"
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Gradient Overlay - Ensures text readability if you add text over image later */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        {/* Floating "Product Tag" Card - Psychology: Shows detail & quality */}
                        <div className="absolute bottom-4 sm:bottom-8 md:bottom-10 left-3 right-3 sm:left-6 sm:right-6 md:right-auto md:w-64 bg-white/95 backdrop-blur shadow-xl p-3 sm:p-4 rounded border border-white/20 transform translate-y-1 sm:translate-y-2 opacity-95 sm:opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Featured Fit</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 uppercase leading-snug">Heavyweight Tee - 200GSM</p>
                                </div>
                                <span className="text-xs font-bold text-orange-600">৳450</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}