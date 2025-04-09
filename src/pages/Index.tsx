
import HeroSection from '../components/HeroSection';
import InteractiveGlobe from '../components/InteractiveGlobe';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />
        <InteractiveGlobe />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
