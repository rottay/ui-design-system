import { relative } from 'node:path';
import { collectDaisyClassConsumers } from '../../../../../libraries/engine/consumers/daisy-classes/index.mjs';
import { root } from '../context/paths/index.mjs';

// `DEBUG_DAISY_CONSUMERS=1` prints the per-file inventory behind
// `daisy.classConsumers`: every counted file, the classes it renders, and the
// exact site that renders each one -- the line, whether the string sat directly
// in the `className` (`className`), was reached by resolving a binding or map in
// the same file (`resolved`), or lives in another module entirely (`imported`).
// An `imported` site also prints the file it really lives in and the provenance
// chain: every declaration crossed to get there, which is the ONLY answer to
// "why is this file counted when the class is not in it". It reads the same scan
// the counter reads, so the inventory and the count cannot disagree, and
// printing it moves nothing.
function printDaisyConsumerInventory(files) {
  if (process.env.DEBUG_DAISY_CONSUMERS) {
    const inventory = collectDaisyClassConsumers(files);
    console.error(
      `[daisy-consumers] ${inventory.length} consumer(s) of ${new Set(files).size} modern file(s)`,
    );
    for (const { file, tokens, sites, modifiersWithoutBase } of inventory) {
      console.error(`[daisy-consumers] ${relative(root, file)}  tokens=${tokens.join(' ')}`);
      // A Daisy modifier with no base class in the same file. It still counts --
      // the rule is a real standalone declaration and the base can come from a
      // parent -- but it is the shape a drain can delete outright, so it is named
      // rather than left for the reader to spot by diffing against the manifest.
      for (const { token, base } of modifiersWithoutBase) {
        console.error(
          `[daisy-consumers]     ! ${token} renders without its base class '${base}'`,
        );
      }
      for (const site of sites) {
        const origin = site.file === file ? '' : `  in ${relative(root, site.file)}`;
        console.error(
          `[daisy-consumers]     L${site.line} ${site.kind} ${site.token}${origin}  ${site.text}`,
        );
        if (site.chain.length > 0) {
          const chain = site.chain.map((link) => `${relative(root, link.file)}#${link.symbol}`);
          console.error(`[daisy-consumers]         via ${[relative(root, file), ...chain].join(' -> ')}`);
        }
      }
    }
  }
}

export {
  printDaisyConsumerInventory,
};
