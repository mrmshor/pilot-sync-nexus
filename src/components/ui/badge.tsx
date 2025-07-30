import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode; 
  className?: string;
  variant?: 'default' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'secondary';
  interactive?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  interactive = false,
  ...props
}) => {
  const variants = {
    default: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300/50',
    outline: 'border border-gray-300 text-gray-700 bg-white/80 backdrop-blur',
    destructive: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300/50',
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300/50',
    warning: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300/50',
    info: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300/50',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300/50'
  };
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
        interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Legacy support
export const badgeVariants = () => '';