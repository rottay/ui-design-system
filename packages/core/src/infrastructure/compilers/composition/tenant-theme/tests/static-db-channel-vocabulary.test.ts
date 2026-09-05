/**
 * STATIC/DB SAME VOCABULARY — one channel language, two authoring paths.
 *
 * A code-owned vertical authors its colors as a `BrandTheme` compiled by
 * `compileTheme`; a customer authors them as a `TenantThemeDocument`
 * compiled by `compileTenantThemeConfig`. Both must land in the SAME semantic
 * channel vocabulary, because the components downstream read channel names and
 * nothing else. When the two paths drift, the drift is invisible until a
 * customer discovers that the dial they moved in the admin UI paints a channel
 * no component reads — the value is stored, validated, digested, emitted, and
 * inert.
 *
 * The honest relation between the two sets is not equality and this test does
 * not pretend otherwise. The static path is a whole product identity: every
 * chrome family, every ramp step, every typography channel. The DB path is a
 * BOUNDED subset a customer is trusted to author. So the law asserted here is:
 *
 *   over the shared core families (color / surface / text / border / chrome),
 *   every channel the DB path emits is also emitted by the static path.
 *
 * A DB-only channel in those families is a channel invented by the customer
 * path that no first-party theme can produce — the drift this test exists to
 * catch. Static-only channels are expected and inventoried, not failed on.
 *
 * ## Two measurements, because "the static path" has two honest readings
 *
 * The law above is a statement about PATHS. An earlier revision of this file
 * approximated the static path by one shipped theme (bithire) and pinned five
 * survivors as vocabulary drift, asserting of two of them that "the typed
 * contract cannot express them". That was wrong on both counts, and the
 * correction is what the two describes below now measure separately:
 *
 * 1. CONTRACT (`staticMirrorChannels`) — can the static authoring language say
 *    this at all? Measured by expressing the customer document's own authored
 *    intent as a `BrandTheme` and compiling it. This is the real vocabulary
 *    law and it asserts ZERO.
 * 2. SHIPPED IDENTITY (`bithireChannels`) — does the reference product
 *    actually author this channel through the typed contract? A short
 *    decrease-only inventory. Every survivor is an authoring gap in ONE theme,
 *    not a gap in the contract, and each is annotated with where bithire says
 *    the same thing instead.
 *
 * The evidence that the distinction is real: `chromeToVariables`
 * (`kernel/foundation/css/chrome-variables`) is imported by BOTH compilers, so
 * `chrome.sidebar.width` and `chrome.layout.headerHeight` produce byte-identical
 * channel names on both paths — and rottay, which authors `sidebar.width`,
 * ships `--ds-sidebar-width` / `--ds-shell-sidebar-width` in its static
 * artifact today.
 */
import { describe, expect, it } from "vitest";

import { lowerBrandThemeFixture } from "@tests/support/theme-lowering";
import { TENANT_CAPABILITY_REGISTRY } from "@/foundation/contracts/composition/tenants/capabilities";
import { FIRST_PARTY_VERTICAL_SLUGS } from "@/foundation/contracts/kernel/verticals";
import { EXPRESSIVE_PROFILE_SCHEMA_VERSION } from "@/foundation/tokens/ts/presentation/expressive-profiles";
import { buttonStyleRadius } from "@/infrastructure/compilers/kernel/foundation/css/appearance-posture";
import {
  FIRST_PARTY_THEMES,
} from "@/foundation/tokens/ts/presentation/brand-themes";
import {
  compileThemeIntent,
  documentThemeIntent,
  draftPreviewThemeIntent,
  migrateV1,
  previewThemeIntent,
  staticThemeIntent,
} from "@/infrastructure/compilers/runtime/theme";
import { bithireBrandTheme } from "@/foundation/tokens/ts/presentation/brand-themes/bithire";
import type { BrandTheme } from "@/foundation/contracts/composition/tenants/themes";
import type { ThemeCompilation } from "@/foundation/contracts/composition/tenants/themes/compiled";
import type { TenantThemeDocument } from "@/foundation/contracts/composition/tenants/themes/tenant-theme";

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from "../index";

/**
 * A maximal customer document: every chrome family the bithire envelope
 * permits, plus token overrides. A thin fixture would make the subset relation
 * trivially true by emitting almost nothing, so the fixture is deliberately
 * the widest document the envelope accepts.
 */
