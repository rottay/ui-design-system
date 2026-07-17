/**
 * @fileoverview Chart export utility -- exports SVG chart elements to PNG or SVG
 * files. Pure utility with zero React or external dependencies; uses browser
 * Canvas API, XMLSerializer, and Blob for export.
 *
 * CSS variables are resolved to computed values so the exported file is
 * self-contained and renders correctly outside the DS runtime context.
 *
 * Usage:
 * ```ts
 * const svg = document.querySelector('svg');
 * await exportChart(svg, { format: 'png', scale: 2, filename: 'revenue-chart' });
 * ```
 */

import { resolveCssColor } from '@/ui/patterns/visualization/charts/runtime/foundation/css-color-resolution';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ChartExportOptions {
  /** Export format */
  format: 'png' | 'svg';
  /** Scale factor for PNG (default: 2 for retina quality) */
  scale?: number;
  /** Background color (default: transparent for SVG, white for PNG) */
  backgroundColor?: string;
  /** Filename without extension */
  filename?: string;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** CSS properties that commonly hold color values which may use CSS variables. */
const COLOR_PROPERTIES = [
  'color',
  'fill',
  'stroke',
  'stop-color',
  'flood-color',
  'lighting-color',
  'background-color',
  'border-color',
  'outline-color',
  'text-decoration-color',
] as const;

/** CSS properties to inline on each element for self-contained export. */
const INLINE_PROPERTIES = [
  ...COLOR_PROPERTIES,
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'letter-spacing',
  'line-height',
  'text-anchor',
  'dominant-baseline',
  'alignment-baseline',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'stroke-width',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'visibility',
  'display',
  'overflow',
  'clip-path',
  'filter',
  'transform',
  'text-transform',
] as const;

/**
 * Checks whether a CSS value string contains a custom-property reference.
 */
function containsCssVar(value: string): boolean {
  return value.includes('var(');
}

/**
 * Resolves any variable-bearing attributes already present on the clone. This
 * covers inline SVG presentation attributes and style declarations before
 * computed properties are copied over them.
 */
function resolveVariableAttributes(
  original: HTMLElement | SVGElement,
  clone: HTMLElement | SVGElement,
): void {
  for (const attribute of Array.from(clone.attributes)) {
    if (!containsCssVar(attribute.value)) continue;

    const resolved = resolveCssColor(attribute.value, original);
    if (resolved) {
      // @runtime-svg-paint-copy -- preserves any variable-backed attribute on the exported clone.
      clone.setAttribute(attribute.name, resolved);
    } else {
      clone.removeAttribute(attribute.name);
    }
  }
}

/**
 * Walks all elements in a cloned SVG subtree and inlines the computed styles
 * from the corresponding original elements. CSS variable references are
 * resolved to their actual computed values so the clone is self-contained.
 *
 * `<defs>` children (gradients, patterns, clip-paths) are included because
 * they are regular SVG elements and their styles need inlining too.
 *
 * `<foreignObject>` content is flattened: its `textContent` is preserved in
 * a `<text>` sibling and the foreignObject itself is removed, since HTML
 * inside SVG does not survive rasterisation to Canvas.
 */
function inlineStyles(
  original: SVGSVGElement,
  clone: SVGSVGElement,
): void {
  const originalElements = original.querySelectorAll('*');
  const cloneElements = clone.querySelectorAll('*');

  // Walk every element pair (original + clone) simultaneously.
  for (let i = 0; i < originalElements.length && i < cloneElements.length; i++) {
    const origEl = originalElements[i];
    const cloneEl = cloneElements[i] as SVGElement | HTMLElement;

    if (
      (origEl instanceof SVGElement || origEl instanceof HTMLElement) &&
      (cloneEl instanceof SVGElement || cloneEl instanceof HTMLElement)
    ) {
      resolveVariableAttributes(origEl, cloneEl);
    }

    // Handle foreignObject: flatten to text
    if (origEl.tagName === 'foreignObject') {
      const textContent = origEl.textContent?.trim();
      if (textContent) {
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const x = origEl.getAttribute('x') || '0';
        const y = origEl.getAttribute('y') || '0';
        textEl.setAttribute('x', x);
        textEl.setAttribute('y', y);
        const computedStyle = getComputedStyle(origEl);
        textEl.setAttribute('font-size', computedStyle.fontSize);
        textEl.setAttribute(
          'fill',
          resolveCssColor(computedStyle.color, origEl as SVGElement, '#000000'),
        );
        textEl.textContent = textContent;
        cloneEl.parentNode?.replaceChild(textEl, cloneEl);
      } else {
        cloneEl.parentNode?.removeChild(cloneEl);
      }
      continue;
    }

    // Skip non-element nodes (shouldn't happen with querySelectorAll, but guard)
    if (!(cloneEl instanceof Element)) continue;

    const computed = getComputedStyle(origEl);

    for (const prop of INLINE_PROPERTIES) {
      let value = computed.getPropertyValue(prop).trim();
      if (!value || value === 'none' && prop === 'display') continue;

      // Resolve CSS variable references to concrete values
      if (containsCssVar(value)) {
        value = resolveCssColor(value, origEl as HTMLElement | SVGElement);
      }
      if (!value) continue;

      // For SVG presentation attributes, set as attribute rather than style
      // to maximize compatibility with SVG renderers that ignore inline styles.
      if (cloneEl instanceof SVGElement) {
        const isSvgPresentationAttr = [
          'fill', 'stroke', 'stroke-width', 'stroke-dasharray',
          'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
          'fill-opacity', 'stroke-opacity', 'opacity', 'font-family',
          'font-size', 'font-weight', 'font-style', 'text-anchor',
          'dominant-baseline', 'alignment-baseline', 'visibility',
          'display', 'clip-path', 'filter', 'transform', 'text-decoration-color',
          'stop-color', 'flood-color', 'lighting-color',
        ].includes(prop);

        if (isSvgPresentationAttr) {
          // @runtime-svg-paint-copy -- fidelity sink: `prop` is the live presentation attribute.
          cloneEl.setAttribute(prop, value);
        } else {
          (cloneEl as SVGElement).style.setProperty(prop, value);
        }
      } else {
        (cloneEl as HTMLElement).style.setProperty(prop, value);
      }
    }
  }

  resolveVariableAttributes(original, clone);

  // Also resolve presentation attributes on the root <svg> element itself
  const rootComputed = getComputedStyle(original);
  for (const prop of INLINE_PROPERTIES) {
    let value = rootComputed.getPropertyValue(prop).trim();
    if (!value) continue;
    if (containsCssVar(value)) {
      value = resolveCssColor(value, original);
    }
    if (!value) continue;
    if (prop === 'font-family' || prop === 'font-size' || prop === 'color') {
      // @runtime-svg-paint-copy -- color is normalized to SVG fill; font properties pass through.
      clone.setAttribute(prop === 'color' ? 'fill' : prop, value);
    }
  }

  // Stylesheet rules are redundant once computed paint is inlined. Removing
  // them also prevents a standalone export from retaining unresolved var().
  for (const styleElement of Array.from(clone.querySelectorAll('style'))) {
    styleElement.remove();
  }
}

/**
 * Serializes a cloned SVG element to a self-contained SVG string.
 * Adds the XML namespace and sets explicit width/height attributes
 * so the SVG renders correctly when opened standalone.
 */
function serializeSvg(svgClone: SVGSVGElement): string {
  // Ensure xmlns is set for standalone SVG rendering
  svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

  // Ensure width/height attributes are set (some charts use viewBox only)
  if (!svgClone.hasAttribute('width')) {
    const viewBox = svgClone.getAttribute('viewBox');
    if (viewBox) {
      const [, , w, h] = viewBox.split(/\s+/).map(Number);
      svgClone.setAttribute('width', String(w));
      svgClone.setAttribute('height', String(h));
    }
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgClone);

  // Ensure XML declaration for maximum compatibility
  if (!svgString.startsWith('<?xml')) {
    svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
  }

  return svgString;
}

/**
 * Creates a deep clone of the SVG element with all styles inlined and CSS
 * variables resolved. This is the shared first step for both SVG and PNG export.
 */
function prepareSvgClone(svgElement: SVGSVGElement): SVGSVGElement {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  inlineStyles(svgElement, clone);
  return clone;
}

/**
 * Triggers a file download in the browser by creating a temporary anchor
 * element and clicking it.
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Defer cleanup to ensure the download starts
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Reads the natural pixel dimensions of the SVG element (from explicit
 * width/height attributes, viewBox, or getBoundingClientRect as fallback).
 */
function getSvgDimensions(svg: SVGSVGElement): { width: number; height: number } {
  // Try explicit attributes first
  const attrWidth = svg.getAttribute('width');
  const attrHeight = svg.getAttribute('height');
  if (attrWidth && attrHeight) {
    const w = parseFloat(attrWidth);
    const h = parseFloat(attrHeight);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) return { width: w, height: h };
  }

  // Try viewBox
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/\s+/).map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: parts[2], height: parts[3] };
    }
  }

  // Fallback to bounding rect
  const rect = svg.getBoundingClientRect();
  return { width: rect.width || 800, height: rect.height || 600 };
}

