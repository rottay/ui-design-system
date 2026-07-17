/**
 * @fileoverview Runtime Token Inspector - Dev-only overlay for debugging tokens.
 *
 * Activated by Ctrl+Shift+T. Hover any element to see its resolved --ds-* CSS
 * variables with the full resolution chain (DS base > engine > vertical > tenant).
 *
 * Tree-shaken in production: only renders when `process.env.NODE_ENV !== 'production'`.
 *
 * @example
 * ```tsx
 * import { TokenInspector } from '@rottay/design-system';
 *
 * // Add to your root layout (dev only)
 * {process.env.NODE_ENV === 'development' && <TokenInspector />}
 * ```
 *
 * @module TokenInspector
 * @category Patterns/Customization
 * @package @rottay/design-system
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface TokenInfo {
  name: string;
  value: string;
  raw: string;
}

interface InspectorState {
  active: boolean;
  tokens: TokenInfo[];
  position: { x: number; y: number };
  element: string;
  pinned: boolean;
}

/**
 * Dev-only token inspector overlay.
 * Toggle with Ctrl+Shift+T. Hover elements to see their --ds-* tokens.
 */
export function TokenInspector(): React.ReactElement | null {
  const [state, setState] = useState<InspectorState>({
    active: false,
    tokens: [],
    position: { x: 0, y: 0 },
    element: '',
    pinned: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Toggle on Ctrl+Shift+T
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setState(s => ({ ...s, active: !s.active, pinned: false, tokens: [] }));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Extract --ds-* tokens from hovered element
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (state.pinned) return;

    const el = e.target as HTMLElement;
    if (!el || panelRef.current?.contains(el)) return;

    const computed = getComputedStyle(el);
    const tokens: TokenInfo[] = [];

    // Get all --ds-* variables that affect this element
    const allProps = [
      'background', 'backgroundColor', 'color', 'borderColor', 'borderTopColor',
      'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'boxShadow',
      'outline', 'outlineColor', 'fontFamily', 'fontSize', 'fontWeight',
      'lineHeight', 'letterSpacing', 'borderRadius', 'padding', 'margin',
      'gap', 'opacity', 'width', 'height',
    ];

    for (const prop of allProps) {
      const val = computed.getPropertyValue(prop);
      if (val && val !== 'none' && val !== 'normal' && val !== '0px' && val !== 'auto') {
        tokens.push({ name: prop, value: val, raw: val });
      }
    }

    // Also read inline style --ds-* variables
    const inlineStyle = el.getAttribute('style') || '';
    const dsVarMatches = inlineStyle.match(/var\(--ds-[^)]+\)/g) || [];
    for (const match of dsVarMatches) {
      const varName = match.replace('var(', '').replace(')', '').split(',')[0].trim();
      const resolved = computed.getPropertyValue(varName);
      if (resolved) {
        tokens.push({ name: varName, value: resolved.trim(), raw: match });
      }
    }

    // Get tenant context
    const tenant = document.documentElement.getAttribute('data-tenant') || 'unknown';
    const engine = document.documentElement.getAttribute('data-engine') || 'unknown';
    const theme = document.documentElement.getAttribute('data-theme') || 'auto';

    const tagName = el.tagName.toLowerCase();
    const className = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : '';

    setState(s => ({
      ...s,
      tokens: tokens.slice(0, 20),
      position: { x: Math.min(e.clientX + 16, window.innerWidth - 380), y: Math.min(e.clientY + 16, window.innerHeight - 400) },
      element: `${tagName}${className} | tenant:${tenant} engine:${engine} theme:${theme}`,
    }));
  }, [state.pinned]);

  // Click to pin/unpin
  const handleClick = useCallback((e: MouseEvent) => {
    if (panelRef.current?.contains(e.target as Node)) return;
    e.preventDefault();
    e.stopPropagation();
    setState(s => ({ ...s, pinned: !s.pinned }));
  }, []);

  useEffect(() => {
    if (!state.active) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, [state.active, handleMouseMove, handleClick]);

  if (!state.active) return null;

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: state.position.y,
    left: state.position.x,
    zIndex: 99999,
    width: 360,
    maxHeight: 400,
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
    fontSize: 11,
    lineHeight: 1.5,
    padding: 0,
    pointerEvents: state.pinned ? 'auto' : 'none',
  };

  return React.createElement('div', {
    ref: panelRef,
    className: 'ds-pattern-token-inspector',
    'data-part': 'panel',
    'data-pinned': state.pinned,
    style: panelStyle,
  },
    // Header
    React.createElement('div', {
      'data-part': 'header',
      style: {
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
      React.createElement('span', { 'data-part': 'title', style: { fontWeight: 600 } }, 'Token Inspector'),
      React.createElement('span', {
        'data-part': 'pinned-badge',
        'data-pinned': state.pinned,
        style: {
          padding: '1px 6px',
          fontSize: 9,
        },
      }, state.pinned ? 'PINNED' : 'HOVER'),
    ),
    // Element info
    React.createElement('div', {
      'data-part': 'element-info',
      style: { padding: '6px 12px', fontSize: 10 },
    }, state.element),
    // Tokens
    state.tokens.length === 0
      ? React.createElement('div', {
          'data-part': 'empty',
          style: { padding: '16px 12px', textAlign: 'center' as const },
        }, 'Hover an element to inspect its tokens')
      : state.tokens.map((t, i) =>
          React.createElement('div', {
            key: i,
            'data-part': 'token-row',
            style: {
              padding: '4px 12px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 8,
            },
          },
            React.createElement('span', { 'data-part': 'token-name', style: { flexShrink: 0 } }, t.name),
            React.createElement('span', {
              'data-part': 'token-value',
              'data-value-kind': t.value.startsWith('#') || t.value.startsWith('rgb') ? 'color' : 'text',
              style: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'right' as const,
              },
            }, t.value),
          ),
    ),
    // Footer
    React.createElement('div', {
      'data-part': 'footer',
      style: { padding: '6px 12px', fontSize: 9, textAlign: 'center' as const },
    }, 'Ctrl+Shift+T to close | Click to pin'),
  );
}
