import React from 'react';

export function Section({ title, icon, children, className, ...props }) {
  return (
    <section className={`space-y-5 transition-all duration-300 ${className || ''}`} {...props}>
      {title && (
        <div className="flex items-center gap-3 text-2xl font-medium">
          {icon}
          <h2 className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
            {title}
          </h2>
        </div>
      )}
      <div className="ml-4 space-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}