// ---------------------------------------------------------------------------
// SVG export
// ---------------------------------------------------------------------------

async function exportAsSvg(
  svgElement: SVGSVGElement,
  options: ChartExportOptions,
): Promise<void> {
  const clone = prepareSvgClone(svgElement);

  // Apply background if requested
  if (options.backgroundColor) {
    const dims = getSvgDimensions(clone);
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('width', String(dims.width));
    bgRect.setAttribute('height', String(dims.height));
    bgRect.setAttribute(
      'fill',
      resolveCssColor(options.backgroundColor, svgElement, 'transparent'),
    );
    clone.insertBefore(bgRect, clone.firstChild);
  }

  const svgString = serializeSvg(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const filename = (options.filename || 'chart') + '.svg';
  triggerDownload(blob, filename);
}

// ---------------------------------------------------------------------------
// PNG export
// ---------------------------------------------------------------------------

async function exportAsPng(
  svgElement: SVGSVGElement,
  options: ChartExportOptions,
): Promise<void> {
  const scale = options.scale ?? 2;
  const bgColor = resolveCssColor(
    options.backgroundColor ?? '#ffffff',
    svgElement,
    '#ffffff',
  );

  const clone = prepareSvgClone(svgElement);
  const dims = getSvgDimensions(svgElement);

  // Set explicit dimensions on the clone for consistent rasterisation
  clone.setAttribute('width', String(dims.width));
  clone.setAttribute('height', String(dims.height));

  const svgString = serializeSvg(clone);

  // Create image from SVG data URL
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load SVG as image for PNG export'));
    img.src = svgDataUrl;
  });

  // Draw to canvas at the desired scale
  const canvas = document.createElement('canvas');
  canvas.width = dims.width * scale;
  canvas.height = dims.height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  // Apply background color
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, dims.width, dims.height);

  // Convert canvas to blob and trigger download
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob() returned null'));
          return;
        }
        const filename = (options.filename || 'chart') + '.png';
        triggerDownload(blob, filename);
        resolve();
      },
      'image/png',
      1.0,
    );
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Export a chart SVG element to PNG or SVG file. Triggers a browser download.
 *
 * The function clones the SVG, inlines all computed styles, resolves CSS
 * variables to concrete values, and produces a self-contained file that
 * renders correctly outside the design system runtime context.
 *
 * @param svgElement - The SVG element to export (typically obtained via a ref).
 * @param options    - Export configuration (format, scale, background, filename).
 *
 * @throws {Error} If the SVG element is null/undefined, if the format is
 *   unsupported, or if Canvas operations fail (PNG export).
 *
 * @example
 * ```ts
 * // Export as retina PNG with white background
 * await exportChart(svgRef.current, {
 *   format: 'png',
 *   scale: 2,
 *   backgroundColor: '#ffffff',
 *   filename: 'monthly-revenue',
 * });
 *
 * // Export as SVG (transparent background by default)
 * await exportChart(svgRef.current, {
 *   format: 'svg',
 *   filename: 'monthly-revenue',
 * });
 * ```
 */
export async function exportChart(
  svgElement: SVGSVGElement,
  options: ChartExportOptions,
): Promise<void> {
  if (!svgElement) {
    throw new Error('exportChart: svgElement is required');
  }

  if (typeof window === 'undefined') {
    throw new Error('exportChart: requires a browser environment');
  }

  switch (options.format) {
    case 'svg':
      return exportAsSvg(svgElement, options);
    case 'png':
      return exportAsPng(svgElement, options);
    default:
      throw new Error(`exportChart: unsupported format "${(options as ChartExportOptions).format}"`);
  }
}
