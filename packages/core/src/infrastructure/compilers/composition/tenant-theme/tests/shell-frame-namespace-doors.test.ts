/**
 * `chrome.shell.{bg,border,overlay,shadow}` reaches WorkspaceShell and
 * `.ds-workspace-frame` through the public compile doors as one tenant door name
 * per field, the same name the frame forwards into its own at its own selector.
 *
 * Every case goes through a door a host calls: the v1 advanced document, the
 * v2 and v3 decision documents, and the studio draft, which is the only
 * transport that can state a mode-qualified `modes.<mode>.chrome` leaf.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  compileThemeIntent,
  compileTenantTheme,
  compileTenantThemeDocumentV2,
  draftPreviewThemeIntent,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
  validateTenantThemeDocument,
} from "@rottay/design-system/server";
import type {
  TenantThemeArtifact,
  TenantThemeDocument,
  TenantThemeDocumentV2,
  TenantThemeDocumentV3,
} from "@rottay/design-system/server";
import type { FlatTheme } from "@/foundation/contracts/composition/tenants/themes";
import { firstPartyFixture } from "@tests/support/theme-lowering";

const IDENTITY = {
  tenantId: "33333333-3333-4333-8333-333333333333",
  slug: "harbourline",
  verticalKey: "bithire",
  rowVersion: 3,
} as const;

const SHELL = {
  bg: "#101820",
  border: "#2A3440",
  shadow: "0 12px 32px rgba(0, 0, 0, 0.24)",
  overlay: "none",
} as const;

const DARK_SHELL = {
  bg: "#05080C",
  border: "#1B232C",
  shadow: "0 16px 40px rgba(0, 0, 0, 0.5)",
  overlay: "transparent",
} as const;

const FORWARDED = ["bg", "border", "shadow"] as const;

type ShellStatement = { bg?: string; border?: string; shadow?: string; overlay?: string };

const WORKSPACE_NAME = /^--ds-workspace-(shell|frame)-(bg|border|overlay|shadow)$/;

/** A declaration, not a read: compiled values legitimately read the overlay. */
const WORKSPACE_DECLARATION = /--ds-workspace-(shell|frame)-(bg|border|overlay|shadow):/;

const workspaceOf = (variables: Readonly<Record<string, string>>) =>
  Object.fromEntries(
    Object.entries(variables).filter(([name]) => WORKSPACE_NAME.test(name))
  );

/** Each stated field once, under its door name, and nothing else. */
const doorsFor = (shell: typeof SHELL | typeof DARK_SHELL) => ({
  "--ds-workspace-shell-bg": shell.bg,
  "--ds-workspace-shell-border": shell.border,
  "--ds-workspace-shell-shadow": shell.shadow,
  "--ds-workspace-shell-overlay": shell.overlay,
});

const v1Document = (shell?: ShellStatement): TenantThemeDocument => ({
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: { palette: { primary: "#2F6BFF" } },
    advanced: {
      chrome: {
        layout: { headerHeight: "64px" },
        ...(shell ? { shell } : {}),
      },
    },
  },
});

const publishV1 = (document: TenantThemeDocument) =>
  compileTenantTheme(hydrateTenantThemeConfig(document, IDENTITY), {
    verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")!,
  }).artifact;

const v2Document = (shell?: ShellStatement): TenantThemeDocumentV2 => ({
  version: 2,
  plan: "pro",
  decisions: { "palette.seeds": { primary: "#2F6BFF" } },
  overrides: {
    chrome: {
      cardComponent: { radius: "var(--ds-radius-lg)" },
      ...(shell ? { shell } : {}),
    },
  },
});

const publishV2 = (document: TenantThemeDocumentV2 | TenantThemeDocumentV3) =>
  compileTenantThemeDocumentV2({ ...IDENTITY, document }).artifact;

/** The artifact's CSS declares `name: value` for each door it carries. */
const expectDeclared = (artifact: TenantThemeArtifact, doors: Record<string, string>) => {
  for (const [name, value] of Object.entries(doors)) {
    expect(artifact.css, name).toContain(`${name}: ${value};`);
  }
};

