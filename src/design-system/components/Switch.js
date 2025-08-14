import React from 'react';
import { cn } from '../../utils/cn';

export function Switch({ 
  className, 
  children,
  id,
  ...props 
}) {
  return (
    <label 
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size)',
        color: 'var(--foreground0)'
      }}
    >
      <input
        id={id}
        type="checkbox"
        is-="switch"
        className={cn('', className)}
        {...props}
      />
      {children}
    </label>
  );
}