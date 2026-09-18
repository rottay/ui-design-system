/**
 * @fileoverview The single chart paint resolver -- pure, no React.
 *
 * A chart's paint decision is taken here ONCE, and everything downstream reads
 * it: the family, its renderer, its legend, its tooltip and the export path.
 * Before this owner existed the family resolved a scheme from one hook while
 * its renderer stamped a scope from a different one, so a chart could paint
 * from one table while its scope named another.
 *
 * It is not a flattening. The registry declares a paint MODEL per family and
 * only `categorical` is a slot machine: a gauge's error/warning/success arcs
 * and a heat map's two-stop ramp keep their own shapes and share only the
 * precedence chain, so a tenant palette reaches them without the design system
 * inventing ten gauge series.
 *
 * The chain itself is untouched. `resolveChartSeriesPaint` remains the one
 * implementation of `category > series > scheme-channel > literal`, and this
 * owner is its consumer.
 */

import {
  resolveCssColor,
  type CssColorOwner,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';

import type { ChartColorScheme } from '../../../../../contracts';
import {
  CHART_FAMILY_REGISTRY,
  isChartFamilyId,
  type ChartFamilyId,
  type ChartFamilyRow,
  type ChartPaintModel,
} from '../../../../../foundation/registry';
import {
  CHART_CATEGORICAL_SIZE,
  resolveChartSeriesPaint,
} from '../../../../chart-engine/foundation/grammar/palette';

export { CHART_CATEGORICAL_SIZE };

/** The scheme a family falls back to when neither prop nor token decides. */
export const CHART_DEFAULT_SCHEME: ChartColorScheme = 'default';

/**
 * The identity a chart root resolves under. `null` is the one root the design
 * system does not own: the published imperative bridge, whose body is app-owned
 * and whose paint is categorical by construction of that bridge's own API.
 */
export type ChartPaintFamily = ChartFamilyId | null;

export interface ChartPaintRequest {
  readonly family: ChartPaintFamily;
  /** The component prop. Highest precedence. */
  readonly scheme?: ChartColorScheme;
  /** The token decision. */
  readonly tokenScheme?: ChartColorScheme;
  /** The public `colors` prop, honoured only when the registry row says so. */
  readonly override?: readonly string[];
}

export interface ChartCategoricalPaint {
  /** Exactly CHART_CATEGORICAL_SIZE consumption expressions. */
  readonly slots: readonly string[];
  /** THE modulus. The only place the paint slot is computed. */
  slotIndexFor(seriesIndex: number): number;
  /** slots[slotIndexFor(i)] -- never indexed by hand. */
  paintFor(seriesIndex: number): string;
  /** null when the registry row has cadenceSize === null. */
  cadenceIndexFor(seriesIndex: number): number | null;
}

export interface ChartSequentialPaint {
  readonly stops: readonly [string, string];
  /**
   * How many discrete stops the ramp is quantized into. `Infinity` when the
   * family interpolates continuously, which is what `heat-map` measurably does
   * while `calendar-heat-map` quantizes.
   */
  readonly steps: number;
  stopFor(t: number): string;
}

export interface ChartSemanticPaint {
  /** The family's closed tone domain, in declaration order. */
  readonly tones: readonly string[];
  /** The chained expression for one tone. A tone outside the domain is refused. */
  toneFor(tone: string): string;
}

export interface ChartPaintRootAttributes {
  readonly 'data-chart-color-scheme': ChartColorScheme;
  readonly 'data-chart-paint-model': ChartPaintModel;
}

export interface ChartPaintDecision {
  readonly family: ChartPaintFamily;
  readonly model: ChartPaintModel;
  /** prop > token > 'default'. This value is what gets stamped. */
  readonly scheme: ChartColorScheme;
  /** Present only when model === 'categorical'. */
  readonly categorical: ChartCategoricalPaint | null;
  /** Present only when model === 'sequential'. */
  readonly sequential: ChartSequentialPaint | null;
  /** Present only when model === 'semantic'. */
  readonly semantic: ChartSemanticPaint | null;
  /** The attributes the family MUST stamp on its renderer root. */
  readonly rootAttributes: ChartPaintRootAttributes;
  /** True when `override` was supplied AND the registry honours it. */
  readonly overridden: boolean;
}

export interface ChartMaterializedPaint {
  readonly scheme: ChartColorScheme;
  readonly resolved: readonly string[];
}

/**
 * The two-stop ramps the sequential families measurably use today. The high
 * stop is the active scheme's first categorical slot, so a tenant palette
 * reaches a ramp through the same chain a bar reaches a slot; the low stop is
 * the family's own surface token.
 */
const SEQUENTIAL_SEEDS: Readonly<
  Partial<Record<ChartFamilyId, { readonly low: string; readonly steps: number }>>
> = Object.freeze({
  'heat-map': Object.freeze({
    low: 'var(--ds-color-info-bg)',
    steps: Number.POSITIVE_INFINITY,
  }),
  'calendar-heat-map': Object.freeze({
    low: 'var(--ds-color-bg-tertiary)',
    steps: 5,
  }),
});

/**
 * The tone domains the `semantic` families paint, each tone with the root it
 * means. A tone is a MEANING, not a slot: the scheme tiers are deliberately
 * absent, so switching to `monochrome` cannot turn a gauge's danger band into a
 * shade of blue. The order is the order each family paints its tones in.
 */
const SEMANTIC_TONES: Readonly<
  Partial<Record<ChartFamilyId, Readonly<Record<string, string>>>>
> = Object.freeze({
  gauge: Object.freeze({
    error: 'var(--ds-color-error)',
    warning: 'var(--ds-color-warning)',
    success: 'var(--ds-color-success)',
    needle: 'var(--ds-color-text-primary)',
  }),
  waterfall: Object.freeze({
    increase: 'var(--ds-color-success)',
    decrease: 'var(--ds-color-error)',
    total: 'var(--ds-color-primary)',
  }),
  bullet: Object.freeze({
    poor: 'var(--ds-color-primary-200)',
    satisfactory: 'var(--ds-color-primary-100)',
    good: 'var(--ds-color-primary-50)',
    value: 'var(--ds-color-text-primary)',
    target: 'var(--ds-color-error)',
  }),
});

/** Separator for the decision cache key. No family id or scheme contains it. */
const CACHE_KEY_SEPARATOR = '::';

function refuse(message: string): never {
  throw new Error(`resolveChartPaint: ${message}`);
}

function assertSeriesIndex(seriesIndex: number): void {
  if (!Number.isInteger(seriesIndex) || seriesIndex < 0) {
    refuse(`series index must be a non-negative integer; received ${String(seriesIndex)}`);
  }
}

/** Fill exactly CHART_CATEGORICAL_SIZE slots, cycling a shorter source. */
function toSlots(source: readonly string[]): readonly string[] {
  if (source.length === 0) refuse('a categorical palette cannot be empty');
  const slots: string[] = [];
  for (let index = 0; index < CHART_CATEGORICAL_SIZE; index += 1) {
    slots.push(source[index % source.length] as string);
  }
  return Object.freeze(slots);
}

function createCategoricalPaint(
  source: readonly string[],
  cadenceSize: number | null,
): ChartCategoricalPaint {
  const slots = toSlots(source);
  const slotIndexFor = (seriesIndex: number): number => {
    assertSeriesIndex(seriesIndex);
    return seriesIndex % CHART_CATEGORICAL_SIZE;
  };
  return Object.freeze({
    slots,
    slotIndexFor,
    paintFor: (seriesIndex: number) => slots[slotIndexFor(seriesIndex)] as string,
    cadenceIndexFor: (seriesIndex: number) => {
      assertSeriesIndex(seriesIndex);
      return cadenceSize === null ? null : seriesIndex % cadenceSize;
    },
  });
}

function createSequentialPaint(
  low: string,
  high: string,
  steps: number,
): ChartSequentialPaint {
  const stops: readonly [string, string] = Object.freeze([low, high] as [string, string]);
  return Object.freeze({
    stops,
    steps,
    stopFor: (t: number) => {
      if (!Number.isFinite(t)) refuse(`ramp position must be finite; received ${String(t)}`);
      const clamped = Math.min(1, Math.max(0, t));
      const quantized = Number.isFinite(steps)
        ? steps <= 1
          ? 0
          : Math.round(clamped * (steps - 1)) / (steps - 1)
        : clamped;
      const percentage = Math.round(quantized * 1e4) / 1e2;
      return `color-mix(in oklab, ${high} ${percentage}%, ${low})`;
    },
  });
}

/**
 * A tone read is `var(--<namespace>-<tone>, <root>)`: the family's own channel
 * above the root it means, which is the cascade law's chain shape. The channel
 * is consumption-only, so an unauthored tone paints exactly its root.
 */
function createSemanticPaint(
  namespace: string,
  tones: Readonly<Record<string, string>>,
): ChartSemanticPaint {
  const names = Object.freeze(Object.keys(tones));
  const expressions = Object.freeze(
    Object.fromEntries(
      names.map((tone) => [tone, `var(--${namespace}-${tone}, ${tones[tone] as string})`]),
    ) as Record<string, string>,
  );
  return Object.freeze({
    tones: names,
    toneFor: (tone: string) => {
      const expression = expressions[tone];
      if (expression === undefined) {
        refuse(`tone "${String(tone)}" is outside the domain [${names.join(', ')}]`);
      }
      return expression;
    },
  });
}

/** What the resolver needs from a root identity. A registry row satisfies it. */
type ChartPaintIdentity = Pick<
  ChartFamilyRow,
  'paintModel' | 'cadenceSize' | 'honoursColorsProp'
> & { readonly id: ChartPaintFamily };

const UNOWNED_ROOT: ChartPaintIdentity = Object.freeze({
  id: null,
  paintModel: 'categorical',
  cadenceSize: null,
  honoursColorsProp: false,
});

/** Registered rows only: an inherited Object.prototype key is not a family. */
function rowFor(family: ChartPaintFamily): ChartPaintIdentity {
  if (family === null) return UNOWNED_ROOT;
  if (!isChartFamilyId(family)) refuse(`unknown family "${String(family)}"`);
  return CHART_FAMILY_REGISTRY[family];
}

function buildDecision(request: ChartPaintRequest): ChartPaintDecision {
  const familyRow = rowFor(request.family);

  const scheme = request.scheme ?? request.tokenScheme ?? CHART_DEFAULT_SCHEME;
  const override = request.override;
  const overridden = Boolean(override && override.length > 0) && familyRow.honoursColorsProp;
  const chain = resolveChartSeriesPaint(scheme);

  const categorical =
    familyRow.paintModel === 'categorical'
      ? createCategoricalPaint(
          overridden ? (override as readonly string[]) : chain,
          familyRow.cadenceSize,
        )
      : null;

  const seed = request.family === null ? undefined : SEQUENTIAL_SEEDS[request.family];
  const sequential =
    familyRow.paintModel === 'sequential' && seed
      ? createSequentialPaint(seed.low, chain[0] as string, seed.steps)
      : null;

  const family = request.family;
  const toneDomain = family === null ? undefined : SEMANTIC_TONES[family];
  const semantic =
    familyRow.paintModel === 'semantic' && family !== null && toneDomain
      ? createSemanticPaint(CHART_FAMILY_REGISTRY[family].namespace, toneDomain)
      : null;

  return Object.freeze({
    family: familyRow.id,
    model: familyRow.paintModel,
    scheme,
    categorical,
    sequential,
    semantic,
    rootAttributes: Object.freeze({
      'data-chart-color-scheme': scheme,
      'data-chart-paint-model': familyRow.paintModel,
    }),
    overridden,
  });
}

/**
 * Cache of the 18 x 5 unoverridden decisions. Bounded by construction, so a
 * caller that resolves on every render still gets one stable object per
 * family/scheme pair. Overridden decisions carry caller-supplied colours and
 * are built fresh rather than keyed into an unbounded map.
 */
const decisionCache = new Map<string, ChartPaintDecision>();

/**
 * Resolve a family's paint decision. Callable outside React -- the gates, the
 * suites and the export path use this door rather than a second walk.
 */
export function resolveChartPaint(request: ChartPaintRequest): ChartPaintDecision {
  const familyRow = rowFor(request.family);

  const wantsOverride = Boolean(request.override && request.override.length > 0);
  if (wantsOverride && familyRow.honoursColorsProp) return buildDecision(request);

  const scheme = request.scheme ?? request.tokenScheme ?? CHART_DEFAULT_SCHEME;
  const key = `${String(request.family)}${CACHE_KEY_SEPARATOR}${scheme}`;
  const cached = decisionCache.get(key);
  if (cached) return cached;
  const decision = buildDecision({ family: request.family, scheme });
  decisionCache.set(key, decision);
  return decision;
}

/**
 * The semantic arm of a decision whose family declares that model. Refuses
 * rather than falling back: a tone read that silently lost its chain would
 * paint correctly today and drop a tenant's authored tone forever.
 */
export function requireChartSemanticPaint(decision: ChartPaintDecision): ChartSemanticPaint {
  if (decision.semantic === null) {
    refuse(
      `family "${String(decision.family)}" has no semantic tones; its paint model is "${decision.model}"`,
    );
  }
  return decision.semantic;
}

function paintOwnerOf(owner: Element | null | undefined): CssColorOwner | null {
  if (!owner || typeof owner !== 'object' || !('style' in owner)) return null;
  return owner as CssColorOwner;
}

/**
 * The export door: turn a decision's consumption expressions into concrete
 * colours against one live element. An expression that cannot resolve comes
 * back as an empty string rather than a manufactured partial value; the caller
 * decides what an unresolvable slot means for its output format.
 *
 * The door materializes slots and ramp stops only. A `semantic` family's tones
 * are read from `decision.semantic`, and a `single` family has neither.
 */
export function materializeChartPaint(
  decision: ChartPaintDecision,
  owner: Element,
): ChartMaterializedPaint {
  const paintOwner = paintOwnerOf(owner);
  const expressions =
    decision.categorical?.slots ?? (decision.sequential ? decision.sequential.stops : []);
  return Object.freeze({
    scheme: decision.scheme,
    resolved: Object.freeze(
      expressions.map((expression) => resolveCssColor(expression, paintOwner)),
    ),
  });
}
