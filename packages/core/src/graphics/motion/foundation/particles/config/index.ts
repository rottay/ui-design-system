import type {
  ParticleFieldFocalArea,
  ParticleFieldProps,
} from '../..';
import { resolveCssColor } from '@/infrastructure/runtime/dom/runtime/css-color-resolution';

export const PARTICLE_RUNTIME_LIMITS = Object.freeze({
  maxActiveCanvasContexts: 1,
  maxParticles: 1200,
  maxDevicePixelRatio: 2,
  maxCanvasPixels: 4_194_304,
  maxCanvasDimension: 4096,
  maxFocalAreas: 8,
  maxDeltaMs: 50,
} as const);

const DEFAULT_COLOR = 'rgba(255, 255, 255, 0.88)';
const DEFAULT_SIZE_RANGE: readonly [number, number] = [0.6, 1.8];

const DENSITY_MULTIPLIER = Object.freeze({
  low: 0.00065,
  medium: 0.00105,
  high: 0.00145,
} as const);

const INTENSITY_MULTIPLIER = Object.freeze({
  low: 0.84,
  medium: 1,
  high: 1.18,
} as const);

const BLEND_MODES = new Set<NonNullable<ParticleFieldProps['blendMode']>>([
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
  'plus-lighter',
]);

type Density = NonNullable<ParticleFieldProps['density']>;
type Intensity = NonNullable<ParticleFieldProps['intensity']>;
type Mood = NonNullable<ParticleFieldProps['mood']>;
type Pattern = NonNullable<ParticleFieldProps['pattern']>;
type Shape = NonNullable<ParticleFieldProps['shape']>;

export interface NormalizedParticleRuntimeConfig {
  readonly count?: number;
  readonly color: string;
  readonly speed?: number;
  readonly density: Density;
  readonly intensity: Intensity;
  readonly mood: Mood;
  readonly pattern: Pattern;
  readonly shape: Shape;
  readonly sizeRange: readonly [number, number];
  readonly opacity: number;
  readonly blendMode: NonNullable<ParticleFieldProps['blendMode']>;
  readonly focalAreas: readonly ParticleFieldFocalArea[];
}

export interface ParticleCanvasMetrics {
  readonly width: number;
  readonly height: number;
  readonly pixelWidth: number;
  readonly pixelHeight: number;
  readonly pixelCount: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly effectiveDpr: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeRead(value: unknown, key: string): unknown {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  try {
    return Reflect.get(value, key);
  } catch {
    return undefined;
  }
}

function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && allowed.includes(value as T)
    ? value as T
    : fallback;
}

function normalizeSizeRange(value: unknown): readonly [number, number] {
  if (!Array.isArray(value)) return DEFAULT_SIZE_RANGE;

  const first = clamp(finiteNumber(safeRead(value, '0'), DEFAULT_SIZE_RANGE[0]), 0.25, 8);
  const second = clamp(finiteNumber(safeRead(value, '1'), DEFAULT_SIZE_RANGE[1]), 0.25, 8);
  return first <= second ? [first, second] : [second, first];
}

function normalizeFocalAreas(value: unknown): readonly ParticleFieldFocalArea[] {
  if (!Array.isArray(value)) return [];

  const normalized: ParticleFieldFocalArea[] = [];
  const count = Math.min(value.length, PARTICLE_RUNTIME_LIMITS.maxFocalAreas);

  for (let index = 0; index < count; index += 1) {
    const candidate = safeRead(value, String(index));
    if (!candidate) continue;

    const x = safeRead(candidate, 'x');
    const y = safeRead(candidate, 'y');
    const radius = safeRead(candidate, 'radius');
    if (
      typeof x !== 'number'
      || !Number.isFinite(x)
      || typeof y !== 'number'
      || !Number.isFinite(y)
      || typeof radius !== 'number'
      || !Number.isFinite(radius)
    ) {
      continue;
    }

    const strengthValue = safeRead(candidate, 'strength');
    normalized.push(Object.freeze({
      x: clamp(x, 0, 1),
      y: clamp(y, 0, 1),
      radius: clamp(radius, 0.01, 1),
      strength: clamp(finiteNumber(strengthValue, 0.45), 0, 2),
    }));
  }

  return Object.freeze(normalized);
}

