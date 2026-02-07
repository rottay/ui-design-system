'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface MousePosition {
  x: number;
  y: number;
  isInside: boolean;
}

export function useMousePosition(ref: RefObject<HTMLElement | null>): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    isInside: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        isInside: true,
      });
    };

    const handleMouseLeave = () => {
      setMousePosition((prev) => ({ ...prev, isInside: false }));
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  return mousePosition;
}
