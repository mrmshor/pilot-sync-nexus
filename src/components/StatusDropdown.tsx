import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const StatusDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const statusOptions = [
    { value: 'not-started', label: 'לא התחיל', color: 'bg-gray-100 text-gray-800', icon: '⭕' },
    { value: 'in-progress', label: 'בתהליך', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
    { value: 'in-review', label: 'בסקירה', color: 'bg-purple-100 text-purple-800', icon: '👁️' },
    { value: 'completed', label: 'הושלם', color: 'bg-green-100 text-green-800', icon: '✅' },
    { value: 'on-hold', label: 'ממתין', color: 'bg-yellow-100 text-yellow-800', icon: '⏸️' },
    { value: 'waiting', label: 'ממתין', color: 'bg-orange-100 text-orange-800', icon: '⏳' }
  ];
  
  const currentStatus = statusOptions.find(s => s.value === value) || statusOptions[0];
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${currentStatus.color} border hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
      >
        {currentStatus.icon} {currentStatus.label}
        <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white backdrop-blur border border-gray-200 rounded-lg shadow-xl z-50 min-w-full">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-right px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                option.value === value ? 'bg-blue-50' : ''
              }`}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};