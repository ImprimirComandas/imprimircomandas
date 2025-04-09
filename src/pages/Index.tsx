
import React from 'react';
import HeroSection from '@/components/HeroSection';
import InteractiveGlobe from '@/components/InteractiveGlobe';
import FeaturesSection from '@/components/FeaturesSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main>
        <section className="relative">
          <HeroSection />
          <InteractiveGlobe />
        </section>
        
        <FeaturesSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
