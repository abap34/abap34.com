import React, { useLayoutEffect, useRef } from 'react';
import { annotate } from 'rough-notation';

export default function InkAnnotation({
  as: Element = 'span',
  children,
  className = '',
  show = true,
  type = 'underline',
  padding = 2,
  strokeWidth = 1,
  iterations = 1,
  brackets,
}) {
  const elementRef = useRef(null);

  useLayoutEffect(() => {
    if (!show || !elementRef.current) return undefined;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const annotation = annotate(elementRef.current, {
      type,
      padding,
      strokeWidth,
      iterations,
      brackets,
      color: 'currentColor',
      animate: !prefersReducedMotion,
      animationDuration: 360,
    });
    const frame = window.requestAnimationFrame(() => annotation.show());

    return () => {
      window.cancelAnimationFrame(frame);
      annotation.remove();
    };
  }, [brackets, iterations, padding, show, strokeWidth, type]);

  return (
    <Element ref={elementRef} className={`ink-annotation ${className}`.trim()}>
      {children}
    </Element>
  );
}
