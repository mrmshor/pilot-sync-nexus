import React, { useState } from 'react';
import { ChevronDown, ArrowDown, Minus, ArrowUp } from 'lucide-react';

export const PriorityDropdown: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const priorityOptions = [
    { value: 'low', label: 'נמוכה', color: 'bg-green-100 text-green-800', Icon: ArrowDown },
    { value: 'medium', label: 'בינונית', color: 'bg-yellow-100 text-yellow-800', Icon: Minus },
    { value: 'high', label: 'גבוהה', color: 'bg-red-100 text-red-800', Icon: ArrowUp }
  ];
  
  const currentPriority = priorityOptions.find(p => p.value === value) || priorityOptions[1];
  
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 h-10 rounded-2xl text-sm font-medium transition-all duration-200 ${currentPriority.color} border-2 shadow-md hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex items-center justify-between`}
      >
        <span className="flex items-center gap-2">
          <currentPriority.Icon className="h-4 w-4" />
          {currentPriority.label}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-[200] min-w-full overflow-hidden">
          {priorityOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-right px-4 py-3 text-sm hover:bg-gray-100 transition-all duration-150 flex items-center gap-2 ${
                option.value === value ? 'bg-blue-50 font-medium' : ''
              }`}
            >
              <option.Icon className="h-3 w-3" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};