const CUSTOMER_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: "advanced",
  visualFoundation: {
    general: {
      palette: {
        primary: "#0F766E",
        secondary: "#8C6D46",
        accent: "#E2725B",
        foreground: { muted: "#6B6154", disabled: "#80766A" },
        // P0: las 4 semillas de estado por la via DB tipada. Se autoran AQUI, en
        // el documento local de esta prueba, y no en el fixture publicado
        // `themanagement-db-row`: ese alimenta `contracts/themes/canaries/index.json`,
        // que es artefacto de paquete, y tocarlo habria cambiado un specimen
        // enviado sin que este lote lo necesite.
        status: {
          success: "#2F7A3D",
          warning: "#B5850F",
          error: "#A32E22",
          info: "#2C6FA6",
        },
      },
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
      },
      density: "normal",
      motion: { intensity: 0.62, durationScale: 1.15, ambient: "subtle" },
      shape: { buttonStyle: "soft" },
      surfaces: { elevation: "elevated" },
      navigation: { sidebarTone: "subtle" },
    },
    advanced: {
      tokenOverrides: {
        "--ds-color-bg-primary": "#FBF6EC",
        "--ds-color-success": "#5B8A3A",
        "--ds-color-warning": "#C39E22",
        "--ds-color-error": "#C0392B",
        "--ds-color-info": "#5B6FA8",
        "--ds-radius-md": "6px",
        "--ds-effect-intensity": 0.45,
      },
      chrome: {
        sidebar: {
          bg: "#FFFEFB",
          border: "#E2D9CC",
          text: "#2E261C",
          width: "284px",
        },
        layout: { headerHeight: "64px" },
        table: { bg: "#FFFEFB", headerBg: "#FFFFFF", rowBgHover: "#FBF3E7" },
        cardComponent: { bg: "#FFFEFB", border: "transparent", radius: "8px" },
        badge: { surface: "#FFFEFB", ink: "#2E261C", frame: "#9B8A73" },
        metricCard: { bg: "#FFFEFB", iconBg: "#F3EEE5", valueColor: "#2E261C" },
      },
    },
  },
};

const compileCustomerDocument = (tenantId: string) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(CUSTOMER_DOCUMENT, {
      tenantId,
      slug: "themanagementmiami",
      verticalKey: "bithire",
      rowVersion: 1,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope("bithire")! }
  );

/**
 * Every channel a static compile emits, base block AND mode blocks.
 *
 * `compileModeBlocks` keeps a channel in a mode block only when its value
 * MOVES between modes, so a vertical that authors a channel per-mode — which
 * all three first-party verticals do for `--ds-color-text-on-primary` — never
 * puts it in `cssVariables` at all. The DB artifact has no mode blocks
 * (`variables` is one flat map), so reading only the static base block would
 * compare a base against an everything and report the difference as drift.
 */
const allChannels = (compiled: {
  cssVariables: Record<string, string>;
  modeBlocks?: readonly { cssVariables: Record<string, string> }[];
}): Set<string> => {
  const channels = new Set(Object.keys(compiled.cssVariables));
  for (const block of compiled.modeBlocks ?? []) {
    for (const channel of Object.keys(block.cssVariables))
      channels.add(channel);
  }
  return channels;
};

const dbCompiled = compileCustomerDocument("tenant_vocabulary");
const dbChannels = new Set(Object.keys(dbCompiled.variables));

/**
 * The SAME authored intent, expressed in the static authoring language.
 *
 * Built from the DB compile's own `normalizedAppearance` rather than written
 * out by hand, so a customer dial cannot be added to the envelope and quietly
 * skipped here: `chrome` transfers structurally, because `chromeToVariables`
 * is literally the same function on both paths.
 *
 * Where the two paths reach a channel from DIFFERENT dials, the mirror carries
 * the DB path's own resolved value into the typed `BrandTheme` field that owns
 * that channel — a customer sets `navigation.sidebarTone` or a raw
 * `tokenOverride` where a vertical sets `chrome.sidebar.itemBgActive` or
 * `palette.successColor`. That is deliberate and it is what the law needs:
 * this test grades the channel NAME, and naming a field here is the proof that
 * the static contract HAS a field for it. The value math behind each dial
 * (WCAG readable ink for `--ds-color-text-on-primary`, the tone presets, the
 * semantic ramps) belongs to its own compiler and is graded by its own tests.
 */
