/**
 * `chrome.shell.{bg,border,overlay,shadow}` compiles to one tenant door name per
 * field. Both consumers take the value from that name, and `.ds-workspace-frame`
 * forwards it into its own names at its own selector, so the compiler writes no
 * frame name. Nothing is emitted for a field nobody stated.
 */
import { describe, expect, it } from "vitest";

import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";
import { chromeToVariables } from "..";

const WORKSPACE_NAMES = [
  "--ds-workspace-shell-bg",
  "--ds-workspace-shell-border",
  "--ds-workspace-shell-overlay",
  "--ds-workspace-shell-shadow",
  "--ds-workspace-frame-bg",
  "--ds-workspace-frame-border",
  "--ds-workspace-frame-overlay",
  "--ds-workspace-frame-shadow",
] as const;

const workspaceVars = (chrome: BrandChrome | undefined) =>
  Object.fromEntries(
    Object.entries(chromeToVariables(chrome)).filter(([name]) =>
      (WORKSPACE_NAMES as readonly string[]).includes(name)
    )
  );

describe("chrome.shell workspace ground, border and elevation", () => {
  it("writes a stated value to its door name and to no frame name", () => {
    expect(
      workspaceVars({
        shell: {
          bg: "linear-gradient(180deg, #101820 0%, #0b1016 100%)",
          border: "#2a3440",
          shadow: "0 12px 32px rgba(0, 0, 0, 0.24)",
        },
      })
    ).toEqual({
      "--ds-workspace-shell-bg": "linear-gradient(180deg, #101820 0%, #0b1016 100%)",
      "--ds-workspace-shell-border": "#2a3440",
      "--ds-workspace-shell-shadow": "0 12px 32px rgba(0, 0, 0, 0.24)",
    });
  });

  it("moves one name for one statement", () => {
    expect(workspaceVars({ shell: { border: "#2a3440" } })).toEqual({
      "--ds-workspace-shell-border": "#2a3440",
    });
  });

  it("keeps the wash on the single shared overlay name", () => {
    expect(workspaceVars({ shell: { overlay: "none" } })).toEqual({
      "--ds-workspace-shell-overlay": "none",
    });
  });

  it("emits no workspace name for an absent document, shell or field", () => {
    expect(workspaceVars(undefined)).toEqual({});
    expect(workspaceVars({})).toEqual({});
    expect(workspaceVars({ shell: {} })).toEqual({});
    expect(workspaceVars({ shell: { gridSize: "28px", commandFont: "monospace" } })).toEqual({});
    expect(workspaceVars({ layout: { headerHeight: "64px" } })).toEqual({});
  });
});
