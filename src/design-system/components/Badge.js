import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({ 
  className, 
  variant = 'foreground1', 
  children,
  ...props 
}) {
  return (
    <span
      is-="badge"
      variant-={variant}
      className={cn('', className)}
      {...props}
    >
      {children}
    </span>
  );
}