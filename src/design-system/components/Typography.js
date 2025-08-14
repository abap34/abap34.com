import React from 'react';
import { cn } from '../../utils/cn';

export function Heading({ level = 1, className, variant = 'foreground0', children, ...props }) {
  const Tag = `h${level}`;
  
  const getHeadingStyles = (level) => {
    const levelStyles = {
      1: { fontSize: '2.25rem', fontWeight: '700' },  // 36px
      2: { fontSize: '1.875rem', fontWeight: '600', borderLeft: '2px solid var(--foreground2)', paddingLeft: '0.75rem' },  // 30px  
      3: { fontSize: '1.5rem', fontWeight: '600' },   // 24px
      4: { fontSize: '1.25rem', fontWeight: '600' },  // 20px
      5: { fontSize: '1.125rem', fontWeight: '500' }, // 18px
      6: { fontSize: '1rem', fontWeight: '500' },     // 16px
    };
    
    return levelStyles[level];
  };
  
  return (
    <Tag 
      variant-={variant}
      className={cn('heading', className)} 
      style={getHeadingStyles(level)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Text({ variant = 'foreground1', className, children, size = 'base', ...props }) {
  const getSizeStyles = (size) => {
    const sizeMap = {
      small: { fontSize: '0.75rem' },     // 12px
      base: { fontSize: '1rem' },         // 16px
      caption: { fontSize: '0.875rem' },  // 14px
      muted: { fontSize: '0.875rem' },    // 14px
    };
    
    return sizeMap[size] || sizeMap.base;
  };
  
  return (
    <p 
      variant-={variant}
      className={cn('text', className)} 
      style={{
        lineHeight: '1.6',
        ...getSizeStyles(size)
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function Link({ href, external = false, className, variant = 'accent0', children, ...props }) {
  const linkProps = {
    href,
    'variant-': variant,
    className: cn('link', className),
    style: {
      textDecoration: 'none',
      transition: 'opacity 0.2s ease',
    },
    ...props
  };
  
  if (external) {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }
  
  return (
    <a {...linkProps}>
      {children}
    </a>
  );
}