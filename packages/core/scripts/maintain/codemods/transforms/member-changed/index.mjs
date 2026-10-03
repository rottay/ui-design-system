import { report } from '../../resolve/findings/index.mjs';
import { referencesOf, symbolKey, symbolSites } from '../../resolve/usages/index.mjs';

/**
 * A member of a published type or value changed (removed, renamed, narrowed). Finding the member's uses needs
 * type inference the kit does not do, so every design-system-resolved use of the owning export is reported.
 */
export const transform = {
  class: 'member-changed',
  reportOnly: true,
  run(context, analysis, entries) {
    const findings = [];
    const sites = symbolSites(analysis, context.map.memberRoots);
    for (const entry of entries) {
      const members = entry.members ?? (entry.member ? [entry.member] : []);
      const subject = members.length > 0
        ? `\`${entry.symbol}\` (${members.map((member) => `\`${member}\``).join(', ')})`
        : `\`${entry.symbol}\``;
      for (const site of sites.get(symbolKey(entry.subpath, entry.symbol)) ?? []) {
        const uses = site.type === 'import' ? `; ${referencesOf(analysis, site.node).length} reference(s) in this file` : '';
        findings.push(report(analysis, entry, site.node, 'member-changed',
          `${subject} changed on \`${entry.subpath}\`${uses}. ${entry.change} ${entry.guidance}`));
      }
    }
    return findings;
  },
};
