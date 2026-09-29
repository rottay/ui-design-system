"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * One query key the switch may set: its admitted values and the value anything else becomes.
 * An empty resolved value leaves the key off the URL, so an optional axis can be unset.
 */
export interface ProbeCellAxis {
  readonly values: readonly string[];
  readonly fallback: string;
}

export interface ProbeCellSwitchProps {
  /** The `window` hook a spec calls to move the page to another cell. */
  readonly hook: string;
  readonly route: string;
  readonly axes: Readonly<Record<string, ProbeCellAxis>>;
}

/** Moves the route to another cell in place; the server page re-grounds from the new query. */
export function ProbeCellSwitch({ hook, route, axes }: ProbeCellSwitchProps) {
  const router = useRouter();
  useEffect(() => {
    const probeWindow = window as unknown as Record<string, unknown>;
    probeWindow[hook] = (next: Record<string, string>) => {
      const params = new URLSearchParams(
        Object.entries(axes)
          .map(([key, axis]) => [
            key,
            axis.values.includes(next[key] ?? "") ? (next[key] as string) : axis.fallback,
          ])
          .filter(([, value]) => value !== ""),
      );
      router.replace(`${route}?${params.toString()}`, { scroll: false });
    };
    return () => {
      delete probeWindow[hook];
    };
  }, [hook, route, axes, router]);
  return null;
}
