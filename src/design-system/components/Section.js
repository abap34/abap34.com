import React from 'react';
import { cn } from '../../utils/cn';

export function Section({ title, icon, children, className, ...props }) {
  return (
    <section 
      className={cn('section', className)} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        transition: 'all 0.3s ease',
      }}
      {...props}
    >
      {title && (
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.5rem',
            fontWeight: '500',
          }}
        >
          {icon}
          <h2 
            variant-="foreground0"
            style={{
              borderLeft: '2px solid var(--foreground2)',
              paddingLeft: '0.75rem',
            }}
          >
            {title}
          </h2>
        </div>
      )}
      <div 
        variant-="foreground1"
        style={{
          marginLeft: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          lineHeight: '1.6',
        }}
      >
        {children}
      </div>
    </section>
  );
}