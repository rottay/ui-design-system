'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useScrollProgress(target?: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = target?.current;

    const handleScroll = () => {
      if (element) {
        const scrollHeight = element.scrollHeight - element.clientHeight;
        const scrolled = element.scrollTop;
        setProgress(scrollHeight > 0 ? Math.min(Math.max(scrolled / scrollHeight, 0), 1) : 0);
      } else {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        setProgress(windowHeight > 0 ? Math.min(Math.max(scrolled / windowHeight, 0), 1) : 0);
      }
    };

    const scrollElement = element || window;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [target]);

  return progress;
}
