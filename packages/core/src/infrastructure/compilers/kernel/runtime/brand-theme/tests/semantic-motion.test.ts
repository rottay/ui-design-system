import { describe, expect, it } from "vitest";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import { compileBrandTheme } from "../index";

describe("semantic motion cadence", () => {
  it("derives intent-based motion from the bounded brand cadence", () => {
    const brandTheme: BrandTheme = {
      id: "motion-proof",
      name: "Motion proof",
      motion: { entranceDuration: 240 },
    };

    const compiled = compileBrandTheme({ brandTheme, tenantSlug: "proof" });
    expect(compiled.cssVariables).toMatchObject({
      "--ds-motion-instant": "120ms",
      "--ds-motion-calm": "240ms",
      "--ds-motion-deliberate": "320ms",
      "--ds-motion-feedback":
        "calc(var(--ds-motion-instant) * var(--ds-motion-duration-scale, 1))",
      "--ds-motion-disclosure":
        "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))",
      "--ds-motion-resize":
        "calc(var(--ds-motion-calm) * var(--ds-motion-duration-scale, 1))",
      "--ds-motion-rearrange":
        "calc(var(--ds-motion-deliberate) * var(--ds-motion-duration-scale, 1))",
      "--ds-motion-ease-move": "var(--ds-ease-standard)",
    });
  });
});
