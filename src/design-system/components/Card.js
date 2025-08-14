import React from 'react';

const getCardClasses = ({ variant = 'default', className = '' }) => {
  const baseClasses = 'rounded-lg border shadow-sm transition-all duration-300';
  
  const variants = {
    default: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
    elevated: 'bg-white border-gray-200 shadow-md hover:shadow-lg dark:bg-gray-900 dark:border-gray-700 dark:shadow-gray-800',
    ghost: 'bg-transparent border-transparent',
  };
  
  return [baseClasses, variants[variant], className].filter(Boolean).join(' ');
};

export function Card({ className, variant = 'default', ...props }) {
  return (
    <div
      className={getCardClasses({ variant, className })}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={`text-sm text-gray-600 dark:text-gray-400 ${className || ''}`}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div className={`p-6 pt-0 ${className || ''}`} {...props} />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className || ''}`} {...props} />
  );
}