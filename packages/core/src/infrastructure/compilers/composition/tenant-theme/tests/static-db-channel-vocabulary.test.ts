/**
 * STATIC/DB SAME VOCABULARY — one channel language, two authoring paths.
 *
 * A code-owned vertical authors its colors as a `BrandTheme` compiled by
 * `compileBrandTheme`; a customer authors them as a `TenantThemeDocument`
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
import { describe, expect, it } from 'vitest';

import { compileBrandTheme } from '@/infrastructure/compilers/kernel/runtime/brand-theme';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import type { BrandTheme } from '@/foundation/contracts/composition/tenants/themes';
import type { TenantThemeDocument } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';

import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '../index';

/**
 * A maximal customer document: every chrome family the bithire envelope
 * permits, plus token overrides. A thin fixture would make the subset relation
 * trivially true by emitting almost nothing, so the fixture is deliberately
 * the widest document the envelope accepts.
 */
const CUSTOMER_DOCUMENT: TenantThemeDocument = {
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: { primary: '#0F766E', secondary: '#8C6D46', accent: '#E2725B' },
      typography: {
        fontFamilyBase: "Optima, Candara, 'Noto Sans', sans-serif",
        fontFamilyHeading: "'Fraunces', Georgia, 'Times New Roman', serif",
      },
      density: 'normal',
      motion: { intensity: 0.62, durationScale: 1.15, ambient: 'subtle' },
      shape: { buttonStyle: 'soft' },
      surfaces: { elevation: 'elevated' },
      navigation: { sidebarTone: 'subtle' },
    },
    advanced: {
      tokenOverrides: {
        '--ds-color-bg-primary': '#FBF6EC',
        '--ds-color-success': '#5B8A3A',
        '--ds-color-warning': '#C39E22',
        '--ds-color-error': '#C0392B',
        '--ds-color-info': '#5B6FA8',
        '--ds-radius-md': '6px',
        '--ds-effect-intensity': 0.45,
      },
      chrome: {
        sidebar: { bg: '#FFFEFB', border: '#E2D9CC', text: '#2E261C', width: '284px' },
        layout: { headerHeight: '64px' },
        table: { bg: '#FFFEFB', headerBg: '#FFFFFF', rowBgHover: '#FBF3E7' },
        cardComponent: { bg: '#FFFEFB', border: 'transparent', radius: '8px' },
        badge: { surface: '#FFFEFB', ink: '#2E261C', frame: '#9B8A73' },
        metricCard: { bg: '#FFFEFB', iconBg: '#F3EEE5', valueColor: '#2E261C' },
      },
    },
  },
};

const compileCustomerDocument = (tenantId: string) =>
  compileTenantThemeConfig(
    hydrateTenantThemeConfig(CUSTOMER_DOCUMENT, {
      tenantId,
      slug: 'themanagementmiami',
      verticalKey: 'bithire',
      rowVersion: 1,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire')! }
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
    for (const channel of Object.keys(block.cssVariables)) channels.add(channel);
  }
  return channels;
};

const dbCompiled = compileCustomerDocument('tenant_vocabulary');
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
    id: 'static-mirror',
    name: 'Static Mirror',
    palette: {
      primaryColor: seed(seeds.primary, 'primary'),
      secondaryColor: seed(seeds.secondary, 'secondary'),
      accentColor: seed(seeds.accent, 'accent'),
      onPrimaryColor: variable('--ds-color-text-on-primary'),
      backgroundColor: variable('--ds-color-bg-primary'),
      successColor: variable('--ds-color-success'),
      warningColor: variable('--ds-color-warning'),
      errorColor: variable('--ds-color-error'),
      infoColor: variable('--ds-color-info'),
    },
    chrome: {
      ...chrome,
      sidebar: {
        ...chrome.sidebar,
        textMuted: variable('--ds-sidebar-text-muted'),
        itemBgActive: variable('--ds-sidebar-item-bg-active'),
        itemBgHover: variable('--ds-sidebar-item-bg-hover'),
        itemColorActive: variable('--ds-sidebar-item-color-active'),
      },
    },
  };
};

const staticMirrorChannels = allChannels(
  compileBrandTheme({ brandTheme: buildStaticMirror(dbCompiled), tenantSlug: 'static-mirror' })
);

const bithireChannels = allChannels(
  compileBrandTheme({ brandTheme: bithireBrandTheme, tenantSlug: 'bithire' })
);

/**
 * The shared core families, matched on the channel name.
 *
 * `chrome` has no single prefix — the contract spreads it across the component
 * families a BrandTheme's `chrome` section authors — so it is enumerated from
 * those family names rather than guessed from a prefix.
 */