const buildStaticMirror = (compiled: typeof dbCompiled): BrandTheme => {
  const seeds = compiled.normalizedAppearance.general?.palette ?? {};
  const chrome = compiled.normalizedAppearance.advanced?.chrome ?? {};
  const variable = (name: string) => compiled.variables[name];
  // The DB palette's seeds are optional on the normalized shape but present in
  // every fixture this mirror is built from; a missing one would silently emit
  // a blank channel and grade as a naming pass, so it fails loudly instead.
  const seed = (value: string | undefined, channel: string): string => {
    if (!value) {
      throw new Error(`static mirror fixture is missing its ${channel} seed`);
    }
    return value;
  };

  return {
    id: "static-mirror",
    name: "Static Mirror",
    palette: {
      primaryColor: seed(seeds.primary, "primary"),
      secondaryColor: seed(seeds.secondary, "secondary"),
      accentColor: seed(seeds.accent, "accent"),
      onPrimaryColor: variable("--ds-color-text-on-primary"),
      backgroundColor: variable("--ds-color-bg-primary"),
      textMutedColor: variable("--ds-color-text-muted"),
      textDisabledColor: variable("--ds-color-text-disabled"),
      /* P0: el espejo deja de necesitar el ATAJO. Hasta la apertura de
       * `palette.status-seeds` estos cuatro se leian de `variables[...]` porque
       * la DB no tenia campo tipado y el unico camino era un `tokenOverride`
       * crudo — la asimetria estatico/DB que la fila frontera declaraba. Ahora
       * salen del documento, igual que primary/secondary/accent, y que este
       * `seed(...)` no explote ES la prueba de la condicion 2: la via DB tiene
       * el campo, no el rodeo. */
      successColor: seed(seeds.status?.success, "status.success"),
      warningColor: seed(seeds.status?.warning, "status.warning"),
      errorColor: seed(seeds.status?.error, "status.error"),
      infoColor: seed(seeds.status?.info, "status.info"),
    },
    chrome: {
      ...chrome,
      sidebar: {
        ...chrome.sidebar,
        textMuted: variable("--ds-sidebar-text-muted"),
        itemBgActive: variable("--ds-sidebar-item-bg-active"),
        itemBgHover: variable("--ds-sidebar-item-bg-hover"),
        itemColorActive: variable("--ds-sidebar-item-color-active"),
      },
    },
  };
};

const staticMirrorChannels = allChannels(
  lowerBrandThemeFixture({
    brandTheme: buildStaticMirror(dbCompiled),
    tenantSlug: "static-mirror",
  })
);

const bithireChannels = allChannels(
  lowerBrandThemeFixture({ brandTheme: bithireBrandTheme, tenantSlug: "bithire" })
);

/**
 * The shared core families, matched on the channel name.
 *
 * `chrome` has no single prefix — the contract spreads it across the component
 * families a BrandTheme's `chrome` section authors — so it is enumerated from
 * those family names rather than guessed from a prefix.
 */
const CHROME_FAMILIES = [
  "badge",
  "button",
  "card",
  "input",
  "layout",
  "metric-card",
  "modal",
  "sidebar",
  "shell",
  "table",
  "tabs",
] as const;

/**
 * The five families, matched semantically rather than by a single prefix.
 *
 * A prefix-only definition would be wrong here and quietly so: this system has
 * no `--ds-border-*` or `--ds-text-*` root namespace. Borders live as
 * `--ds-color-border`, `--ds-surface-border-strong`, `--ds-sidebar-border`;
 * text lives as `--ds-color-text-muted`, `--ds-cell-text-color`. Matching on
 * the segment is what makes "the border family agrees" a statement about
 * borders instead of about a naming accident.
 */
const CORE_FAMILIES: Record<string, (channel: string) => boolean> = {
  color: (channel) => channel.startsWith("--ds-color-"),
  surface: (channel) =>
    channel.startsWith("--ds-surface-") || channel.includes("-surface"),
  text: (channel) => channel.includes("-text") || channel.includes("-ink"),
  border: (channel) =>
    channel.includes("-border") || channel.includes("-frame"),
  chrome: (channel) =>
    CHROME_FAMILIES.some((family) => channel.startsWith(`--ds-${family}-`)),
};

const inCoreFamilies = (channel: string) =>
  Object.values(CORE_FAMILIES).some((matches) => matches(channel));

const sorted = (values: Iterable<string>) => [...values].sort();

const dbOnlyAgainst = (staticSide: ReadonlySet<string>) =>
  sorted(
    [...dbChannels].filter(
      (channel) => inCoreFamilies(channel) && !staticSide.has(channel)
    )
  );

