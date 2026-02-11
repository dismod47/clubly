import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface UseStaggerAnimationOptions {
  stagger?: number;
  duration?: number;
  y?: number;
  ease?: string;
  delay?: number;
}

export function useStaggerAnimation<T extends HTMLElement>(
  deps: unknown[] = [],
  options: UseStaggerAnimationOptions = {}
) {
  const containerRef = useRef<T>(null);
  const {
    stagger = 0.08,
    duration = 0.5,
    y = 20,
    ease = 'power2.out',
    delay = 0,
  } = options;

  useGSAP(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.children;
    if (children.length === 0) return;

    gsap.fromTo(
      children,
      {
        opacity: 0,
        y: y,
      },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease,
        delay,
      }
    );
  }, { scope: containerRef, dependencies: deps });

  return containerRef;
}

export function useScrollReveal<T extends HTMLElement>(
  options: UseStaggerAnimationOptions = {}
) {
  const elementRef = useRef<T>(null);
  const {
    duration = 0.6,
    y = 30,
    ease = 'power2.out',
  } = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y },
              { opacity: 1, y: 0, duration, ease }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(elementRef.current);

    return () => observer.disconnect();
  }, [duration, y, ease]);

  return elementRef;
}
