/** A route's awaited `searchParams`, as Next hands them to a server page. */
export type ProbeSearchParams = Record<string, string | string[] | undefined>;

/** The first value of one query key, or `null`. */
export function probeParam(params: ProbeSearchParams, key: string): string | null {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}
