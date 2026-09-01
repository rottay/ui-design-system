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
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';

interface TokenInfo {
  name: string;
  value: string;
  raw: string;
}

interface InspectorState {
  active: boolean;
  tokens: TokenInfo[];
  /** Total collected before the display cap, so truncation stays visible. */
  totalTokens: number;
  position: { x: number; y: number };
  element: string;
  pinned: boolean;
}

/** Display cap for the token list; the footer reports the full count. */
const TOKEN_ROW_LIMIT = 20;

/** Gap kept between the panel and the viewport edge when there is room. */
const VIEWPORT_MARGIN = 8;

/** Interpolates `{name}` placeholders into a floor string. The optional i18n
 *  channel returns the floor verbatim with no provider mounted, so the floor
 *  has to carry its own substitution or the raw placeholder ships. */
function applyFloorParams(floor: string, params?: Record<string, string | number>): string {
  if (!params) return floor;
  return floor.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  );
}

/**
 * Dev-only token inspector overlay.
 * Toggle with Ctrl+Shift+T. Hover elements to see their --ds-* tokens.
 */
export function TokenInspector(): React.ReactElement | null {
  // Optional channel with an English floor: the overlay renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const t = (key: string, floor: string, params?: Record<string, string | number>): string => {
    const resolvedFloor = applyFloorParams(floor, params);
    return i18n?.tOr(key, resolvedFloor, params) ?? resolvedFloor;
  };

  const [state, setState] = useState<InspectorState>({
    active: false,
    tokens: [],
    totalTokens: 0,
    position: { x: 0, y: 0 },
    element: '',
    pinned: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Toggle on Ctrl+Shift+T; Escape walks back one level (unpin, then close)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        setState(s => ({ ...s, active: !s.active, pinned: false, tokens: [], totalTokens: 0, element: '' }));
        return;
      }
      if (e.key === 'Escape') {
        setState(s => {
          if (!s.active) return s;
          return s.pinned
            ? { ...s, pinned: false }
            : { ...s, active: false, tokens: [], totalTokens: 0, element: '' };
        });
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

    // Clamp against the panel's MEASURED box, not a copy of the skin's size:
    // the skin owns `inline-size`, and hardcoded extents overflowed any
    // viewport between the panel width and the retired 380/400 constants.
    const panelBox = panelRef.current?.getBoundingClientRect();
    const panelWidth = panelBox?.width ?? 0;
    const panelHeight = panelBox?.height ?? 0;
    const clampAxis = (desired: number, extent: number, viewport: number): number => {
      const upper = viewport - extent - VIEWPORT_MARGIN;
      // Panel wider/taller than the viewport: hug the start edge instead of
      // adding a margin the viewport cannot pay for.
      if (upper < VIEWPORT_MARGIN) return Math.max(0, viewport - extent);
      return Math.max(VIEWPORT_MARGIN, Math.min(desired, upper));
    };

    setState(s => ({
      ...s,
      tokens: tokens.slice(0, TOKEN_ROW_LIMIT),
      totalTokens: tokens.length,
      position: {
        x: clampAxis(e.clientX + 16, panelWidth, window.innerWidth),
        y: clampAxis(e.clientY + 16, panelHeight, window.innerHeight),
      },
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

  // Runtime-only inline: the panel anchors to the pointer (physical
  // coordinates -- pointer space is physical, not writing-direction) and the
  // interactivity flip. Frame, code typography and every static value are
  // skin-owned.
  const panelStyle: React.CSSProperties = {
    top: state.position.y,
    left: state.position.x,
    pointerEvents: state.pinned ? 'auto' : 'none',
  };

  const hiddenTokenCount = Math.max(0, state.totalTokens - state.tokens.length);

  return React.createElement('div', {
    ref: panelRef,
    className: 'ds-pattern-token-inspector',
    'data-part': 'panel',
    'data-pinned': state.pinned,
    role: 'region',
    'aria-label': t('tokenInspector.title', 'Token Inspector'),
    // The skin caps the panel and lets it scroll; a scrollable region must be
    // keyboard-reachable, and only the pinned panel accepts pointer events.
    tabIndex: state.pinned ? 0 : undefined,
    style: panelStyle,
  },
    // Header
    React.createElement('div', {
      'data-part': 'header',
    },
      React.createElement('span', { 'data-part': 'title' }, t('tokenInspector.title', 'Token Inspector')),
      React.createElement('span', {
        'data-part': 'pinned-badge',
        'data-pinned': state.pinned,
      }, state.pinned ? t('tokenInspector.pinned', 'PINNED') : t('tokenInspector.hover', 'HOVER')),
    ),
    // Element info -- omitted before the first hover so the panel never opens
    // on an empty bordered strip.
    state.element
      ? React.createElement('div', {
          'data-part': 'element-info',
        }, state.element)
      : null,
    // Tokens
    state.tokens.length === 0
      ? React.createElement('div', {
          'data-part': 'empty',
        }, t('tokenInspector.empty', 'Hover an element to inspect its tokens'))
      : state.tokens.map((token, i) =>
          React.createElement('div', {
            key: i,
            'data-part': 'token-row',
          },
            React.createElement('span', { 'data-part': 'token-name' }, token.name),
            React.createElement('span', {
              'data-part': 'token-value',
              'data-value-kind': token.value.startsWith('#') || token.value.startsWith('rgb') ? 'color' : 'text',
              // Truncation strategy: the value ellipsizes and the full string
              // stays reachable on `title` (never eaten silently).
              title: token.value,
            },
              // Color values get a live swatch of the INSPECTED value (runtime
              // data -- the debugger shows what the element actually computed;
              // geometry is skin-owned).
              token.value.startsWith('#') || token.value.startsWith('rgb')
                ? React.createElement('span', {
                    'data-part': 'token-swatch',
                    'aria-hidden': true,
                    style: { '--ds-token-inspector-swatch': token.value } as React.CSSProperties,
                  })
                : null,
              token.value,
            ),
          ),
    ),
    // Footer -- carries the row cap so the capped rows are never a silent drop.
    React.createElement('div', {
      'data-part': 'footer',
      'data-truncated': hiddenTokenCount > 0,
    }, hiddenTokenCount > 0
      ? t(
          'tokenInspector.hintTruncated',
          'Showing {shown} of {total} | Ctrl+Shift+T or Esc to close | Click to pin',
          { shown: state.tokens.length, total: state.totalTokens }
        )
      : t('tokenInspector.hint', 'Ctrl+Shift+T or Esc to close | Click to pin')),
  );
}
