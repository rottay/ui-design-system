export const CEILINGS_BASELINE_RELATIVE = 'scripts/boundaries/public-entrypoint-boundary-gate/public-entrypoint-boundary-gate.ceilings.baseline.json';

export function isValidCeiling(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function evaluateCeilings(live, baseline) {
  if (!baseline || typeof baseline.ceilings !== 'object' || baseline.ceilings === null
    || Array.isArray(baseline.ceilings)) {
    return ['el ancla de techos no existe o no tiene `ceilings`'];
  }
  const failures = [];
  for (const [subpath, value] of Object.entries(live)) {
    const anchored = baseline.ceilings[subpath];
    if (!isValidCeiling(value)) {
      failures.push(`${subpath}: el techo vivo ${JSON.stringify(value)} no es un entero positivo — un techo corrupto no se puede comparar`);
      continue;
    }
    if (anchored !== undefined && !isValidCeiling(anchored)) {
      failures.push(`${subpath}: el techo anclado ${JSON.stringify(anchored)} no es un entero positivo — el ancla esta corrupta y no gobierna nada`);
      continue;
    }
    if (anchored === undefined) {
      failures.push(`${subpath}: techo ${value} sin anclar en ${CEILINGS_BASELINE_RELATIVE} — un techo nuevo entra por revision, no por omision`);
      continue;
    }
    if (value > anchored) {
      failures.push(`${subpath}: techo ${anchored} -> ${value} SUBIO — se adelgaza el grafo, no el ancla. Si la subida esta autorizada, pedila por nombre: --write-baseline --widen --reason "..."`);
    } else if (value < anchored) {
      failures.push(`${subpath}: techo ${anchored} -> ${value} bajo — baja el ancla en el MISMO commit, con razon escrita: --write-baseline --reason "..."`);
    }
  }
  for (const [subpath, anchored] of Object.entries(baseline.ceilings)) {
    if (subpath in live) continue;
    failures.push(!isValidCeiling(anchored)
      ? `${subpath}: el ancla lo declara con ${JSON.stringify(anchored)}, que ni siquiera es un techo, y el manifest ya no le pone uno`
      : `${subpath}: el ancla lo declara y el manifest ya no le pone techo`);
  }
  return failures;
}
