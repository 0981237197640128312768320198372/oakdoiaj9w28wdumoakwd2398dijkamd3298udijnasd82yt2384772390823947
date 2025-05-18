import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-dark-800';

  const variants = {
    primary:
      'bg-primary text-dark-800 hover:bg-primary/90 shadow-sm hover:shadow focus:ring-primary/50',
    secondary:
      'bg-dark-600 hover:bg-dark-500 text-light-200 border border-dark-400 focus:ring-dark-400/50',
    danger: 'bg-red-500/80 text-white hover:bg-red-600 focus:ring-red-500/50',
    ghost:
      'bg-transparent hover:bg-dark-700/50 text-light-300 hover:text-light-100 focus:ring-dark-400/50',
  };

  const sizes = {
    sm: 'text-xs px-2 py-1 gap-1',
    md: 'text-sm px-3 py-1.5 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${
        isLoading ? 'cursor-not-allowed opacity-80' : ''
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}>
      {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-1.5" />}
      {!isLoading && icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
