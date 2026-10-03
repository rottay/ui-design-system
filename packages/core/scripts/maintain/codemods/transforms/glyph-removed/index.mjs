import { reportSymbolSites } from '../symbol-removed-no-replacement/index.mjs';

/**
 * A retired vendor-named glyph. The successor is a semantic role chosen by intent and no authored
 * glyph -> role map exists, so the class is report-only: each design-system-resolved binding is listed.
 */
export const transform = {
  class: 'glyph-removed',
  reportOnly: true,
  run(context, analysis, entries) {
    return reportSymbolSites(context, analysis, entries, 'glyph-role-map-absent');
  },
};
