import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'gradient';
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
  const baseClass = `inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none ${
    mac ? 'focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 active:scale-95' : 'focus:ring-2 focus:ring-blue-500'
  } disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const variants = {
    default: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl',
    outline: 'border border-gray-300 bg-white/80 backdrop-blur text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md',
    ghost: 'text-gray-700 hover:bg-gray-100/80 backdrop-blur',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg',
    gradient: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-10 w-10 p-0'
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