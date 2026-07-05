import CategoryGrid from "../components/home/CategoryGrid"
import Hero from "../components/home/HeroSection"
import QualityFeature from "../components/home/QualityFeature"
import TrendingSection from "../components/home/TrendingSection"
import TrustStrip from "../components/home/TrustStrip"

const Home = () => {
  return (
    <div>
      <Hero />
      <CategoryGrid />
      <TrendingSection />
      <TrustStrip />
      <QualityFeature />
    </div>
  )
}

export default Home