import { TruckIcon, ArrowPathIcon, ShieldCheckIcon, BanknotesIcon } from "@heroicons/react/24/outline";

const features = [
  {
    name: 'Fast Delivery',
    description: 'Inside Dhaka: 24-48 Hrs. Outside: 3-5 Days.',
    icon: TruckIcon,
  },
  {
    name: '7-Day Easy Exchange',
    description: 'Size didn\'t fit? We replace it instantly. No questions asked.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Premium 220+ GSM',
    description: '100% Cotton. Heavyweight. Breathable. Built to last.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Cash on Delivery',
    description: 'Pay only when you receive the product. 100% Safe.',
    icon: BanknotesIcon, // Crucial for BD market
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-gray-50 py-10 sm:py-12 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-7 sm:gap-y-8 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <div className="flex items-center justify-center h-11 w-11 sm:h-12 sm:w-12 rounded-md bg-gray-900 text-white mb-4 shadow-lg">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-gray-900 leading-tight">
                {feature.name}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}