/**
 * Core-family channels the SHIPPED bithire identity does not author through
 * the typed contract. Decrease-only; an empty list is the target state, and
 * MASS C3-BITHIRE-ALL reached it.
 *
 * The four channels that used to sit here — `--ds-shell-sidebar-width`,
 * `--ds-sidebar-width`, `--ds-shell-header-block-size` and
 * `--ds-layout-header-height` — were hand-written in
 * `artifacts/bithire/_source/extension.css` instead of being authored through
 * `chrome.sidebar.width` / `chrome.layout.headerHeight`. That extension is now
 * fully drained: bithire authors both fields, and `chromeToVariables` spells
 * each single owner into the modern AND classic vocabularies from one typed
 * value, exactly as it already did for rottay.
 *
 * Do not re-add an entry here to make a failure go away. A channel appearing
 * in this list again means an identity started saying something outside the
 * compiler, which is the finding.
 */
const KNOWN_UNAUTHORED_BY_BITHIRE: readonly string[] = [];

/**
 * Core families the customer path exercises today, and how thinly.
 *
 * Both paths reach all five, which is what makes the subset assertion a real
 * statement rather than a vacuous one. The depths are what the "bounded"
 * claim actually means, measured on a maximal customer document against
 * bithire's full emission (base block plus mode blocks):
 *
 *   family    customer   vertical
 *   color           79        130
 *   border           7        130
 *   text             4         62
 *   surface          1         23
 *   chrome          31        426
 *
 * Pinning the list rather than asserting "non-empty everywhere" means a family
 * going silent on the customer side is a red test and not a quiet green.
 */
const DB_EXERCISED_CORE_FAMILIES = [
  "border",
  "chrome",
  "color",
  "surface",
  "text",
] as const;

describe("STATIC/DB VOCABULARY · both paths emit a real, non-trivial channel set", () => {
  it("the static path emits a full product identity", () => {
    expect(bithireChannels.size).toBeGreaterThan(200);
  });

  it("the customer path emits a bounded but substantial set", () => {
    expect(dbChannels.size).toBeGreaterThan(50);
    // Bounded: the customer document is a subset of a product identity, not a
    // second one. If this ever inverts, the "bounded" claim is fiction.
    expect(dbChannels.size).toBeLessThan(bithireChannels.size);
  });
});

describe("STATIC/DB VOCABULARY · the static contract expresses every customer channel", () => {
  it("no core-family channel is reachable from the DB path alone", () => {
    const dbOnly = dbOnlyAgainst(staticMirrorChannels);
    if (process.env.PIN_REPORT) {
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          {
            mirrorSize: staticMirrorChannels.size,
            bithireSize: bithireChannels.size,
            dbSize: dbChannels.size,
            dbCore: [...dbChannels].filter(inCoreFamilies).length,
            dbOnlyCoreVsContract: dbOnly,
            dbOnlyCoreVsBithire: dbOnlyAgainst(bithireChannels),
            dbOnlyAll: sorted(
              [...dbChannels].filter((channel) => !bithireChannels.has(channel))
            ),
            byFamily: Object.fromEntries(
              Object.entries(CORE_FAMILIES).map(([family, matches]) => [
                family,
                {
                  db: [...dbChannels].filter(matches).length,
                  static: [...bithireChannels].filter(matches).length,
                },
              ])
            ),
          },
          null,
          2
        )
      );
    }
    // Zero, with no pinned survivors: a customer dial that paints a channel no
    // BrandTheme field can produce is the drift this file exists to catch, and
    // there is no inventory to grow it into.
    expect(dbOnly).toEqual([]);
  });

  it("the static path exercises every shared family", () => {
    for (const [family, matches] of Object.entries(CORE_FAMILIES)) {
      expect({ family, emitted: [...bithireChannels].some(matches) }).toEqual({
        family,
        emitted: true,
      });
    }
  });

  it("the customer path exercises exactly the pinned families", () => {
    // Without this the subset assertion above could go green because a family
    // emptied out on the DB side — a vacuous pass that reads as agreement.
    const exercised = sorted(
      Object.entries(CORE_FAMILIES)
        .filter(([, matches]) => [...dbChannels].some(matches))
        .map(([family]) => family)
    );
    expect(exercised).toEqual([...DB_EXERCISED_CORE_FAMILIES]);
  });

  it("the customer path is a strict subset of the static vocabulary in those families", () => {
    // The counts that make the relation concrete rather than asserted.
    const dbCore = [...dbChannels].filter(inCoreFamilies);
    const staticOnlyCore = [...bithireChannels].filter(
      (channel) => inCoreFamilies(channel) && !dbChannels.has(channel)
    );
    expect(dbCore.length).toBeGreaterThan(80);
    expect(staticOnlyCore.length).toBeGreaterThan(dbCore.length);
    expect(
      dbCore.filter((channel) => staticMirrorChannels.has(channel)).length
    ).toBe(dbCore.length);
  });
});

