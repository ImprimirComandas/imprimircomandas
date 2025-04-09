
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import InteractiveGlobe from '../components/InteractiveGlobe';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Sistema de Delivery</h1>
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Início</Link>
            <Link to="/products" className="text-gray-700 hover:text-gray-900">Produtos</Link>
            <Link to="/delivery-app">
              <Button variant="default" size="sm">
                Acessar Delivery
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <HeroSection />
        <InteractiveGlobe />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
