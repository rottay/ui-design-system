import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const skin = readFileSync(
  resolve(
    process.cwd(),
    "src/foundation/tokens/css/presentation/components/skin/collection-shell.css"
  ),
  "utf8"
);

describe("WorkspaceShell anatomy contract", () => {
  it("projects flat and floating layout anatomy through shared tokens", () => {
    expect(skin).toContain('[data-anatomy-layout="flat"]');
    expect(skin).toContain('[data-anatomy-layout="floating"]');
    expect(skin).toContain("border-radius: var(--ds-card-radius");
    expect(skin).toContain("border-radius: var(--ds-radius-none");
    expect(skin).toContain("box-shadow: var(--ds-shadow-none");
    expect(skin).toContain("border-radius: inherit;");
  });

  it("remains tenant-neutral and contains no fixed shell radii", () => {
    expect(skin).not.toMatch(/(?:bithire|themanagement)/i);
    expect(skin).not.toMatch(/border-radius:\s*(?:18|24)px/);
  });
});