/** Normalize runtime JS/JSON input before it reaches canvas allocation. */
export function normalizeParticleRuntimeConfig(
  props: ParticleFieldProps | Record<string, unknown>,
): NormalizedParticleRuntimeConfig {
  const countValue = safeRead(props, 'count');
  const count = typeof countValue === 'number' && Number.isFinite(countValue)
    ? Math.floor(clamp(countValue, 0, PARTICLE_RUNTIME_LIMITS.maxParticles))
    : undefined;
  const colorValue = safeRead(props, 'color');
  const normalizedColor = typeof colorValue === 'string'
    ? colorValue.trim().slice(0, 512)
    : '';
  const speedValue = safeRead(props, 'speed');
  const speed = typeof speedValue === 'number' && Number.isFinite(speedValue)
    ? clamp(speedValue, 0, 1)
    : undefined;
  const blendModeValue = safeRead(props, 'blendMode');
  const blendMode = typeof blendModeValue === 'string'
    && BLEND_MODES.has(blendModeValue as NonNullable<ParticleFieldProps['blendMode']>)
    ? blendModeValue as NonNullable<ParticleFieldProps['blendMode']>
    : 'screen';

  return Object.freeze({
    count,
    color: normalizedColor || DEFAULT_COLOR,
    speed,
    density: enumValue(safeRead(props, 'density'), ['low', 'medium', 'high'], 'medium'),
    intensity: enumValue(safeRead(props, 'intensity'), ['low', 'medium', 'high'], 'medium'),
    mood: enumValue(safeRead(props, 'mood'), ['calm', 'active', 'focus'], 'calm'),
    pattern: enumValue(safeRead(props, 'pattern'), ['ambient', 'orbital'], 'ambient'),
    shape: enumValue(safeRead(props, 'shape'), ['square', 'round'], 'square'),
    sizeRange: normalizeSizeRange(safeRead(props, 'sizeRange')),
    opacity: clamp(finiteNumber(safeRead(props, 'opacity'), 1), 0, 1),
    blendMode,
    focalAreas: normalizeFocalAreas(safeRead(props, 'focalAreas')),
  });
}

/** Bound physical backing-store allocation independently from CSS dimensions. */
export function resolveParticleCanvasMetrics(
  widthInput: unknown,
  heightInput: unknown,
  devicePixelRatioInput: unknown,
): ParticleCanvasMetrics {
  const width = clamp(finiteNumber(widthInput, 1), 1, 100_000);
  const height = clamp(finiteNumber(heightInput, 1), 1, 100_000);
  const requestedDpr = clamp(
    finiteNumber(devicePixelRatioInput, 1),
    0.01,
    PARTICLE_RUNTIME_LIMITS.maxDevicePixelRatio,
  );
  const pixelBudgetScale = Math.sqrt(
    PARTICLE_RUNTIME_LIMITS.maxCanvasPixels / (width * height),
  );
  const dimensionScale = Math.min(
    PARTICLE_RUNTIME_LIMITS.maxCanvasDimension / width,
    PARTICLE_RUNTIME_LIMITS.maxCanvasDimension / height,
  );
  const scale = Math.max(0.00001, Math.min(requestedDpr, pixelBudgetScale, dimensionScale));
  const pixelWidth = Math.max(1, Math.min(
    PARTICLE_RUNTIME_LIMITS.maxCanvasDimension,
    Math.floor(width * scale),
  ));
  const pixelHeight = Math.max(1, Math.min(
    PARTICLE_RUNTIME_LIMITS.maxCanvasDimension,
    Math.floor(height * scale),
  ));

  return Object.freeze({
    width,
    height,
    pixelWidth,
    pixelHeight,
    pixelCount: pixelWidth * pixelHeight,
    scaleX: pixelWidth / width,
    scaleY: pixelHeight / height,
    effectiveDpr: Math.min(pixelWidth / width, pixelHeight / height),
  });
}

/** Resolve the count with explicit, area, backing-pixel and absolute ceilings. */
export function resolveBoundedParticleCount(
  metrics: ParticleCanvasMetrics,
  config: Pick<NormalizedParticleRuntimeConfig, 'count' | 'density' | 'intensity'>,
): number {
  const pixelBound = Math.max(1, Math.min(
    PARTICLE_RUNTIME_LIMITS.maxParticles,
    Math.floor(metrics.pixelCount / 768),
  ));
  if (config.count !== undefined) {
    return Math.min(config.count, pixelBound);
  }

  const derived = Math.round(
    metrics.width
    * metrics.height
    * DENSITY_MULTIPLIER[config.density]
    * INTENSITY_MULTIPLIER[config.intensity],
  );
  return clamp(derived, Math.min(64, pixelBound), pixelBound);
}

/** Deterministic non-cryptographic hash for a stable field seed. */
export function stableParticleSeed(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0 || 0x6d2b79f5;
}

/** Mulberry32: compact, stable and sufficient for visual distribution. */
export function createParticleRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Clamp elapsed wall time so background-tab stalls cannot launch particles. */
export function resolveParticleDeltaMs(
  timestamp: number,
  previousTimestamp: number | null,
): number {
  if (!Number.isFinite(timestamp) || previousTimestamp === null || !Number.isFinite(previousTimestamp)) {
    return 0;
  }
  return clamp(timestamp - previousTimestamp, 0, PARTICLE_RUNTIME_LIMITS.maxDeltaMs);
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseHexColor(value: string): RgbaColor | null {
  const match = /^#([\da-f]{3,8})$/i.exec(value.trim());
  if (!match) return null;
  const digits = match[1];
  const expanded = digits.length <= 4
    ? digits.split('').map((digit) => `${digit}${digit}`).join('')
    : digits;
  if (expanded.length !== 6 && expanded.length !== 8) return null;
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
    a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
  };
}

