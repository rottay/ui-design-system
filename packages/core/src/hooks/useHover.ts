import { useState, useRef, useEffect, RefObject } from 'react';

/**
 * useHover Hook
 *
 * Detects when mouse is hovering over an element
 *
 * @returns [ref, isHovered] tuple
 *
 * @example
 * ```tsx
 * const [hoverRef, isHovered] = useHover<HTMLDivElement>();
 *
 * return (
 *   <div ref={hoverRef}>
 *     {isHovered ? (
 *       <Tooltip>Hover content</Tooltip>
 *     ) : null}
 *     <p>Hover over me!</p>
 *   </div>
 * );
 * ```
 */
export function useHover<T extends HTMLElement = HTMLElement>(): [
  RefObject<T>,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}