describe("STATIC/DB VOCABULARY · the shipped identity authors what it can express", () => {
  it("bithire leaves exactly the pinned channels to its artifact extension", () => {
    expect(dbOnlyAgainst(bithireChannels)).toEqual([
      ...KNOWN_UNAUTHORED_BY_BITHIRE,
    ]);
  });

  it("every channel bithire leaves unauthored is still expressible statically", () => {
    // The distinction the two describes exist to keep apart. If one of these
    // ever stops being reachable from a BrandTheme field, it is no longer an
    // authoring gap — it is the contract drift, and it fails above too.
    for (const channel of KNOWN_UNAUTHORED_BY_BITHIRE) {
      expect({
        channel,
        expressible: staticMirrorChannels.has(channel),
      }).toEqual({
        channel,
        expressible: true,
      });
    }
  });
});

describe("STATIC/DB VOCABULARY · drill", () => {
  it("renaming one emitted channel in a compiled result is detected", () => {
    const compiled = compileCustomerDocument("tenant_vocabulary_drill");

    const victim = Object.keys(compiled.variables).find(
      (channel) => inCoreFamilies(channel) && staticMirrorChannels.has(channel)
    );
    expect(victim).toBeDefined();

    // The drift verbatim: the DB path emits `--ds-color-primary-db` where the
    // static path emits `--ds-color-primary`. Same value, same intent, a name
    // no component reads.
    const drifted = new Set(
      Object.keys(compiled.variables).map((channel) =>
        channel === victim ? `${victim}-db` : channel
      )
    );
    const dbOnly = sorted(
      [...drifted].filter(
        (channel) =>
          inCoreFamilies(channel) && !staticMirrorChannels.has(channel)
      )
    );
    // The baseline is zero, so the plant is the ENTIRE difference — the drill
    // measures itself and not ambient divergence.
    expect(dbOnly).toEqual([`${victim}-db`]);
  });
});

/* -------------------------------------------------------------------------- */
/* TRANSPORT EQUALITY · one control, two transports, one compile               */
/* -------------------------------------------------------------------------- */

/**
 * The vocabulary law above asks whether the two paths speak the same language.
 * This block asks the harder question C4 exists to answer: for ONE control set
 * to ONE value, do the two productive doors produce the SAME channels?
 *
 * Both arms are tenant-authored, so both carry a tenant floor and lower the
 * tenant posture last. The only structural difference left is the transport:
 * a `TenantThemeDocument` through `compileTenantThemeConfig`, versus a
 * `BrandTheme` draft through `draftPreviewThemeIntent`. Anything that differs
 * is a transport artefact, and every one of them has to be named here rather
 * than absorbed.
 *
 * The denominator is the registry: every ACTIVE `standard` row must have a case
 * below, so a control added without a transport case reddens this file.
 */
interface TransportCase {
  /** The `appearance.general` fragment a customer document would carry. */
  readonly general: Record<string, unknown>;
  /** The same intent expressed in the static authoring language. */
  readonly draft: Partial<BrandTheme>;
}

/**
 * Placeholders resolved per vertical, so one case table can state one intent
 * for three products.
 *
 * `__DEFAULT_MODE__` is the vertical's own body mode; `__SEED__` is a primary
 * that clears the governed APCA floor against that mode's ground. A single
 * literal cannot: a seed readable on a light canvas is unreadable on a dark
 * one, and the DB door refuses it -- correctly, and before this test can
 * compare anything.
 */
function resolvePlaceholders<T>(value: T, defaultMode: "light" | "dark"): T {
  const seed = defaultMode === "dark" ? "#8FD3FF" : "#1D4ED8";
  return JSON.parse(
    JSON.stringify(value)
      .replace(/__DEFAULT_MODE__/g, defaultMode)
      .replace(/__SEED__/g, seed)
  ) as T;
}

/**
 * The one control whose two doors legitimately declare different channel sets.
 *
 * A named difference is a superset claim, never a licence: the DB door must
 * still declare every channel the static door does, value for value.
 */
const NAMED_TRANSPORT_DIFFERENCES: Readonly<Record<string, string>> = {
  "experience.profile":
    "the DB door expands the selected profile's field defaults into the document before migrating it, so the profile arrives as an id plus the keypaths it implies; the static draft carries the id alone and the lowering expands it. One selection, two expansion points -- unifying them is the next packet.",
};

