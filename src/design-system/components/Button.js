import React from 'react';
import { cn } from '../../utils/cn';

const getButtonClasses = ({ variant = 'default', size = 'default' }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
    link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-xs',
    default: 'h-10 py-2 px-4',
    lg: 'h-11 px-8 text-base',
    icon: 'h-10 w-10',
  };
  
  return cn(baseClasses, variants[variant], sizes[size]);
};

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  return (
    <button
      className={cn(getButtonClasses({ variant, size }), className)}
      {...props}
    />
  );
}