import React from 'react';

export function Heading({ level = 1, className, children, ...props }) {
  const Tag = `h${level}`;
  
  const getHeadingClasses = (level) => {
    const baseClasses = 'font-bold text-gray-900 dark:text-white';
    
    const levelClasses = {
      1: 'text-3xl md:text-4xl',
      2: 'text-2xl md:text-3xl border-l-2 border-gray-200 dark:border-gray-700 pl-3',
      3: 'text-xl md:text-2xl',
      4: 'text-lg md:text-xl',
      5: 'text-base md:text-lg',
      6: 'text-sm md:text-base',
    };
    
    return [baseClasses, levelClasses[level], className].filter(Boolean).join(' ');
  };
  
  return (
    <Tag className={getHeadingClasses(level)} {...props}>
      {children}
    </Tag>
  );
}

export function Text({ variant = 'body', className, children, ...props }) {
  const getTextClasses = (variant) => {
    const variants = {
      body: 'text-gray-700 dark:text-gray-300 leading-relaxed',
      caption: 'text-sm text-gray-600 dark:text-gray-400',
      muted: 'text-sm text-gray-500 dark:text-gray-500',
      small: 'text-xs text-gray-600 dark:text-gray-400 font-mono',
    };
    
    return [variants[variant], className].filter(Boolean).join(' ');
  };
  
  return (
    <p className={getTextClasses(variant)} {...props}>
      {children}
    </p>
  );
}

export function Link({ href, external = false, className, children, ...props }) {
  const linkClasses = [
    'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    'hover:underline transition-colors duration-300',
    className
  ].filter(Boolean).join(' ');
  
  const linkProps = {
    className: linkClasses,
    ...props
  };
  
  if (external) {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }
  
  return (
    <a href={href} {...linkProps}>
      {children}
    </a>
  );
}