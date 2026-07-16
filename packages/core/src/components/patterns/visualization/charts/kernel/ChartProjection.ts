/**
 * Semantic, renderer-agnostic projections for responsive chart experiences.
 *
 * Applications own the meaning of metrics, summaries, fields, and alternate
 * representations through stable identifiers. The design system only chooses
 * the projection declared for the current device class.
 */

export type ChartDeviceClass = 'desktop' | 'tablet' | 'phone';

interface ChartProjectionViewBase {
  /** Application-owned renderer registered for this semantic projection. */
  readonly rendererId: string;
}

export interface ChartFullProjectionView extends ChartProjectionViewBase {
  readonly mode: 'full';
}

export interface ChartMicroProjectionView extends ChartProjectionViewBase {
  readonly mode: 'micro';
  /** Stable identifier for the primary metric rendered by the application. */
  readonly metricId: string;
  /** Optional stable identifier for a compact trend representation. */
  readonly trendId?: string;
}

export interface ChartSummaryProjectionView extends ChartProjectionViewBase {
  readonly mode: 'summary';
  /** Stable identifier for an application-owned narrative or metric summary. */
  readonly summaryId: string;
}

export interface ChartRankedRowsProjectionView extends ChartProjectionViewBase {
  readonly mode: 'ranked-rows';
  /** Ordered, non-empty set of fields exposed by the row renderer. */
  readonly fieldIds: readonly [string, ...string[]];
}

export interface ChartTopNProjectionView extends ChartProjectionViewBase {
  readonly mode: 'top-n';
  /** Positive number of leading values retained by the renderer. */
  readonly n: number;
  /** How values outside the leading set are represented. */
  readonly remainder: 'aggregate' | 'summary';
}

export interface ChartAlternateProjectionView extends ChartProjectionViewBase {
  readonly mode: 'alternate';
}

/** JSON-safe semantic projection selected by a chart renderer. */
export type ChartProjectionView =
  | ChartFullProjectionView
  | ChartMicroProjectionView
  | ChartSummaryProjectionView
  | ChartRankedRowsProjectionView
  | ChartTopNProjectionView
  | ChartAlternateProjectionView;

/** A phone projection must reduce or replace the full chart representation. */
export type ChartPhoneProjectionView = Exclude<
  ChartProjectionView,
  ChartFullProjectionView
>;

/**
 * Serializable responsive policy. Tablet deliberately falls back to desktop;
 * phone is mandatory because a full desktop chart is never an implicit mobile
 * experience.
 */
export interface ChartProjectionSpec {
  readonly desktop: ChartProjectionView;
  readonly tablet?: ChartProjectionView;
  readonly phone: ChartPhoneProjectionView;
}

type UnknownRecord = Record<string, unknown>;

const VIEW_KEYS: Readonly<Record<ChartProjectionView['mode'], readonly string[]>> = {
  full: ['mode', 'rendererId'],
  micro: ['mode', 'rendererId', 'metricId', 'trendId'],
  summary: ['mode', 'rendererId', 'summaryId'],
  'ranked-rows': ['mode', 'rendererId', 'fieldIds'],
  'top-n': ['mode', 'rendererId', 'n', 'remainder'],
  alternate: ['mode', 'rendererId'],
};

const DEVICE_CLASSES: ReadonlySet<string> = new Set<ChartDeviceClass>([
  'desktop',
  'tablet',
  'phone',
]);

function isPlainRecord(value: unknown): value is UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: UnknownRecord, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Reflect.ownKeys(value).every(
    (key) => typeof key === 'string' && allowed.has(key),
  );
}

function isIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIdentifierList(
  value: unknown,
): value is readonly [string, ...string[]] {
  return Array.isArray(value) && value.length > 0 && value.every(isIdentifier);
}

function isChartProjectionView(value: unknown): value is ChartProjectionView {
  if (!isPlainRecord(value) || !isIdentifier(value.rendererId)) return false;

  const mode = value.mode;
  if (
    typeof mode !== 'string'
    || !Object.prototype.hasOwnProperty.call(VIEW_KEYS, mode)
  ) return false;
  if (!hasOnlyKeys(value, VIEW_KEYS[mode as ChartProjectionView['mode']])) return false;

  switch (mode) {
    case 'full':
    case 'alternate':
      return true;
    case 'micro':
      return isIdentifier(value.metricId)
        && (value.trendId === undefined || isIdentifier(value.trendId));
    case 'summary':
      return isIdentifier(value.summaryId);
    case 'ranked-rows':
      return isIdentifierList(value.fieldIds);
    case 'top-n':
      return Number.isSafeInteger(value.n)
        && (value.n as number) > 0
        && (value.remainder === 'aggregate' || value.remainder === 'summary');
    default:
      return false;
  }
}

function isChartProjectionSpec(value: unknown): value is ChartProjectionSpec {
  if (!isPlainRecord(value) || !hasOnlyKeys(value, ['desktop', 'tablet', 'phone'])) {
    return false;
  }

  return isChartProjectionView(value.desktop)
    && (value.tablet === undefined || isChartProjectionView(value.tablet))
    && isChartProjectionView(value.phone)
    && value.phone.mode !== 'full';
}

function invalidContract(subject: string): never {
  throw new TypeError(`[ChartProjection] Invalid ${subject}.`);
}

export function resolveChartProjection(
  spec: ChartProjectionSpec,
  deviceClass: 'phone',
): ChartPhoneProjectionView;
export function resolveChartProjection(
  spec: ChartProjectionSpec,
  deviceClass: Exclude<ChartDeviceClass, 'phone'>,
): ChartProjectionView;
export function resolveChartProjection(
  spec: ChartProjectionSpec,
  deviceClass: ChartDeviceClass,
): ChartProjectionView;
/**
 * Resolves a projection without consulting viewport, tenant, or renderer
 * state. Runtime checks reject malformed persisted/JavaScript input rather
 * than accidentally rendering a full chart on phone.
 */
export function resolveChartProjection(
  spec: ChartProjectionSpec,
  deviceClass: ChartDeviceClass,
): ChartProjectionView {
  if (!isChartProjectionSpec(spec)) invalidContract('projection spec');
  if (!DEVICE_CLASSES.has(deviceClass)) invalidContract('device class');

  if (deviceClass === 'phone') return spec.phone;
  if (deviceClass === 'tablet') return spec.tablet ?? spec.desktop;
  return spec.desktop;
}
