/** Each pin: unit path, file count, byte total and unitDigest of the in-tree unit the archive replaces. */
import { RET03_EVIDENCE_SNAPSHOT } from '../index.mjs';

export { RET03_EVIDENCE_SNAPSHOT };

/** The modern-rescue proofs, checkpoints and archive ledgers. */
export const RET03_MODERN_RESCUE_PIN = Object.freeze({
  unit: 'packages/core/artifacts/quality/programs/modern-rescue',
  files: 366,
  bytes: 64201220,
  unitDigest: '4c8ebccc9fa756cbe71199c95f9e5e5a1de8b9cc1081e2f05f9b5d8c562863aa',
});

/** The sealed customization manifest. */
export const RET03_SEALED_MANIFEST_PIN = Object.freeze({
  unit: 'docs/history/inventories/customization-manifest',
  files: 281,
  bytes: 39238078,
  unitDigest: 'c62f8559add107fe48fc93468df233ba23f05ccf85720e940940bee255b6a5c6',
});