const TRANSPORT_CASES: Readonly<Record<string, TransportCase>> = {
  "palette.seeds": {
    // `backgroundMode` names WHICH block a seed is authored for. Absent, the
    // migration defaults to `light`, which on a dark-default vertical means
    // `modes.light.palette` -- a different statement from the base palette the
    // static language writes. Stated explicitly here so the two arms express
    // the same intent rather than accidentally comparing two of them.
    general: {
      palette: {
        backgroundMode: "__DEFAULT_MODE__",
        primary: "__SEED__",
        secondary: "#8C6D46",
        accent: "#E2725B",
      },
    },
    draft: {
      palette: {
        primaryColor: "__SEED__",
        secondaryColor: "#8C6D46",
        accentColor: "#E2725B",
      },
    },
  },
  "palette.status-seeds": {
    general: {
      palette: {
        backgroundMode: "__DEFAULT_MODE__",
        status: {
          success: "#2E7D5B",
          warning: "#B4761E",
          error: "#B23B3B",
          info: "#2F6B9A",
        },
      },
    },
    draft: {
      palette: {
        successColor: "#2E7D5B",
        warningColor: "#B4761E",
        errorColor: "#B23B3B",
        infoColor: "#2F6B9A",
      } as BrandTheme["palette"],
    },
  },
  "typography.pairing": {
    general: { typography: { typePairing: "editorial" } },
    draft: { typography: { typePairing: "editorial" } },
  },
  "typography.families": {
    general: {
      typography: { fontFamilyBase: "Inter", fontFamilyHeading: "Inter Tight" },
    },
    draft: { typography: { fontFamilyBase: "Inter", fontFamilyHeading: "Inter Tight" } },
  },
  "typography.scale": {
    general: { typography: { scale: 1.05 } },
    draft: { typography: { scale: 1.05 } },
  },
  "shape.radius-scale": {
    general: { shape: { radiusScale: 1.2 } },
    draft: { surfaces: { radiusScale: 1.2 } },
  },
  "shape.button-style": {
    general: { shape: { buttonStyle: "pill" } },
    // The document language DERIVES the button geometry from the style word;
    // the static language states both. Same intent, stated at two levels, so
    // the static side spells the derivation out rather than being reported as
    // a transport difference it is not.
    draft: {
      surfaces: { buttonStyle: "pill" },
      chrome: { controls: { buttonGeometry: { radius: buttonStyleRadius("pill") } } },
    },
  },
  "density.mode": {
    general: { density: "compact" },
    draft: { surfaces: { density: "compact" } },
  },
  "spacing.rhythm": {
    general: { rhythm: "airy" },
    draft: { surfaces: { rhythm: "airy" } },
  },
  "motion.dial": {
    general: { motion: { intensity: 0.7, durationScale: 1.2 } },
    draft: { motion: { intensity: 0.7, durationScale: 1.2 } },
  },
  "surfaces.elevation-posture": {
    general: { surfaces: { elevation: "elevated" } },
    draft: { surfaces: { elevation: "elevated" } },
  },
  "surfaces.effect-intensity": {
    general: { surfaces: { effectIntensity: 0.6 } },
    draft: { surfaces: { effectIntensity: 0.6 } as BrandTheme["surfaces"] },
  },
  "navigation.sidebar-tone": {
    general: { navigation: { sidebarTone: "strong" } },
    draft: { chrome: { sidebar: { tone: "strong" } } },
  },
  "experience.profile": {
    // `management-editorial`, because no first-party theme selects it: a
    // profile a vertical already carries would produce an empty delta on the
    // static side and the case would assert nothing.
    general: { experienceProfile: "rottay/management-editorial@1" },
    draft: {
      expressive: {
        schemaVersion: EXPRESSIVE_PROFILE_SCHEMA_VERSION,
        experienceProfile: "rottay/management-editorial@1",
      },
    },
  },
};

const STANDARD_ACTIVE_CONTROLS = TENANT_CAPABILITY_REGISTRY.filter(
  (control) => control.tier === "standard" && control.status === "active"
).map((control) => control.id);

/** The identity a persisted row carries into the DB door. */
function identityFor(vertical: string, slug: string) {
  return { tenantId: `id-${slug}`, slug, verticalKey: vertical, rowVersion: 1 };
}

/** The channels a compile moves off the untouched vertical, base block only. */
function movedChannels(
  proposed: Record<string, string>,
  baseline: Record<string, string>
): Record<string, string> {
  const moved: Record<string, string> = {};
  for (const [name, value] of Object.entries(proposed)) {
    if (baseline[name] !== value) moved[name] = value;
  }
  return moved;
}

