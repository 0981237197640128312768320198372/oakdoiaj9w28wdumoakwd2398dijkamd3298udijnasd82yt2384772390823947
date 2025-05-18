import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';

interface StatusSelectorProps {
  status: string;
  onChange: (status: 'draft' | 'active') => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ status, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-light-700">Product Status</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('draft')}
          className={`
            relative overflow-hidden group cursor-pointer p-4 rounded-xl border-2
            transition-all duration-300 transform-gpu
            ${
              status === 'draft'
                ? 'border-amber-600/70 bg-gradient-to-br from-dark-800 to-amber-950/30 shadow-md shadow-amber-900/10'
                : 'border-dark-500 bg-dark-700/50 hover:border-amber-700/30 hover:bg-dark-700'
            }
          `}>
          <div
            className={`
            absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0
            ${status === 'draft' ? 'animate-shimmer' : 'opacity-0 group-hover:opacity-100'}
          `}
          />
          <div className="relative flex items-center gap-3">
            <div
              className={`
              p-1.5 rounded-full transition-all duration-200
              ${
                status === 'draft'
                  ? 'bg-amber-500 text-dark-900 ring-2 ring-amber-500/20'
                  : 'bg-dark-600 text-dark-400 group-hover:bg-dark-500 group-hover:text-amber-500/50'
              }
            `}>
              <AlertTriangle size={18} />
            </div>
            <span
              className={`
              font-medium transition-colors duration-200
              ${status === 'draft' ? 'text-amber-400' : 'text-light-400 group-hover:text-light-300'}
            `}>
              Draft
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('active')}
          className={`
            relative overflow-hidden group cursor-pointer p-4 rounded-xl border-2
            transition-all duration-300 transform-gpu
            ${
              status === 'active'
                ? 'border-green-600/70 bg-gradient-to-br from-dark-800 to-green-950/30 shadow-md shadow-green-900/10'
                : 'border-dark-500 bg-dark-700/50 hover:border-green-700/30 hover:bg-dark-700'
            }
          `}>
          <div
            className={`
            absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/5 to-green-600/0
            ${status === 'active' ? 'animate-shimmer' : 'opacity-0 group-hover:opacity-100'}
          `}
          />
          <div className="relative flex items-center gap-3">
            <div
              className={`
              p-1.5 rounded-full transition-all duration-200
              ${
                status === 'active'
                  ? 'bg-green-500 text-dark-900 ring-2 ring-green-500/20'
                  : 'bg-dark-600 text-dark-400 group-hover:bg-dark-500 group-hover:text-green-500/50'
              }
            `}>
              <Check size={18} />
            </div>
            <span
              className={`
              font-medium transition-colors duration-200
              ${
                status === 'active' ? 'text-green-400' : 'text-light-400 group-hover:text-light-300'
              }
            `}>
              Active
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StatusSelector;
