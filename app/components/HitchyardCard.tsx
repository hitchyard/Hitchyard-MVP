import React from 'react';

interface HitchyardCardProps {
  imageSrc: string;
  title: string;
  subtitle: string;
  href: string;
}

/**
 * HITCHYARD CARD - A&F HIGH-LUXURY AESTHETIC
 * No borders, no shadows, extreme white space
 * Center-aligned, symmetrical
 */
const HitchyardCard: React.FC<HitchyardCardProps> = ({ imageSrc, title, subtitle, href }) => {
  return (
    <a 
      href={href}
      className="group block bg-white rounded-none overflow-hidden text-center
                 transition-all duration-500 ease-in-out"
    >
      <div className="overflow-hidden mb-8">
        {/* High-contrast symmetrical image - no borders */}
        <img 
          src={imageSrc} 
          alt={title}
          className="w-full h-96 object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" 
        />
      </div>
      
      {/* Text block: Extreme spacing, no borders */}
      <div className="px-12 py-8 text-center">
        {/* Title: Cinzel Bold uppercase with wide tracking */}
        <h3 className="text-2xl font-serif font-bold text-charcoal uppercase tracking-[0.3em] mb-6">
          {title}
        </h3>
        {/* Subtitle: Small sans-serif */}
        <p className="text-[14px] text-charcoal/50 font-sans leading-loose">
          {subtitle}
        </p>
      </div>
    </a>
  );
};

export default HitchyardCard;
