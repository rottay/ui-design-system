export interface DrillVars { '--ds-drill-a': string; '--ds-drill-b': string }
export interface DrillOut { vars: DrillVars }
declare function readRuntimeCurve(name: string): string;
function buildDrillVars(x: number, curve: string): DrillVars { return { '--ds-drill-a': `${x}px`, '--ds-drill-b': readRuntimeCurve(curve) }; }
export function useDrill(x: number, curve: string): DrillOut { return { vars: buildDrillVars(x, curve) }; }