/** A mode's effective values: the base block with that mode's overlay applied. */
function effectiveMode(
  compiled: ThemeCompilation,
  mode: "light" | "dark"
): Record<string, string> {
  const block = compiled.modeBlocks.find((entry) => entry.mode === mode);
  return { ...compiled.cssVariables, ...(block?.cssVariables ?? {}) };
}

/**
 * The modes a compile needs a delta for, projected exactly as the artifact
 * projects them: a mode appears when its effective values differ from the
 * baseline's effective values ALREADY corrected by the base delta.
 *
 * Replicated here rather than approximated by "the mode block moved", because
 * those are different questions and comparing two different questions is how a
 * parity test passes while the two arms disagree.
 */
function projectedModes(
  compiled: ThemeCompilation,
  baseline: ThemeCompilation,
  baseDelta: Record<string, string>
): ("light" | "dark")[] {
  const modes = new Set<"light" | "dark">();
  for (const block of compiled.modeBlocks) modes.add(block.mode);
  for (const block of baseline.modeBlocks) modes.add(block.mode);
  const out: ("light" | "dark")[] = [];
  for (const mode of ["light", "dark"] as const) {
    if (!modes.has(mode)) continue;
    const expected = effectiveMode(compiled, mode);
    const withBaseDelta = { ...effectiveMode(baseline, mode), ...baseDelta };
    if (Object.keys(movedChannels(expected, withBaseDelta)).length > 0) out.push(mode);
  }
  return out;
}

describe("TRANSPORT EQUALITY · every Standard control has a case on both doors", () => {
  it("the registry is the denominator: no active Standard row is unexercised", () => {
    expect([...STANDARD_ACTIVE_CONTROLS].sort()).toEqual(
      Object.keys(TRANSPORT_CASES).sort()
    );
  });

  it("every named difference names a live control and states its reason", () => {
    for (const [id, reason] of Object.entries(NAMED_TRANSPORT_DIFFERENCES)) {
      expect(STANDARD_ACTIVE_CONTROLS, id).toContain(id);
      expect(reason.length, id).toBeGreaterThan(40);
    }
  });
});

