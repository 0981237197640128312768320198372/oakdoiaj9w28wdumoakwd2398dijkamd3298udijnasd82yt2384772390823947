import React from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSelectorProps {
  status: 'draft' | 'active';
  onChange: (status: 'draft' | 'active') => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ status, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label id="status-label" className="block text-xs font-medium text-light-700">
        Product Status
      </label>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="status-label">
        <button
          type="button"
          onClick={() => onChange('draft')}
          aria-checked={status === 'draft'}
          role="radio"
          aria-label="Set product status to draft"
          className={cn(
            'relative overflow-hidden group cursor-pointer p-2.5 rounded-lg border-2',
            'transition-all duration-300 transform-gpu focus:outline-none focus:ring-2 focus:ring-amber-500/30',
            status === 'draft'
              ? 'border-amber-600/70 bg-gradient-to-br from-dark-800 to-amber-950/30 shadow-sm shadow-amber-900/10'
              : 'border-dark-500 bg-dark-700/50 hover:border-amber-700/30 hover:bg-dark-700'
          )}>
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/5 to-amber-600/0',
              status === 'draft' ? 'animate-shimmer' : 'opacity-0 group-hover:opacity-100'
            )}
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-2">
            <div
              className={cn(
                'p-1 rounded-full transition-all duration-200',
                status === 'draft'
                  ? 'bg-amber-500 text-dark-900 ring-1 ring-amber-500/20'
                  : 'bg-dark-600 text-dark-400 group-hover:bg-dark-500 group-hover:text-amber-500/50'
              )}>
              <AlertTriangle size={14} aria-hidden="true" />
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                status === 'draft' ? 'text-amber-400' : 'text-light-400 group-hover:text-light-300'
              )}>
              Draft
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange('active')}
          aria-checked={status === 'active'}
          role="radio"
          aria-label="Set product status to active"
          className={cn(
            'relative overflow-hidden group cursor-pointer p-2.5 rounded-lg border-2',
            'transition-all duration-300 transform-gpu focus:outline-none focus:ring-2 focus:ring-green-500/30',
            status === 'active'
              ? 'border-green-600/70 bg-gradient-to-br from-dark-800 to-green-950/30 shadow-sm shadow-green-900/10'
              : 'border-dark-500 bg-dark-700/50 hover:border-green-700/30 hover:bg-dark-700'
          )}>
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/5 to-green-600/0',
              status === 'active' ? 'animate-shimmer' : 'opacity-0 group-hover:opacity-100'
            )}
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-2">
            <div
              className={cn(
                'p-1 rounded-full transition-all duration-200',
                status === 'active'
                  ? 'bg-green-500 text-dark-900 ring-1 ring-green-500/20'
                  : 'bg-dark-600 text-dark-400 group-hover:bg-dark-500 group-hover:text-green-500/50'
              )}>
              <Check size={14} aria-hidden="true" />
            </div>
            <span
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                status === 'active' ? 'text-green-400' : 'text-light-400 group-hover:text-light-300'
              )}>
              Active
            </span>
          </div>
        </button>
      </div>
      <div className="mt-1 text-xs text-light-500">
        <span className="text-amber-400 font-medium">Draft:</span> Product won't be visible to
        buyers
        <span className="mx-2">•</span>
        <span className="text-green-400 font-medium">Active:</span> Product will be listed for sale
      </div>
    </div>
  );
};

export default StatusSelector;
