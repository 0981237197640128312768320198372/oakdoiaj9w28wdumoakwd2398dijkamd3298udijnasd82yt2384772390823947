import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, error, children }) => {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-light-700 mb-1 transition-colors">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-400 flex items-center gap-1 animate-fadeIn">
          <AlertTriangle size={10} className="flex-shrink-0" />
          <span className="leading-tight">{error}</span>
        </p>
      )}
    </div>
  );
};

export default FormField;
