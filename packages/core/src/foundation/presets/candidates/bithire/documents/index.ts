/**
 * @fileoverview The three BitHire identity candidates of WO-DER-07, each a
 * complete `ThemeDecisions` set over the approved kit and nothing else.
 *
 * A candidate is a v2 document: the 29 decisions, every value inside its closed
 * domain, no authored channel and no `--ds-*` override. Documents and manifest
 * are JSON so the probe, the showroom probe-ground and the owner's digest all
 * read the same bytes.
 *
 * @module Foundation/Presets/Candidates/Bithire/Documents
 * @category Types
 * @package @rottay/design-system
 */

import {
  assertTenantThemeDocumentV2,
  type TenantThemeDocumentV2,
} from "@/contracts/theme/presentation/document";
import { sha256Utf8 } from "@/foundation/kernel/cryptography/sha-256";

import editorialQuiet from "./editorial-quiet/index.json";
import manifest from "./manifest/index.json";
import productDense from "./product-dense/index.json";
import warmHumanist from "./warm-humanist/index.json";

export type BitHireCandidateId =
  | "editorial-quiet"
  | "product-dense"
  | "warm-humanist";

export interface BitHireIdentityCandidate {
  readonly id: BitHireCandidateId;
  /** What the owner is choosing between, in one line. */
  readonly title: string;
  /** The product posture this decision set argues for. */
  readonly intent: string;
  /** The tenant slug the candidate is compiled and mounted under. */
  readonly slug: string;
  readonly document: TenantThemeDocumentV2;
}

const DOCUMENTS: Readonly<Record<string, unknown>> = Object.freeze({
  "editorial-quiet": editorialQuiet,
  "product-dense": productDense,
  "warm-humanist": warmHumanist,
});

export const BITHIRE_IDENTITY_CANDIDATES: readonly BitHireIdentityCandidate[] =
  Object.freeze(
    manifest.candidates.map((row) => {
      const document = DOCUMENTS[row.id];
      if (document === undefined) {
        throw new Error(
          `[design-system] BitHire candidate ${JSON.stringify(row.id)} is in the manifest with no document beside it`
        );
      }
      return Object.freeze({
        id: row.id as BitHireCandidateId,
        title: row.title,
        intent: row.intent,
        slug: row.slug,
        document: assertTenantThemeDocumentV2(document),
      });
    })
  );

export const BITHIRE_CANDIDATE_IDS: readonly BitHireCandidateId[] =
  Object.freeze(BITHIRE_IDENTITY_CANDIDATES.map((row) => row.id));

export function bithireIdentityCandidate(
  id: string
): BitHireIdentityCandidate {
  const found = BITHIRE_IDENTITY_CANDIDATES.find((row) => row.id === id);
  if (!found) {
    throw new Error(
      `[design-system] no BitHire identity candidate ${JSON.stringify(id)}; the set is ${BITHIRE_CANDIDATE_IDS.join(" | ")}`
    );
  }
  return found;
}

/**
 * The digest the owner records against their pick.
 *
 * Taken over the canonical JSON of the DECISION DOCUMENT rather than the file,
 * so reformatting keeps a candidate's identity and changing a decision cannot.
 */
export function bithireCandidateDigest(
  candidate: BitHireIdentityCandidate | string
): string {
  const row =
    typeof candidate === "string" ? bithireIdentityCandidate(candidate) : candidate;
  return `sha256-${sha256Utf8(JSON.stringify(row.document))}`;
}