describe.each(FIRST_PARTY_VERTICAL_SLUGS)(
  "TRANSPORT EQUALITY · %s",
  (vertical) => {
    const slug = `transport-${vertical}`;
    const defaultMode = FIRST_PARTY_THEMES[vertical].appearance?.defaultMode ?? "light";

    /** `__DEFAULT_MODE__` stands for "this vertical's own body mode". */
    const documentOf = (general: Record<string, unknown>): TenantThemeDocument =>
      resolvePlaceholders(
        { schemaVersion: 1, mode: "simple", appearance: general },
        defaultMode
      ) as unknown as TenantThemeDocument;

    const compileDocument = (general: Record<string, unknown>) =>
      compileTenantThemeConfig(
        hydrateTenantThemeConfig(documentOf(general), identityFor(vertical, slug))
      );

    /**
     * The DB door's own footprint, independent of any control.
     *
     * `compileTenantThemeConfig` expands the vertical's experience-profile
     * FIELD DEFAULTS into the document before migrating it, so a customer
     * document arrives at the compiler carrying keypaths the customer never
     * wrote. That expansion is the one structural difference left between the
     * two transports, and an empty document isolates it: whatever it adds here
     * is what it adds to every document, for every control.
     */
    const transportFootprint = Object.keys(compileDocument({}).variables);

    /**
     * The second transport artefact, measured rather than asserted away.
     *
     * `migrateV1` constructs ALL FOUR palette seed fields whenever a document
     * names its `palette` group at all, so a customer who set only the status
     * seeds still arrives claiming authorship of the primary seed -- and the
     * seed derivations then run in tenant mode and re-derive every
     * primary-dependent channel. The static language claims only what it
     * states, so this widening is DB-only by construction.
     *
     * A document that names the palette group and nothing inside it isolates
     * exactly that widening: no value changes, only the authorship claim.
     */
    const paletteWidening = Object.keys(
      compileDocument({ palette: { backgroundMode: "__DEFAULT_MODE__" } }).variables
    );

    it("both transport artefacts are bounded and real", () => {
      // Measured, not waived: a control-owned channel appearing in either of
      // these would let a per-control assertion below pass on a difference it
      // was written to catch, so both stay small and both stay stated.
      expect(transportFootprint.length).toBeLessThan(40);
      expect(paletteWidening.length).toBeLessThan(40);
    });

    for (const [control, transportCase] of Object.entries(TRANSPORT_CASES)) {
      it(`${control}: the static door's channels are the DB door's, value for value`, () => {
        const artifact = compileDocument(transportCase.general);
        const intentCompiled = compileThemeIntent(
          draftPreviewThemeIntent({
            vertical,
            slug,
            draft: resolvePlaceholders(transportCase.draft, defaultMode) as BrandTheme,
          })
        ).compiled;
        const untouched = compileThemeIntent(staticThemeIntent(vertical, slug)).compiled;
        const intentMoved = movedChannels(
          intentCompiled.cssVariables,
          untouched.cssVariables
        );

        expect(Object.keys(intentMoved).length, control).toBeGreaterThan(0);
        for (const [channel, value] of Object.entries(intentMoved)) {
          expect(artifact.variables[channel], `${control} · ${channel}`).toBe(value);
        }

        // and the remainder is the transport's own footprint, never a channel
        // the control reached on one door and not the other
        const named = NAMED_TRANSPORT_DIFFERENCES[control];
        if (named) {
          expect(named.length).toBeGreaterThan(40);
          return;
        }
        const dbOnly = Object.keys(artifact.variables).filter(
          (channel) => !(channel in intentMoved)
        );
        const explained = new Set([...transportFootprint, ...paletteWidening]);
        expect(dbOnly.filter((channel) => !explained.has(channel)), control).toEqual([]);
      });

      it(`${control}: the static door's projected modes are the DB door's`, () => {
        const artifact = compileDocument(transportCase.general);
        const intentCompiled = compileThemeIntent(
          draftPreviewThemeIntent({
            vertical,
            slug,
            draft: resolvePlaceholders(transportCase.draft, defaultMode) as BrandTheme,
          })
        ).compiled;
        const untouched = compileThemeIntent(staticThemeIntent(vertical, slug)).compiled;
        const baseDelta = movedChannels(
          intentCompiled.cssVariables,
          untouched.cssVariables
        );
        const staticModes = projectedModes(intentCompiled, untouched, baseDelta);
        const dbModes = (artifact.modeDeltas ?? []).map((delta) => delta.mode);

        for (const mode of staticModes) {
          expect(dbModes, `${control} · ${mode}`).toContain(mode);
        }
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/* PREVIEW/PUBLISH EQUALITY on a dark-default vertical                         */
/* -------------------------------------------------------------------------- */

describe("PREVIEW/PUBLISH · the preview door migrates with the baseline's own mode", () => {
  // The sandbox used to migrate with a hardcoded `'light'` while the publish
  // door used the baseline's `appearance.defaultMode`. On rottay, whose default
  // is dark, that put the same authored seed in two different blocks: the
  // preview repainted the dark canvas for a change the artifact wrote into the
  // light one. One reader, one answer.
  it("rottay is the dark-default vertical this case exists for", () => {
    expect(FIRST_PARTY_THEMES.rottay.appearance?.defaultMode).toBe("dark");
  });

  it("a preview intent and a persisted document produce the identical patch", () => {
    const document = {
      schemaVersion: 1,
      mode: "simple",
      appearance: { palette: { primary: "#123456" } },
    } as unknown as TenantThemeDocument;

    const preview = previewThemeIntent({
      vertical: "rottay",
      slug: "preview-publish",
      document,
    });
    const persisted = documentThemeIntent({
      vertical: "rottay",
      slug: "preview-publish",
      document,
    });
    expect(preview.patch).toEqual(persisted.patch);
    // and it is the DARK-default routing, not the retired `'light'` literal
    expect(preview.patch).toEqual(migrateV1(document, "dark").patch);
    expect(preview.patch).not.toEqual(migrateV1(document, "light").patch);
  });

  it("the preview's compiled delta is the published artifact's delta", () => {
    const document = {
      schemaVersion: 1,
      mode: "simple",
      appearance: { palette: { primary: "#123456" } },
    } as unknown as TenantThemeDocument;
    const slug = "preview-publish";

    const artifact = compileTenantThemeConfig(
      hydrateTenantThemeConfig(document, identityFor("rottay", slug))
    );
    const proposed = compileThemeIntent(
      previewThemeIntent({ vertical: "rottay", slug, document })
    ).compiled;
    const untouched = compileThemeIntent(staticThemeIntent("rottay", slug)).compiled;

    expect(movedChannels(proposed.cssVariables, untouched.cssVariables)).toEqual(
      artifact.variables
    );
  });
});