function parseRgbColor(value: string): RgbaColor | null {
  const match = /^rgba?\(\s*([+-]?[\d.]+)(?:\s*,\s*|\s+)([+-]?[\d.]+)(?:\s*,\s*|\s+)([+-]?[\d.]+)(?:\s*(?:,|\/)\s*([+-]?[\d.]+)%?)?\s*\)$/i.exec(value.trim());
  if (!match) return null;
  const alphaRaw = match[4] === undefined ? 1 : Number(match[4]);
  const alpha = match[4]?.includes('.') || alphaRaw <= 1 ? alphaRaw : alphaRaw / 100;
  return {
    r: clamp(Number(match[1]), 0, 255),
    g: clamp(Number(match[2]), 0, 255),
    b: clamp(Number(match[3]), 0, 255),
    a: clamp(alpha, 0, 1),
  };
}

function parseConcreteColor(value: string): RgbaColor | null {
  if (value.trim().toLowerCase() === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }
  return parseHexColor(value) ?? parseRgbColor(value);
}

function formatRgba(color: RgbaColor): string {
  const alpha = Math.round(color.a * 1000) / 1000;
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;
}

function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') depth += 1;
    else if (char === ')') depth = Math.max(0, depth - 1);
    else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts;
}

function browserResolveColor(value: string, element: HTMLElement): string | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.position = 'absolute';
  probe.style.pointerEvents = 'none';
  probe.style.visibility = 'hidden';
  probe.style.color = value;
  if (!probe.style.color) return null;

  try {
    element.appendChild(probe);
    const computed = window.getComputedStyle(probe).color.trim();
    return computed && !computed.includes('var(') && !computed.includes('color-mix(')
      ? computed
      : null;
  } finally {
    probe.remove();
  }
}

function parseColorStop(value: string): { color: string; weight?: number } {
  const match = /^(.*\S)\s+([\d.]+)%\s*$/.exec(value);
  return match
    ? { color: match[1].trim(), weight: clamp(Number(match[2]) / 100, 0, 1) }
    : { color: value.trim() };
}

function resolveColorMix(
  value: string,
  element: HTMLElement,
  depth: number,
): RgbaColor | null {
  if (!/^color-mix\(/i.test(value) || !value.endsWith(')')) return null;
  const parts = splitTopLevel(value.slice(value.indexOf('(') + 1, -1));
  if (parts.length !== 3 || !/^in\s+srgb(?:-linear)?$/i.test(parts[0])) return null;
  const first = parseColorStop(parts[1]);
  const second = parseColorStop(parts[2]);
  const firstColor = resolveColor(first.color, element, depth + 1);
  const secondColor = resolveColor(second.color, element, depth + 1);
  if (!firstColor || !secondColor) return null;

  let firstWeight = first.weight;
  let secondWeight = second.weight;
  if (firstWeight === undefined && secondWeight === undefined) {
    firstWeight = 0.5;
    secondWeight = 0.5;
  } else if (firstWeight === undefined) {
    firstWeight = 1 - (secondWeight ?? 0);
  } else if (secondWeight === undefined) {
    secondWeight = 1 - firstWeight;
  }
  const total = Math.max((firstWeight ?? 0) + (secondWeight ?? 0), Number.EPSILON);
  const weightA = (firstWeight ?? 0) / total;
  const weightB = (secondWeight ?? 0) / total;
  const alpha = firstColor.a * weightA + secondColor.a * weightB;
  if (alpha <= Number.EPSILON) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: (firstColor.r * firstColor.a * weightA + secondColor.r * secondColor.a * weightB) / alpha,
    g: (firstColor.g * firstColor.a * weightA + secondColor.g * secondColor.a * weightB) / alpha,
    b: (firstColor.b * firstColor.a * weightA + secondColor.b * secondColor.a * weightB) / alpha,
    a: alpha,
  };
}

function resolveColor(value: string, element: HTMLElement, depth = 0): RgbaColor | null {
  if (depth > 6) return null;
  const substituted = resolveCssColor(value, element);
  if (!substituted) return null;
  const direct = parseConcreteColor(substituted);
  if (direct) return direct;
  const mixed = resolveColorMix(substituted, element, depth);
  if (mixed) return mixed;
  const computed = browserResolveColor(substituted, element);
  return computed ? parseConcreteColor(computed) : null;
}

/** Resolve inherited provider tokens and color-mix into a canvas-safe RGBA. */
export function resolveConcreteParticleColor(
  value: unknown,
  providerElement: HTMLElement,
): string {
  const candidate = typeof value === 'string' ? value.trim().slice(0, 512) : '';
  const resolved = resolveColor(candidate || DEFAULT_COLOR, providerElement);
  return formatRgba(resolved ?? parseConcreteColor(DEFAULT_COLOR)!);
}
