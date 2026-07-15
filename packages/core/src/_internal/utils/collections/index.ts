/**
 * Read an array value by integer position without requiring `Array.prototype.at`.
 *
 * The helper keeps the core package compatible with its ES2020 runtime target
 * while preserving the useful negative-index behavior of `at`.
 */
export function arrayValueAt<T>(values: readonly T[], integer: number): T | undefined {
  if (!Number.isInteger(integer)) return undefined;

  const normalized = integer < 0 ? values.length + integer : integer;
  if (normalized < 0 || normalized >= values.length) return undefined;

  return values[normalized];
}
