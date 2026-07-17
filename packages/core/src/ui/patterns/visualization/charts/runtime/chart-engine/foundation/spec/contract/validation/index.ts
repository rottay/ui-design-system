import type {
  ChartGrammar,
  ChartGrammarChannels,
  ChartGrammarId,
  ChartInsightProvenance,
  ChartInsightSpec,
  ChartInsightSummary,
} from '..';

type UnknownRecord = Record<string, unknown>;

const GRAMMAR_IDS = new Set(['neutral', 'bithire', 'platform', 'evnto']);
const POSTURES = new Set([
  'neutral',
  'evidence-led',
  'control-plane',
  'editorial-temporal',
]);
const GRID_POSTURES = new Set([
  'balanced',
  'light-sparse',
  'precise-compact',
  'soft-temporal',
]);
const AXIS_POSTURES = new Set([
  'balanced',
  'border-led',
  'high-contrast-compact',
  'soft-editorial',
]);
const MARK_POSTURES = new Set([
  'balanced',
  'human-rounded',
  'technical-sharp',
  'tactile-temporal',
]);
const ANNOTATION_POSTURES = new Set([
  'general',
  'evidence-decision',
  'threshold-policy-incident',
  'milestone-capacity-schedule',
]);
const MOTION_POSTURES = new Set([
  'calm',
  'calm-continuity',
  'fast-operational',
  'composed-editorial',
]);

function isPlainRecord(value: unknown): value is UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * JSON data has enumerable value properties only. Requiring the exact key set
 * rejects accessors, symbols, non-enumerable payloads, and silent extensions.
 */
function hasExactDataKeys(
  value: UnknownRecord,
  expectedKeys: readonly string[],
): boolean {
  const keys = Reflect.ownKeys(value);
  if (keys.length !== expectedKeys.length) return false;

  const expected = new Set(expectedKeys);
  return keys.every((key) => {
    if (typeof key !== 'string' || !expected.has(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor !== undefined
      && descriptor.enumerable
      && Object.prototype.hasOwnProperty.call(descriptor, 'value');
  });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDenseIdentifierArray(
  value: unknown,
): value is readonly [string, ...string[]] {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
    return false;
  }
  if (value.length === 0) return false;

  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== value.length + 1
    || !keys.every((key) => key === 'length'
      || (typeof key === 'string' && /^\d+$/.test(key)))
  ) return false;

  const identifiers: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, index)) return false;
    const candidate = value[index];
    if (!isNonEmptyString(candidate)) return false;
    identifiers.push(candidate);
  }
  return new Set(identifiers).size === identifiers.length;
}

function isChartGrammarChannels(value: unknown): value is ChartGrammarChannels {
  if (!isPlainRecord(value)) return false;
  if (!hasExactDataKeys(value, [
    'categorical',
    'sequential',
    'diverging',
    'status',
  ])) return false;

  return typeof value.categorical === 'string'
    && /^chart\.palette\.categorical\.(neutral|bithire|platform|evnto)$/.test(
      value.categorical,
    )
    && typeof value.sequential === 'string'
    && /^chart\.palette\.sequential\.(neutral|bithire|platform|evnto)$/.test(
      value.sequential,
    )
    && typeof value.diverging === 'string'
    && /^chart\.palette\.diverging\.(neutral|bithire|platform|evnto)$/.test(
      value.diverging,
    )
    && value.status === 'chart.palette.status.semantic';
}

function isStringMember(value: unknown, members: ReadonlySet<string>): value is string {
  return typeof value === 'string' && members.has(value);
}

export function isChartGrammarId(value: unknown): value is ChartGrammarId {
  return isStringMember(value, GRAMMAR_IDS);
}

export function isChartGrammar(value: unknown): value is ChartGrammar {
  try {
    if (!isPlainRecord(value)) return false;
    if (!hasExactDataKeys(value, [
      'id',
      'posture',
      'channels',
      'grid',
      'axes',
      'marks',
      'annotations',
      'motion',
    ])) return false;

    if (
      !isChartGrammarId(value.id)
      || !isStringMember(value.posture, POSTURES)
      || !isChartGrammarChannels(value.channels)
      || !isStringMember(value.grid, GRID_POSTURES)
      || !isStringMember(value.axes, AXIS_POSTURES)
      || !isStringMember(value.marks, MARK_POSTURES)
      || !isStringMember(value.annotations, ANNOTATION_POSTURES)
      || !isStringMember(value.motion, MOTION_POSTURES)
    ) return false;

    return value.channels.categorical === `chart.palette.categorical.${value.id}`
      && value.channels.sequential === `chart.palette.sequential.${value.id}`
      && value.channels.diverging === `chart.palette.diverging.${value.id}`;
  } catch {
    return false;
  }
}

function isInsightBase(
  value: UnknownRecord,
  exactKeys: readonly string[],
): boolean {
  return hasExactDataKeys(value, exactKeys)
    && isNonEmptyString(value.id)
    && isNonEmptyString(value.label);
}

export function isChartInsightSpec(value: unknown): value is ChartInsightSpec {
  try {
    if (!isPlainRecord(value)) return false;

    switch (value.type) {
      case 'target':
        return isInsightBase(value, ['id', 'type', 'value', 'label'])
          && isFiniteNumber(value.value);
      case 'band':
        return isInsightBase(value, ['id', 'type', 'lower', 'upper', 'label'])
          && isFiniteNumber(value.lower)
          && isFiniteNumber(value.upper)
          && value.lower <= value.upper;
      case 'direct-label':
        return isInsightBase(value, ['id', 'type', 'datumId', 'label'])
          && isNonEmptyString(value.datumId);
      case 'event':
        return isInsightBase(value, ['id', 'type', 'at', 'label'])
          && (isNonEmptyString(value.at) || isFiniteNumber(value.at));
      default:
        return false;
    }
  } catch {
    return false;
  }
}

function isChartInsightProvenance(
  value: unknown,
): value is ChartInsightProvenance {
  if (!isPlainRecord(value)) return false;
  return hasExactDataKeys(value, ['sourceIds', 'methodId'])
    && isDenseIdentifierArray(value.sourceIds)
    && isNonEmptyString(value.methodId);
}

export function isChartInsightSummary(
  value: unknown,
): value is ChartInsightSummary {
  try {
    if (!isPlainRecord(value)) return false;
    if (!hasExactDataKeys(value, ['id', 'mode', 'text', 'provenance'])) return false;

    return isNonEmptyString(value.id)
      && (value.mode === 'computed' || value.mode === 'generated')
      && isNonEmptyString(value.text)
      && isChartInsightProvenance(value.provenance);
  } catch {
    return false;
  }
}
