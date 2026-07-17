/** Creates the stable opaque key used by controlled line-renderer interaction. */
export function createSvgLineDatumKey(seriesId: string, pointId: string): string {
  return JSON.stringify([seriesId, pointId]);
}
