import { useRef, useLayoutEffect, type ReactNode } from 'react';
import gsap from 'gsap';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  duration?: number;
  y?: number;
  /** Unique key to trigger re-animation when content changes */
  animationKey?: string | number;
}

export function AnimatedList({
  children,
  className = '',
  stagger = 0.06,
  duration = 0.4,
  y = 16,
  animationKey,
}: AnimatedListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.children;
    if (children.length === 0) return;

    // Set initial state
    gsap.set(children, { opacity: 0, y });

    // Animate in
    gsap.to(children, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: 'power3.out',
      clearProps: 'transform',
    });

    return () => {
      gsap.killTweensOf(children);
    };
  }, [animationKey, stagger, duration, y]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
