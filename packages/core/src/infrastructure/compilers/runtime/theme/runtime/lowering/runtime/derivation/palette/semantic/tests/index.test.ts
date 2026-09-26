import { describe, expect, it } from "vitest";

import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { derivePaletteChannels } from "../..";
import { derivePaletteBorderHover } from "..";

describe("the hover edge", () => {
  it("is one neutral step past the rest edge, as a chain, never a literal", () => {
    expect(derivePaletteBorderHover()).toEqual({
      "--ds-color-border-hover": "var(--ds-color-neutral-400)",
    });
  });

  it("is produced by the palette family for any palette", () => {
    const vars = derivePaletteChannels(
      { id: "t", name: "T", palette: { primaryColor: "#2F6B9A" } } as FlatTheme,
      {},
      "light"
    );
    expect(vars["--ds-color-border-hover"]).toBe("var(--ds-color-neutral-400)");
  });

  it("stays on the ramp when the palette authors its own rest edge", () => {
    const vars = derivePaletteChannels(
      { id: "t", name: "T", palette: { borderSecondaryColor: "#123456" } } as FlatTheme,
      {},
      "light"
    );
    expect(vars["--ds-color-border-secondary"]).toBe("#123456");
    expect(vars["--ds-color-border-hover"]).toBe("var(--ds-color-neutral-400)");
  });
});
