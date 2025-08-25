import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'gradient' | 'glass';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  mac?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'default',
  mac = true,
  ...props 
}, ref) => {
  const baseClass = `inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none ${
    mac ? 'focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 active:scale-95' : 'focus:ring-2 focus:ring-primary'
  } disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation select-none`;
  
  const variants = {
    default: 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5',
    outline: 'border-2 border-border bg-card/80 backdrop-blur text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5',
    ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
    destructive: 'bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive shadow-lg hover:shadow-destructive/25',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-amber-500/25',
    gradient: 'bg-gradient-to-r from-primary via-purple-500 to-primary text-primary-foreground hover:from-primary/90 hover:via-purple-600 hover:to-primary/90 shadow-xl hover:shadow-2xl',
    glass: 'bg-card/60 backdrop-blur-md border border-border/50 text-foreground hover:bg-card/80 hover:shadow-lg'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    default: 'px-6 py-3 text-sm min-h-[44px]',
    lg: 'px-8 py-4 text-base min-h-[52px]',
    icon: 'h-11 w-11 p-0 min-h-[44px]'
  };
  
  return (
    <button 
      ref={ref}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

// Legacy support for buttonVariants - proper function
export const buttonVariants = (props?: any) => {
  return 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl px-4 py-2 text-sm';
};

export { Button as default };