import { CheckBadgeIcon, BeakerIcon, FireIcon } from "@heroicons/react/24/solid";

const features = [
  {
    title: "220 GSM Heavyweight",
    description: "Not thin. Not see-through. A structured fabric that holds its shape all day.",
    icon: BeakerIcon,
  },
  {
    title: "Silicon Washed",
    description: "Pre-shrunk and treated for an ultra-soft hand feel. No rough textures.",
    icon: CheckBadgeIcon,
  },
  {
    title: "High-Density Puff Print",
    description: "3D textured prints that don't crack or fade after washing.",
    icon: FireIcon,
  },
];

export default function QualityFeature() {
  return (
    <section className="bg-white py-12 sm:py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
          
          {/* LEFT: The Visual Proof (Macro Shot) */}
          <div className="relative h-[280px] max-[360px]:h-[240px] sm:h-[360px] md:h-[500px] lg:h-[600px] w-full rounded-none overflow-hidden group shadow-2xl">
            {/* Replace with a MACRO shot of your fabric texture */}
            <img 
              src="https://plus.unsplash.com/premium_photo-1673356302067-aac3b545a362?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Close up of fabric texture 220 GSM" 
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Floating Spec Tag */}
            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-white/10 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-none max-w-[85%] sm:max-w-none">
              <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Fabric Grade</p>
              <p className="text-white text-lg sm:text-2xl font-black uppercase leading-tight">Premium Cotton</p>
            </div>
          </div>

          {/* RIGHT: The Logical Argument */}
          <div className="lg:pl-10">
            <h2 className="text-orange-600 font-bold uppercase tracking-widest text-xs sm:text-sm mb-2">
              The Details Matter
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter leading-[1.05] mb-4 sm:mb-6">
              Why We Are <br />
              <span className="text-gray-400">Different.</span>
            </h3>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-8 sm:mb-10 leading-relaxed">
              Most brands use thin 140-160 GSM fabric to save cost. We don't. 
              Our "Essential" line is engineered for the Bangladeshi climate—breathable enough for the heat, but heavy enough to drape perfectly.
            </p>

            {/* Feature List */}
            <div className="space-y-6 sm:space-y-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-none bg-orange-50 text-orange-600">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 uppercase tracking-tight leading-tight">
                      {feature.title}
                    </h4>
                    <p className="mt-1 text-sm sm:text-base text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Final "Hard" Sell Button */}
            <div className="mt-8 sm:mt-10">
              <a href="/about-fabric" className="inline-flex items-center text-xs sm:text-sm font-bold uppercase tracking-widest border-b-2 border-gray-900 pb-1 hover:text-orange-600 hover:border-orange-600 transition-colors">
                Read The Full Specs
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}