import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  animateGlow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  animateGlow = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 cursor-pointer select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg rounded-3xl',
  };
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-primary to-violet-600 text-white hover:from-brand-primary-light hover:to-brand-primary shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40',
    secondary: 'bg-gradient-to-r from-brand-secondary to-pink-600 text-white hover:from-pink-400 hover:to-brand-secondary shadow-lg shadow-brand-secondary/20 hover:shadow-brand-secondary/40',
    accent: 'bg-gradient-to-r from-brand-accent to-cyan-500 text-slate-950 hover:from-cyan-300 hover:to-brand-accent shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/40',
    danger: 'bg-gradient-to-r from-brand-danger to-red-600 text-white hover:from-red-400 hover:to-brand-danger shadow-lg shadow-brand-danger/20 hover:shadow-brand-danger/40',
    outline: 'border-2 border-brand-primary/30 text-brand-primary-light hover:bg-brand-primary/10 hover:border-brand-primary/60 backdrop-blur-sm',
    ghost: 'text-slate-300 hover:bg-white/5 hover:text-white',
  };

  const glowStyles = animateGlow
    ? variant === 'secondary'
      ? 'animate-pulse-secondary-glow'
      : variant === 'accent'
        ? 'animate-pulse-accent-glow'
        : 'animate-pulse-glow'
    : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${glowStyles} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
