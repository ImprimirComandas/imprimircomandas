import React from 'react';
import { Button } from "../components/ui/button";

const HeroSection: React.FC = () => {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center overflow-hidden py-12 md:py-24">
      {/* Background gradient circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-brasil-green opacity-20 rounded-full filter blur-3xl animate-pulse-subtle"></div>
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-brasil-yellow opacity-20 rounded-full filter blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-brasil-blue opacity-20 rounded-full filter blur-3xl animate-pulse-subtle" style={{ animationDelay: '2s' }}></div>
      
      <div className="container px-4 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-pacifico text-6xl md:text-8xl lg:text-9xl mb-6 bg-gradient-to-r from-brasil-green via-brasil-yellow to-brasil-blue bg-clip-text text-transparent animate-float">
            Olá Mundo!
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            Welcome to a colorful journey across cultures and languages.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            className="bg-brasil-green hover:bg-brasil-green/90 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            Explore
          </Button>
          <Button 
            variant="outline"
            className="bg-transparent border-2 border-brasil-blue hover:bg-brasil-blue/10 text-brasil-blue px-8 py-6 text-lg rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
