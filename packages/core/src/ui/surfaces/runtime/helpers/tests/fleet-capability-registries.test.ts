import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { SurfaceCapabilityKind, SurfaceCapabilityRegistration } from '../../../foundation/contracts';
import { resolveSurfaceCapabilityRegistry } from '..';

interface FleetEntry {
  kind: SurfaceCapabilityKind;
  id: string;
  source: string;
}

interface FleetCensus {
  app: string;
  counts: Record<SurfaceCapabilityKind, number>;
  entries: FleetEntry[];
}

function loadFleetCensus(app: string): FleetCensus {
  const file = path.resolve(
    process.cwd(),
    '../../test-artifacts/architecture/arc-11',
    `${app}.surface-capabilities.generated.json`,
  );
  return JSON.parse(readFileSync(file, 'utf8')) as FleetCensus;
}

describe.each(['app-bithire', 'app-evnto', 'app-platform'])('%s generated capability registry', (app) => {
  it('preserves 100% of every registered capability kind under all access', () => {
    const census = loadFleetCensus(app);
    expect(Object.values(census.counts).every((count) => count > 0)).toBe(true);

    const bySource = new Map<string, Map<string, SurfaceCapabilityRegistration>>();
    for (const entry of census.entries) {
      const registrations = bySource.get(entry.source) ?? new Map();
      registrations.set(`${entry.kind}:${entry.id}`, { kind: entry.kind, id: entry.id });
      bySource.set(entry.source, registrations);
    }

    for (const registrationsById of bySource.values()) {
      const registrations = [...registrationsById.values()];
      expect(resolveSurfaceCapabilityRegistry(registrations, { mode: 'all' })).toEqual(registrations);
    }
  });
});
