import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode; 
  className?: string; 
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  elevated = false,
  ...props
}) => (
  <div 
    className={`bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200/50 transition-all duration-300 ${
      elevated ? 'shadow-2xl hover:shadow-3xl' : 'shadow-lg hover:shadow-xl'
    } hover:border-gray-300/50 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = ''
}) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = ''
}) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = ''
}) => (
  <p className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = ''
}) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = ''
}) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>
    {children}
  </div>
);