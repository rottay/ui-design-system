import type { CSSProperties } from "react";

import type { FeaturePictogramName } from "./registry";

export type FeaturePictogramSizeToken = "sm" | "md" | "lg" | "xl";
export type FeaturePictogramSize = FeaturePictogramSizeToken | number;
export type FeaturePictogramTone =
  | "brand"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "ai";

interface FeaturePictogramVisualProps {
  name: FeaturePictogramName;
  size?: FeaturePictogramSize;
  tone?: FeaturePictogramTone;
  className?: string;
  style?: CSSProperties;
  id?: string;
  "aria-describedby"?: string;
  "data-testid"?: string;
}

type LabeledFeaturePictogram = {
  label: string;
  decorative?: false;
};

type DecorativeFeaturePictogram = {
  label?: never;
  decorative: true;
};

export type FeaturePictogramProps = FeaturePictogramVisualProps &
  (LabeledFeaturePictogram | DecorativeFeaturePictogram);

export interface FeaturePictogramProvenance {
  readonly name: FeaturePictogramName;
  readonly source: "rottay-original";
  readonly license: "Rottay internal product asset";
  readonly rendering: "local-svg-ssr";
  readonly viewBox: "0 0 96 96";
  readonly authoredVersion: 1;
}
