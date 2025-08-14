import React from 'react';
import { cn } from '../../utils/cn';

export function Card({ className, variant = 'background1', style, ...props }) {
  return (
    <div
      variant-={variant}
      className={cn('card-container', className)}
      style={{
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--foreground2)',
        ...style
      }}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('card-header', className)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.375rem',
        marginBottom: '1.5rem',
      }}
      {...props}
    />
  );
}

export function CardTitle({ className, variant = 'foreground0', ...props }) {
  return (
    <h3
      variant-={variant}
      className={cn('card-title', className)}
      style={{
        fontSize: '1.5rem',
        fontWeight: '600',
        lineHeight: '1.2',
        letterSpacing: '-0.025em',
      }}
      {...props}
    />
  );
}

export function CardDescription({ className, variant = 'foreground1', ...props }) {
  return (
    <p
      variant-={variant}
      className={cn('card-description', className)}
      style={{
        fontSize: '0.875rem',
      }}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div 
      className={cn('card-content', className)} 
      style={{ paddingTop: 0 }}
      {...props} 
    />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div 
      className={cn('card-footer', className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingTop: 0,
        marginTop: '1.5rem'
      }}
      {...props} 
    />
  );
}