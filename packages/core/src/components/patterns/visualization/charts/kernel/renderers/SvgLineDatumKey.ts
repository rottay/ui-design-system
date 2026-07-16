/** Creates the stable opaque key used by controlled Line interaction. */
export function createSvgLineDatumKey(seriesId: string, pointId: string): string {
  return JSON.stringify([seriesId, pointId]);
}