const CHROME_FAMILIES = [
  'badge',
  'button',
  'card',
  'input',
  'layout',
  'metric-card',
  'modal',
  'sidebar',
  'shell',
  'table',
  'tabs',
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
  color: (channel) => channel.startsWith('--ds-color-'),
  surface: (channel) =>
    channel.startsWith('--ds-surface-') || channel.includes('-surface'),
  text: (channel) => channel.includes('-text') || channel.includes('-ink'),
  border: (channel) => channel.includes('-border') || channel.includes('-frame'),
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
 * the typed contract. Decrease-only; an empty list is the target state.
 *
 * This is NOT a contract gap — the describe above proves every one of these is
 * expressible statically, and `chromeToVariables` emits them from the same
 * function on both paths. It is one product identity declining to use two
 * typed fields, and saying the same thing outside the compiler instead:
 *
 *   --ds-shell-sidebar-width  ── bithire hand-writes `--ds-shell-sidebar-width:
 *   --ds-sidebar-width            256px` in `artifacts/bithire/_source/
 *                                 extension.css` rather than authoring
 *                                 `chrome.sidebar.width`. rottay DOES author
 *                                 that field ('296px') and ships both names.
 *
 *   --ds-shell-header-block-size ─ bithire authors `--ds-shell-topbar-height:
 *   --ds-layout-header-height      56px` in the same extension, which is the
 *                                  documented fallback AppShell reads through
 *                                  (`var(--ds-shell-header-block-size,
 *                                  var(--ds-shell-topbar-height, …))`), rather
 *                                  than authoring `chrome.layout.headerHeight`.
 *
 * Closing them is a theme-data + artifact change, not a compiler change, and
 * it is not free: `--ds-sidebar-width` and `--ds-layout-header-height` are the
 * CLASSIC engine's vocabulary and are unset for bithire today, so emitting
 * them would move `.ant-layout-sider` off its `200px` var() fallback and give
 * `.ant-layout-header` a height it currently does not resolve. That belongs to
 * the extension-retirement wave, which regenerates the artifacts and grades
 * the effective delta.
 */
const KNOWN_UNAUTHORED_BY_BITHIRE: readonly string[] = [
  '--ds-layout-header-height',
  '--ds-shell-header-block-size',
  '--ds-shell-sidebar-width',
  '--ds-sidebar-width',
];

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
  'border',
  'chrome',
  'color',
  'surface',
  'text',
] as const;

describe('STATIC/DB VOCABULARY · both paths emit a real, non-trivial channel set', () => {
  it('the static path emits a full product identity', () => {
    expect(bithireChannels.size).toBeGreaterThan(200);
  });

  it('the customer path emits a bounded but substantial set', () => {
    expect(dbChannels.size).toBeGreaterThan(50);
    // Bounded: the customer document is a subset of a product identity, not a
    // second one. If this ever inverts, the "bounded" claim is fiction.
    expect(dbChannels.size).toBeLessThan(bithireChannels.size);
  });
});

describe('STATIC/DB VOCABULARY · the static contract expresses every customer channel', () => {
  it('no core-family channel is reachable from the DB path alone', () => {
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

  it('the static path exercises every shared family', () => {
    for (const [family, matches] of Object.entries(CORE_FAMILIES)) {
      expect({ family, emitted: [...bithireChannels].some(matches) }).toEqual({
        family,
        emitted: true,
      });
    }
  });

  it('the customer path exercises exactly the pinned families', () => {
    // Without this the subset assertion above could go green because a family
    // emptied out on the DB side — a vacuous pass that reads as agreement.
    const exercised = sorted(
      Object.entries(CORE_FAMILIES)
        .filter(([, matches]) => [...dbChannels].some(matches))
        .map(([family]) => family)
    );
    expect(exercised).toEqual([...DB_EXERCISED_CORE_FAMILIES]);
  });

  it('the customer path is a strict subset of the static vocabulary in those families', () => {
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

describe('STATIC/DB VOCABULARY · the shipped identity authors what it can express', () => {
  it('bithire leaves exactly the pinned channels to its artifact extension', () => {
    expect(dbOnlyAgainst(bithireChannels)).toEqual([
      ...KNOWN_UNAUTHORED_BY_BITHIRE,
    ]);
  });

  it('every channel bithire leaves unauthored is still expressible statically', () => {
    // The distinction the two describes exist to keep apart. If one of these
    // ever stops being reachable from a BrandTheme field, it is no longer an
    // authoring gap — it is the contract drift, and it fails above too.
    for (const channel of KNOWN_UNAUTHORED_BY_BITHIRE) {
      expect({ channel, expressible: staticMirrorChannels.has(channel) }).toEqual({
        channel,
        expressible: true,
      });
    }
  });
});

describe('STATIC/DB VOCABULARY · drill', () => {
  it('renaming one emitted channel in a compiled result is detected', () => {
    const compiled = compileCustomerDocument('tenant_vocabulary_drill');

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
        (channel) => inCoreFamilies(channel) && !staticMirrorChannels.has(channel)
      )
    );
    // The baseline is zero, so the plant is the ENTIRE difference — the drill
    // measures itself and not ambient divergence.
    expect(dbOnly).toEqual([`${victim}-db`]);
  });
});
