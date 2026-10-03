import { report } from '../../resolve/findings/index.mjs';
import { referencesOf, symbolKey, symbolSites } from '../../resolve/usages/index.mjs';

export function reportSymbolSites(context, analysis, entries, reason) {
  const findings = [];
  const sites = symbolSites(analysis, context.map.memberRoots);
  for (const entry of entries) {
    const name = entry.member ? `${entry.symbol}.${entry.member}` : entry.symbol;
    for (const site of sites.get(symbolKey(entry.subpath, name)) ?? []) {
      const uses = site.type === 'import' ? `; ${referencesOf(analysis, site.node).length} reference(s) in this file` : '';
      findings.push(report(analysis, entry, site.node, entry.reason ?? reason,
        `\`${name}\` is retired from \`${entry.subpath}\`${uses}. ${entry.guidance}`));
    }
  }
  return findings;
}

/**
 * A retired export nothing public replaces. No rewrite: every design-system-resolved use is reported
 * with the changeset's guidance, and the import is never pointed at a private module.
 */
export const transform = {
  class: 'symbol-removed-no-replacement',
  reportOnly: true,
  run(context, analysis, entries) {
    return reportSymbolSites(context, analysis, entries, 'no-public-replacement');
  },
};