describe("chrome.shell through the public compile doors", () => {
  it("v1 advanced: each stated field reaches its door name and no frame name", () => {
    const document = v1Document(SHELL);
    expect(validateTenantThemeDocument(document).success).toBe(true);
    const artifact = publishV1(document);
    expect(workspaceOf(artifact.variables)).toEqual(doorsFor(SHELL));
    expectDeclared(artifact, doorsFor(SHELL));
    expect(artifact.css).not.toContain("--ds-workspace-frame-");
  });

  it("v2 overrides: each stated field reaches its door name and no frame name", () => {
    const artifact = publishV2(v2Document(SHELL));
    expect(workspaceOf(artifact.variables)).toEqual(doorsFor(SHELL));
    expectDeclared(artifact, doorsFor(SHELL));
    expect(artifact.css).not.toContain("--ds-workspace-frame-");
  });

  it("v3 overrides: the same door, the same names", () => {
    const artifact = publishV2({ ...v2Document(SHELL), version: 3 });
    expect(workspaceOf(artifact.variables)).toEqual(doorsFor(SHELL));
    expectDeclared(artifact, doorsFor(SHELL));
  });

  it("one statement moves one name on every DB door", () => {
    const border = { border: SHELL.border };
    const expected = { "--ds-workspace-shell-border": SHELL.border };
    expect(workspaceOf(publishV1(v1Document(border)).variables)).toEqual(expected);
    expect(workspaceOf(publishV2(v2Document(border)).variables)).toEqual(expected);
    const overlay = { overlay: SHELL.overlay };
    expect(workspaceOf(publishV1(v1Document(overlay)).variables)).toEqual({
      "--ds-workspace-shell-overlay": SHELL.overlay,
    });
    expect(workspaceOf(publishV2(v2Document(overlay)).variables)).toEqual({
      "--ds-workspace-shell-overlay": SHELL.overlay,
    });
  });

  it("the frame forwards the same name the compiler writes", () => {
    const patterns = readFileSync(
      resolve(
        process.cwd(),
        "src/foundation/tokens/css/presentation/components/patterns/index.css"
      ),
      "utf8"
    );
    const compiled = publishV1(v1Document(SHELL)).variables;
    for (const field of FORWARDED) {
      const door = `--ds-workspace-shell-${field}`;
      expect(compiled[door], door).toBe(SHELL[field]);
      expect(patterns, field).toContain(`--ds-workspace-frame-${field}: var(${door}, `);
    }
  });

  it("a document that states no workspace field emits no workspace name", () => {
    for (const artifact of [
      publishV1(v1Document()),
      publishV2(v2Document()),
      publishV2({ ...v2Document(), version: 3 }),
    ]) {
      expect(workspaceOf(artifact.variables)).toEqual({});
      for (const delta of artifact.modeDeltas ?? []) {
        expect(workspaceOf(delta.variables), delta.mode).toEqual({});
      }
      expect(artifact.css).not.toMatch(WORKSPACE_DECLARATION);
    }
  });

  it("no DB transport carries a mode-qualified chrome block", () => {
    expect(
      validateTenantThemeDocument({
        schemaVersion: 1,
        mode: "advanced",
        visualFoundation: { advanced: { modes: { dark: { chrome: { shell: DARK_SHELL } } } } },
      } as unknown as TenantThemeDocument).success
    ).toBe(false);
    expect(() =>
      publishV2({
        ...v2Document(),
        overrides: { modes: { dark: { chrome: { shell: DARK_SHELL } } } },
      } as unknown as TenantThemeDocumentV2)
    ).toThrow(/unsupported override group "modes"/);
  });
});

describe("modes.<mode>.chrome.shell through the studio draft door", () => {
  const draftWith = (base: boolean, dark: boolean) => {
    const draft = JSON.parse(JSON.stringify(firstPartyFixture("bithire", IDENTITY.slug))) as FlatTheme;
    if (base) draft.chrome = { ...draft.chrome, shell: { ...draft.chrome?.shell, ...SHELL } };
    if (dark) {
      draft.modes = {
        ...draft.modes,
        dark: {
          ...draft.modes?.dark,
          chrome: { ...draft.modes?.dark?.chrome, shell: { ...draft.modes?.dark?.chrome?.shell, ...DARK_SHELL } },
        },
      };
    }
    return compileThemeIntent(
      draftPreviewThemeIntent({ vertical: "bithire", slug: IDENTITY.slug, draft })
    ).compiled;
  };

  it("the base and the dark block each carry their own door names", () => {
    const compiled = draftWith(true, true);
    expect(workspaceOf(compiled.cssVariables)).toEqual(doorsFor(SHELL));
    const dark = compiled.modeBlocks.find((block) => block.mode === "dark");
    expect(dark).toBeDefined();
    expect(workspaceOf(dark!.cssVariables)).toEqual(doorsFor(DARK_SHELL));
  });

  it("a mode-only statement moves the mode block and leaves the base silent", () => {
    const compiled = draftWith(false, true);
    expect(workspaceOf(compiled.cssVariables)).toEqual({});
    const dark = compiled.modeBlocks.find((block) => block.mode === "dark");
    expect(workspaceOf(dark!.cssVariables)).toEqual(doorsFor(DARK_SHELL));
  });

  it("an untouched draft emits no workspace name in any block", () => {
    const compiled = draftWith(false, false);
    expect(workspaceOf(compiled.cssVariables)).toEqual({});
    for (const block of compiled.modeBlocks) {
      expect(workspaceOf(block.cssVariables), block.mode).toEqual({});
    }
  });
});
