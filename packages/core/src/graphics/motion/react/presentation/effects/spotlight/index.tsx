'use client';

/**
 * @fileoverview Spotlight - Rottay Design System
 *
 * Creates a cursor-following radial gradient highlight over its children.
 * The component listens for `mousemove` events on the container and
 * repositions a `radial-gradient` overlay to track the pointer position.
 * Mouse events are throttled to animation frames via `requestAnimationFrame`
 * so React state updates are batched at 60fps instead of firing on every
 * raw mouse event (which can be 100-200Hz on modern trackpads).
 * The overlay is removed entirely when `prefers-reduced-motion` is active.
 *
 * @example
 * <Spotlight size={400} color="rgba(99, 102, 241, 0.08)">
 *   <PricingCard />
 * </Spotlight>
 */

import React, { useState, useRef, useEffect } from 'react';
import type { SpotlightProps } from '@/graphics/motion/foundation/contracts';
import { useReducedMotion } from '@/graphics/motion/react/runtime';

/**
 * Cursor-following spotlight overlay for interactive content containers.
 *
 * @param props - {@link SpotlightProps}
 * @param props.size - Diameter of the radial gradient highlight in pixels (default: 300).
 * @param props.color - CSS color for the spotlight center; fades to transparent at 80% radius (default: alpha-white-5 token).
 * @param props.children - Content rendered beneath the spotlight at z-index 2.
 * @param props.className - Optional CSS class for the outer container.
 * @param props.style - Optional inline styles merged onto the outer container.
 * @returns A positioned container with a pointer-tracking radial gradient overlay.
 */
export const Spotlight: React.FC<SpotlightProps> = ({
  size = 300,
  color = 'var(--ds-spotlight-color, var(--ds-color-alpha-white-5))',
  children,
  className,
  style,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  // Stores the pending rAF handle so we can cancel it on rapid successive
  // moves and on unmount, preventing stale updates to unmounted state.
  const frameRef = useRef<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // No pointer tracking needed when motion is reduced - the overlay
    // won't be rendered anyway (see JSX below).
    if (shouldReduceMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      // Cancel any pending frame from a previous move event to ensure
      // only the latest cursor position triggers a state update. This
      // prevents queuing multiple setPos calls within a single frame.
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }

      // Throttle pointer updates to animation frames so the effect stays smooth
      // without forcing React state updates on every mouse event.
      frameRef.current = requestAnimationFrame(() => {
        // Convert viewport-relative mouse coordinates to container-local
        // coordinates by subtracting the container's bounding rect origin.
        const rect = el.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        frameRef.current = null;
      });
    };

    el.addEventListener('mousemove', handleMove);

    return () => {
      el.removeEventListener('mousemove', handleMove);
      if (frameRef.current != null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [shouldReduceMotion]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* The spotlight overlay is conditionally rendered (not just hidden)
          so the DOM node and its gradient paint are fully removed when
          reduced motion is active, saving compositing work. */}
      {!shouldReduceMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            // radial-gradient with a fixed-size circle centered on the cursor
            // position. The 80% transparent stop creates a soft feathered edge
            // rather than a hard circle cutoff.
            background: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 80%)`,
            // pointerEvents: none ensures mouse events pass through to the
            // child content layer below, preventing the overlay from blocking
            // clicks and hover states.
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

Spotlight.displayName = 'Spotlight';
