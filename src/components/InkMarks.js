import React from 'react';

const linePaths = {
  quiet: 'M1 5.18 C19 4.46 39 5.42 58 5.02 C76 4.58 90 5.34 99 4.90',
  rise: 'M1 5.42 C18 5.06 35 4.28 53 4.84 C72 5.36 87 4.54 99 4.46',
  settle: 'M1 4.54 C17 5.14 34 5.52 51 4.96 C69 4.40 85 4.82 99 5.34',
};

const rulePaths = {
  quiet: 'M1 5.20 C12 4.42 24 5.38 36 4.84 C49 4.28 61 5.62 73 4.92 C84 4.36 93 5.30 99 4.76',
  rise: 'M1 5.52 C13 5.08 25 4.30 38 4.72 C51 5.26 62 4.20 75 4.58 C87 4.94 94 4.18 99 4.34',
  settle: 'M1 4.44 C14 4.82 25 5.46 38 5.04 C50 4.54 62 5.54 75 5.12 C87 4.70 94 5.44 99 5.58',
};

const dotOffsets = [-0.07, 0.03, -0.01, 0.08, -0.04, 0.01, -0.08, 0.05];
const dotScales = [0.82, 1.08, 0.94, 1.02, 0.88, 1.12, 0.96, 0.86];
const dotGaps = [0.74, 1.06, 0.86, 0.96, 0.68, 1.12, 0.80, 0.98];

function InkLine({ className = '', variant = 'quiet', paths = linePaths }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 8"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[variant] || paths.quiet} pathLength="100" />
    </svg>
  );
}

export function InkUnderline({ children, className = '', variant = 'quiet' }) {
  return (
    <span className={`ink-underline ${className}`.trim()}>
      {children}
      <InkLine className="ink-underline-line" variant={variant} />
    </span>
  );
}

export function InkRule({ className = '', variant = 'quiet' }) {
  return (
    <InkLine
      className={`ink-rule ${className}`.trim()}
      variant={variant}
      paths={rulePaths}
    />
  );
}

export function InkLeader({ className = '', variant = 0 }) {
  return (
    <span className={`ink-leader ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => {
        const patternIndex = (index + variant * 3) % dotOffsets.length;
        return (
          <i
            key={index}
            style={{
              transform: `translateY(${dotOffsets[patternIndex]}em) scale(${dotScales[patternIndex]})`,
              marginInlineStart: `${dotGaps[patternIndex]}ch`,
            }}
          />
        );
      })}
    </span>
  );
}
