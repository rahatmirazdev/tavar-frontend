import { Link } from "react-router-dom";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800 font-sans">
      
      {/* 1. The "retention" Section (Newsletter) */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
                Join The Club
              </h3>
              <p className="text-gray-400 text-sm">
                Get <span className="text-white font-bold">10% OFF</span> your first order + early access to drops.
              </p>
            </div>
            
            <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full sm:w-80 bg-gray-800 text-white pl-10 pr-4 py-3 rounded-none focus:outline-none focus:ring-2 focus:ring-orange-600 border border-transparent focus:border-transparent transition-all placeholder-gray-500 font-medium"
                />
              </div>
              <button className="bg-orange-600 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-orange-500 transition-colors rounded-none">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white uppercase italic block mb-6">
              CLTH<span className="text-orange-600 not-italic">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Engineered for the streets of Dhaka. Premium heavyweight cotton essentials for the modern man.
            </p>
            <div className="flex space-x-4">
              {/* Social Placeholders */}
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-none bg-gray-800 hover:bg-orange-600 transition-colors text-white">
                <span className="font-bold text-xs">FB</span>
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-none bg-gray-800 hover:bg-orange-600 transition-colors text-white">
                <span className="font-bold text-xs">IG</span>
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-none bg-gray-800 hover:bg-orange-600 transition-colors text-white">
                <span className="font-bold text-xs">TT</span>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/new" className="hover:text-orange-500 transition-colors">New Arrivals</Link></li>
              <li><Link to="/tees" className="hover:text-orange-500 transition-colors">Heavyweight Tees</Link></li>
              <li><Link to="/pants" className="hover:text-orange-500 transition-colors">Cargo Pants</Link></li>
              <li><Link to="/sale" className="text-orange-500 font-bold hover:text-orange-400 transition-colors">Sale Archive</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/track" className="hover:text-orange-500 transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-orange-500 transition-colors">Returns & Exchange</Link></li>
              <li><Link to="/shipping" className="hover:text-orange-500 transition-colors">Shipping Info</Link></li>
              <li><Link to="/size-guide" className="hover:text-orange-500 transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex flex-col">
                <span className="text-xs font-bold text-gray-600 uppercase mb-1">WhatsApp / Call</span>
                <span className="text-white hover:text-orange-500 cursor-pointer">+880 1700-000000</span>
              </li>
              <li className="flex flex-col">
                <span className="text-xs font-bold text-gray-600 uppercase mb-1">Email</span>
                <span className="text-white hover:text-orange-500 cursor-pointer">support@clth.com.bd</span>
              </li>
              <li className="flex flex-col">
                <span className="text-xs font-bold text-gray-600 uppercase mb-1">Location</span>
                <span className="text-white">Banani, Dhaka-1213</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="bg-black py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 uppercase tracking-widest text-center md:text-left">
            © 2026 CLTH Bangladesh. All rights reserved.
          </p>
          <div className="flex space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
             {/* Simple Text Placeholders for Payment Logos - Replace with SVGs later if needed */}
             <span className="text-xs font-bold text-white border border-gray-700 px-2 py-1 rounded">bKash</span>
             <span className="text-xs font-bold text-white border border-gray-700 px-2 py-1 rounded">Nagad</span>
             <span className="text-xs font-bold text-white border border-gray-700 px-2 py-1 rounded">COD</span>
             <span className="text-xs font-bold text-white border border-gray-700 px-2 py-1 rounded">VISA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}