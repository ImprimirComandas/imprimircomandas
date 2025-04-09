
import React, { useState } from 'react';

const InteractiveGlobe: React.FC = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { left, top, width, height } = container.getBoundingClientRect();
    
    // Calculate center of the container
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Calculate mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Normalize values to get rotation between -15 and 15 degrees
    const rotateY = (mouseX / (width / 2)) * 15;
    const rotateX = -(mouseY / (height / 2)) * 15;
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  const handleMouseLeave = () => {
    // Animate back to original position
    setRotation({ x: 0, y: 0 });
  };
  
  return (
    <div className="my-12 flex items-center justify-center">
      <div 
        className="globe-container cursor-pointer select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="globe animate-rotate-slow"
          style={{ 
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          <div className="continent continent-1"></div>
          <div className="continent continent-2"></div>
          <div className="continent continent-3"></div>
          <div className="continent continent-4"></div>
          <div className="highlight"></div>
        </div>
        
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-portugal-red rounded-full opacity-90 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-brasil-yellow rounded-full opacity-90 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};

export default InteractiveGlobe;
