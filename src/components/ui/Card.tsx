import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'glow';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-3xl p-6 transition-all duration-300';
  
  const variantStyles = {
    glass: 'glass shadow-xl',
    solid: 'bg-brand-surface border border-white/5 shadow-2xl',
    glow: 'bg-brand-surface border border-brand-primary/20 shadow-lg shadow-brand-primary/5',
  };

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-1 hover:border-brand-primary/30 hover:shadow-brand-primary/10'
    : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface FlipCardProps {
  isFlipped: boolean;
  onClick: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  isFlipped,
  onClick,
  front,
  back,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full max-w-sm h-96 perspective-1000 cursor-pointer select-none ${className}`}
    >
      <div
        className={`w-full h-full relative transition-transform duration-500 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl glass-card flex flex-col items-center justify-center p-6 border-2 border-brand-primary/30 bg-gradient-to-br from-brand-surface to-brand-bg">
          {front}
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl glass-card flex flex-col items-center justify-center p-6 border-2 border-brand-secondary/30 bg-gradient-to-br from-brand-surface to-violet-950/40">
          {back}
        </div>
      </div>
    </div>
  );
};
