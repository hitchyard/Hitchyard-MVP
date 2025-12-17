import React from 'react';

interface HitchyardCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  href: string;
}

const HitchyardCard: React.FC<HitchyardCardProps> = ({ imageSrc, title, subtitle, href }) => {
  return (
    // The main card container: light background, subtle shadow, and a border for crispness.
    <a 
      href={href}
      className="group block bg-surface border border-gray-100 rounded-lg overflow-hidden 
                 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out"
    >
      <div className="overflow-hidden">
        {/* Full-bleed, aspirational image is the focus (The A&F standard) */}
        <img 
          src={imageSrc} 
          alt={title} 
          // Subtle, premium zoom on hover 
          className="w-full h-96 object-cover transform group-hover:scale-[1.03] transition-transform duration-500 ease-out" 
        />
      </div>
      
      {/* Text block for content: high contrast on white */}
      <div className="p-8 text-center">
        {/* Title uses Cinzel Bold for a premium, authoritative section header */}
        <h3 className="text-2xl font-cinzel-bold text-text-primary uppercase tracking-widest mb-2">
          {title}
        </h3>
        {/* Subtitle uses a clean sans-serif for functional app text */}
        <p className="text-base text-text-secondary font-league-spartan">
          {subtitle}
        </p>
      </div>
    </a>
  );
};

export default HitchyardCard;
