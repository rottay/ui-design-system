import type { IconProvenance } from '../../../glyphs/foundation/contracts';
import { GENERATED_ICON_CORPUS_VERSION } from '../../generated/corpus';

/** Auditable source record for the fixed semantic corpus adapter. */
export const ICON_PROVENANCE: IconProvenance = Object.freeze({
  corpusVersion: GENERATED_ICON_CORPUS_VERSION,
  supplier: 'Phosphor Icons',
  packageName: '@phosphor-icons/react',
  packageVersion: '2.1.10',
  license: 'MIT',
  rendering: 'local-ssr',
});
