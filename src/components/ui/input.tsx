import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  mac?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  className = '', 
  label,
  error,
  mac = true,
  ...props 
}, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {props.required && <span className="text-red-500 mr-1">*</span>}
      </label>
    )}
    <input 
      ref={ref}
      className={`w-full px-3 py-2 border rounded-lg text-sm transition-all duration-200 ${
        mac ? 'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent backdrop-blur' : 'focus:outline-none focus:ring-2 focus:ring-blue-500'
      } ${
        error ? 'border-red-300 bg-red-50/50' : 'border-gray-300 bg-white/80'
      } ${className}`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        {error}
      </p>
    )}
  </div>
));

Input.displayName = "Input";