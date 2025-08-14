import React from 'react';
import { cn } from '../../utils/cn';

export function Tag({ className, variant = 'accent1', children, ...props }) {
  return (
    <span
      is-="badge"
      variant-={variant}
      className={cn('tag', className)}
      {...props}
    >
      {children}
    </span>
  );
}
