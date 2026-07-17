import type { IconProvenance } from '..';
import { GENERATED_ICON_CORPUS_VERSION } from '../../semantic/corpus/generated';

/** Auditable source record for the fixed semantic corpus adapter. */
export const ICON_PROVENANCE: IconProvenance = Object.freeze({
  corpusVersion: GENERATED_ICON_CORPUS_VERSION,
  supplier: 'Phosphor Icons',
  packageName: '@phosphor-icons/react',
  packageVersion: '2.1.10',
  license: 'MIT',
  rendering: 'local-ssr',
});
