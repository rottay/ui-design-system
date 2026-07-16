import { FEATURE_PICTOGRAM_NAMES, type FeaturePictogramName } from "./registry";
import type { FeaturePictogramProvenance } from "./types";

export const FEATURE_PICTOGRAM_PROVENANCE: Readonly<
  Record<FeaturePictogramName, FeaturePictogramProvenance>
> = Object.freeze(
  Object.fromEntries(
    FEATURE_PICTOGRAM_NAMES.map((name) => [
      name,
      Object.freeze({
        name,
        source: "rottay-original",
        license: "Rottay internal product asset",
        rendering: "local-svg-ssr",
        viewBox: "0 0 96 96",
        authoredVersion: 1,
      } satisfies FeaturePictogramProvenance),
    ])
  ) as Record<FeaturePictogramName, FeaturePictogramProvenance>
);
