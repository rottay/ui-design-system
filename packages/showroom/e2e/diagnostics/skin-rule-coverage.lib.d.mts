// Type declarations for the plain-ESM skin-rule collector so the Playwright
// spec and any TS consumer import it with real types (no @ts-expect-error).

export type SkinRule = {
  engine: string;
  file: string;
  selector: string;
  probe: string;
  skeleton: string;
};

export const SKIN_DIRS: ReadonlyArray<readonly [string, string]>;
export function toProbe(selector: string): string | null;
export function toSkeleton(probe: string): string | null;
export function collectRules(): SkinRule[];
