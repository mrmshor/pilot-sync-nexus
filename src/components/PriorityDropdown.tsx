import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const PriorityDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const priorityOptions = [
    { value: 'low', label: 'נמוכה', color: 'bg-green-100 text-green-800', icon: '🟢' },
    { value: 'medium', label: 'בינונית', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    { value: 'high', label: 'גבוהה', color: 'bg-red-100 text-red-800', icon: '🔴' }
  ];
  
  const currentPriority = priorityOptions.find(p => p.value === value) || priorityOptions[1];
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${currentPriority.color} border hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
      >
        {currentPriority.icon} {currentPriority.label}
        <ChevronDown className={`h-3 w-3 mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white backdrop-blur border border-gray-200 rounded-lg shadow-xl z-50 min-w-full">
          {priorityOptions.map((option) => (
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