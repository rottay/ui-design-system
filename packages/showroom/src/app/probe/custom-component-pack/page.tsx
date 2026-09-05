'use client';

/**
 * Custom component pack — isolated probe realm.
 *
 * WHY THIS ROUTE EXISTS AT ALL.
 *
 * A `DesignSystemProvider` claims the DOCUMENT ROOT's governed channels:
 * `data-tenant` (TenantProvider), `data-theme` + class `dark` + inline
 * `color-scheme` (ThemeProvider), `data-engine` (EngineProvider) and
 * `lang`/`dir` (I18nProvider). Those claims go through the root-attribute claim
 * stack, whose contract is that the LAST claim pushed on a channel is the live
 * one. There is exactly one document root per document, so two providers in one
 * document are two claimants of one set of channels.
 *
 * The docs page for component packs used to mount its own provider beneath the
 * persistent docs shell provider. That produced two different wrong answers
 * depending on how you arrived:
 *
 *   hard load      child layout effects run before ancestor layout effects, so
 *                  the shell claims LAST and wins. The page's own tenant/engine
 *                  never reach the root: the demo silently describes a root
 *                  state it does not own.
 *
 *   SPA arrival    the shell does not remount; only the page subtree commits,
 *                  so the page's claim is pushed ON TOP of the live shell claim
 *                  and the whole docs chrome is restamped with this demo's
 *                  tenant and engine until you navigate away.
 *
 * Neither is fixable by ordering, because both readings are correct for the
 * same claim stack. The fix is to stop sharing the document: this route is
 * mounted in an iframe by the docs page, so the provider below owns a root that
 * belongs to nobody else. `/probe/*` sits outside the `(docs)` route group and
 * therefore renders under the bare root layout — no docs shell, no second
 * provider, and the DS baseline stylesheet still applies because base tokens
 * are declared on plain `:root` / `html.dark`.
 *
 * WHAT THIS REALM PROVES. `custom` is FAIL-CLOSED in both of its halves, and
 * this file demonstrates both halves in one document.
 *
 *   the theme half     `custom` ships no theme adapter, so `resolveAdapter`
 *                      throws for it until one is registered through
 *                      `registerEngineAdapter`. A `DesignSystemProvider`
 *                      resolves that adapter while it renders, so a custom
 *                      realm with a component pack and no theme adapter does
 *                      not mount at all. This file registers exactly one.
 *
 *   the component half a name the active pack does not register is REFUSED BY
 *                      NAME. It does not fall through to classic, modern,
 *                      rustic or any default: there is no fallback engine and
 *                      no fallback loader. `Button` and `Card` are registered
 *                      here and resolve to this file's bespoke implementations;
 *                      `Input` and `Select` are deliberately not registered,
 *                      and the two hosts marked `data-pack-entry="refused"`
 *                      show the named refusal the engine factory's own
 *                      `EngineErrorBoundary` renders.
 *
 * Everything else inside the custom realm is native markup on purpose. A DS
 * primitive is engine-switched, so under `custom` it too would have to be a
 * registered pack entry, and the compound typography owners (`Text`,
 * `Heading`, `Paragraph`, `Link`) are not pack-resolvable at all. Chrome is
 * therefore plain HTML, and the only DS components inside the realm are the
 * four that make the two claims above: `Button`, `Card`, `Input`, `Select`.
 *
 * WHAT "PAINTS NOTHING" ACTUALLY MEANS HERE, STATED NARROWLY. The realm does
 * not claim to write no `<style>` and no `<link>` at all: a
 * `DesignSystemProvider` may legitimately mount subordinate or global styles of
 * its own, and Next mounts route CSS regardless. Those are not the pack's doing
 * and this file has no business asserting their absence.
 *
 * The accurate law, and the one the isolation spec measures, is narrower and
 * is about the PACK: because the tenant config is identity-only, it carries no
 * visual payload to compile, so this realm mounts NO tenant-theme artifact
 * (`style[data-ds-tenant-theme-digest]`) and writes NO `--ds-*` custom property
 * onto the document root. A component pack substitutes components; it does not
 * acquire paint.
 */

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  DesignSystemProvider,
  Input,
  Select,
  defineEngineAdapter,
  getCustomComponent,
  registerCustomComponent,
  registerCustomComponents,
  registerEngineAdapter,
  resolveAdapter,
  unregisterCustomComponent,
  type TenantConfig,
} from '@rottay/design-system';

const PACK_ID = 'ds-example-pack';

/**
 * The exact names this module registers. Cleanup touches these two keys, in
 * this pack, and nothing else: it must not call `clearCustomRegistry(PACK_ID)`,
 * because that would delete the whole pack registry including entries this
 * module never wrote. Scoped registration, scoped removal.
 */
const PACK_COMPONENT_NAMES = ['Button', 'Card'] as const;

/**
 * The names deliberately left OUT of the pack, so the realm can show what a
 * miss actually does. Kept next to the registered list because the two are one
 * decision: everything the realm renders is on exactly one of them.
 */
const PACK_REFUSED_NAMES = ['Input', 'Select'] as const;

/**
 * The theme adapter for `custom`.
 *
 * An engine adapter is a token baseline plus the per-control posture cells the
 * lowering reads; `custom` ships none, which is a DECLARED absence rather than
 * an oversight, and `registerEngineAdapter` is the single door any engine
 * beyond the shipped three enters by. This realm borrows `modern`'s baseline
 * and posture — a component pack has no opinion about tokens — and projects
 * nothing, because an identity-only tenant has nothing to project.
 *
 * `resolveAdapter('modern')` is the public read for the shipped row; the
 * adapter objects themselves are not on the package's public surface.
 */
const MODERN_ADAPTER = resolveAdapter('modern');

const CUSTOM_THEME_ADAPTER = defineEngineAdapter({
  id: 'custom',
  tokenBaseline: MODERN_ADAPTER.tokenBaseline,
  controls: MODERN_ADAPTER.controls,
  project: () => ({ seeds: {}, modes: [] }),
});

/**
 * Register the adapter at most once per document.
 *
 * `registerEngineAdapter` refuses a second registration for the same id, and
 * the registry publishes no teardown on the package's public surface — so
 * there is nothing to clean up and nothing may re-register. Existence is probed
 * through `resolveAdapter`, which is the same door, because that is the only
 * public statement of whether the id is already answered: it returns the
 * adapter when one is registered and throws when none is. A module re-evaluated
 * by fast refresh therefore finds the live registration instead of colliding
 * with it.
 */
function ensureCustomThemeAdapter(): void {
  try {
    resolveAdapter('custom');
  } catch {
    registerEngineAdapter(CUSTOM_THEME_ADAPTER);
  }
}

interface PackComponentProps {
  children?: ReactNode;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * A pack's bespoke Button.
 *
 * It renders its own anatomy — a state dot plus a tracked label — instead of the
 * flagship one, out of native elements. It must not render the DS `Button`:
 * this component IS `Button` under this pack, so doing so would re-enter the
 * factory forever. It must not render any other DS primitive either, because
 * the active engine is `custom` and every engine-switched name resolves against
 * this pack, which registers only `Button` and `Card`.
 *
 * Prop ownership is explicit, and the order in the JSX is what enforces it:
 *
 *   1. `style` is destructured OUT of the props, so it cannot arrive again
 *      through `...rest`. The consumer's style is merged OVER the pack's base
 *      style, so a caller can restyle the control — and the anatomy (dot,
 *      label) is structural markup, not styling, so no consumer style can
 *      delete it.
 *   2. `type` is destructured out too, and republished AFTER `{...rest}` as
 *      `type ?? 'button'`. A caller may still ask for `type="submit"` — that is
 *      a legitimate thing to want from a button — but it arrives through the
 *      named prop the component owns, not through the spread. Left before the
 *      spread it would have been silently overwritable, which is the opposite
 *      of the guarantee this file claims.
 *   3. The pack's own witnesses are written AFTER `{...rest}`. A consumer prop
 *      named `data-pack` or `data-pack-part` cannot forge or erase the evidence
 *      that this component came from the pack. Consumer-owned attributes such
 *      as `data-testid` and `onClick` arrive through `...rest` and survive
 *      untouched.
 */
function PackButton({
  children,
  style,
  type,
  variant = 'primary',
  ...rest
}: PackComponentProps & { type?: 'button' | 'submit' | 'reset'; variant?: string }) {
  const isPrimary = variant === 'primary';

  const packBase: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    cursor: 'pointer',
    border: '1px solid var(--ds-color-border-secondary)',
    borderRadius: 2,
    background: isPrimary ? 'var(--ds-color-bg-elevated)' : 'transparent',
    color: 'var(--ds-color-text-primary)',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  };

  return (
    <button
      style={{ ...packBase, ...(style ?? {}) }}
      {...rest}
      type={type ?? 'button'}
      data-pack={PACK_ID}
      data-pack-part="button"
      data-pack-variant={variant}
    >
      <span
        aria-hidden
        data-pack-part="button-dot"
        style={{
          display: 'block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          flex: '0 0 6px',
          background: isPrimary ? 'var(--ds-color-primary)' : 'var(--ds-color-text-muted)',
        }}
      />
      <span data-pack-part="button-label">{children}</span>
    </button>
  );
}

/**
 * A pack's bespoke Card: a left accent rail the flagship card does not have.
 * Same rules as `PackButton` — native elements only, consumer style merges over
 * the pack base, and the pack's witnesses are written after the consumer's
 * props.
 */
function PackCard({ children, style, ...rest }: PackComponentProps) {
  const packBase: CSSProperties = {
    display: 'flex',
    borderRadius: 2,
    overflow: 'hidden',
    border: '1px solid var(--ds-color-border-secondary)',
    background: 'var(--ds-color-bg-primary)',
  };

  return (
    <div style={{ ...packBase, ...(style ?? {}) }} {...rest} data-pack={PACK_ID} data-pack-part="card">
      <div
        aria-hidden
        data-pack-part="card-rail"
        style={{ width: 3, flex: '0 0 3px', background: 'var(--ds-color-primary)' }}
      />
      <div data-pack-part="card-body" style={{ flex: 1, padding: 16 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * The tenant that activates the pack, written out in full on purpose.
 *
 * It is a CUSTOMER tenant, not a first-party one, and not a clone of one. Its
 * `slug`, `name` and `branding.companyName` are its own: a value that folds
 * onto a reserved first-party identity (`rottay`, `bithire`, `evnto`, in any
 * casing, spacing or invisible-character disguise) is refused by
 * `assertProviderTenantConfig`, and the slug must be canonical lower-kebab.
 *
 * It is also identity-only. There is no `brandTheme`, no `appearance`, no
 * `personality`, no `tokenOverrides`, and no colour or font under `branding` --
 * because a component pack is component selection, and nothing here is entitled
 * to paint. That absence is what makes the provider below legal with no
 * `visualAuthority` prop: a config carrying runtime visual payload and no
 * verified compiled artifact resolves `uncompiled-visual-payload` and blocks.
 *
 * `vertical` names a registered DS vertical preset -- a baseline, not an
 * identity claim -- and `componentPack` is the only pack-related field a tenant
 * ever sets.
 *
 * Frozen here so this module cannot be talked into mutating the object it
 * publishes; the provider additionally deep-clones and freezes its own snapshot
 * before validating it.
 */
const PACK_TENANT_CONFIG: TenantConfig = Object.freeze({
  slug: 'showroom-component-pack',
  name: 'Showroom Component Pack',
  theme: 'base',
  plan: 'starter',
  features: [],
  branding: Object.freeze({ companyName: 'Showroom Component Pack' }),
  vertical: 'rottay',
  componentPack: PACK_ID,
});

const SELECT_OPTIONS = [
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'enterprise', label: 'Enterprise' },
];

const NOTE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: 12,
  lineHeight: 1.55,
  color: 'var(--ds-color-text-secondary)',
};

const MUTED_NOTE_STYLE: CSSProperties = {
  ...NOTE_STYLE,
  color: 'var(--ds-color-text-muted)',
};

/**
 * The live ground. Everything inside it resolves through the custom engine
 * against `ds-example-pack`: `Button` and `Card` hit the pack; `Input` and
 * `Select` miss it and are refused by name inside the engine factory's own
 * error boundary, which is why the realm around them keeps rendering.
 *
 * The button writes to a visible output, so "it rendered" and "it works" are
 * two different, separately observable claims. The refused hosts have no such
 * output by construction: a refused component has no behaviour to observe, and
 * the refusal text IS the observation.
 */
function PackDemoGround() {
  const [lastAction, setLastAction] = useState('none');

  const onApprove = useCallback(() => setLastAction('approve'), []);
  const onDismiss = useCallback(() => setLastAction('dismiss'), []);

  return (
    <div
      data-testid="custom-pack-ground"
      data-pack={PACK_ID}
      data-demo-engine="custom"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 20,
        border: '1px solid var(--ds-color-border-secondary)',
        borderRadius: 4,
        background: 'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--ds-color-text-primary)',
            }}
          >
            custom + ds-example-pack
          </h1>
          <p style={NOTE_STYLE}>
            Bespoke Button and Card. Input and Select have no pack entry and are refused by name --
            there is no fallback engine.
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: 999,
            border: '1px solid var(--ds-color-border-secondary)',
            background: 'var(--ds-color-bg-elevated)',
            color: 'var(--ds-color-text-primary)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          custom
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {/*
          The `letterSpacing` here is a deliberate causal probe, not decoration.

          `PackButton` builds `{ ...packBase, ...(style ?? {}) }`, and
          `packBase` sets `letterSpacing: '0.08em'` AND
          `textTransform: 'uppercase'`. So this one declaration produces two
          separately observable facts on the same element: the consumer's
          value WINS on the property it names, and the pack's own base
          SURVIVES on the property it does not. A pack that replaced the
          consumer style would show 0.08em; a pack that let the consumer
          style replace its base would lose the uppercase. The value is odd
          on purpose so nothing else in the tree can produce it by accident.
        */}
        <Button
          variant="primary"
          data-testid="custom-pack-button-primary"
          onClick={onApprove}
          style={{ letterSpacing: '0.42em' }}
        >
          Approve
        </Button>
        <Button variant="secondary" data-testid="custom-pack-button-secondary" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>

      <p data-testid="custom-pack-action-output" style={NOTE_STYLE}>
        action: {lastAction}
      </p>

      {/*
        The two refusals.

        `createEngineComponent` resolves a `custom` name through the active
        pack and throws `No custom implementation registered for "<name>" in
        pack "ds-example-pack"` when the pack has no entry. That throw is
        raised inside the loader the factory hands to `React.lazy`, and the
        factory wraps every one of its routers in its own `EngineErrorBoundary`
        — so the refusal is named, contained to the component that was asked
        for, and does not take the realm down with it. The boundary is the DS's
        own; this page adds none, because an outer boundary would never see the
        error and pretending otherwise would misdescribe where containment
        lives.

        No `value`/`onChange` is passed. A refused component never mounts, so a
        controlled-input contract here would be decoration for something that
        does not exist; the props kept are the ones that name what was asked
        for.
      */}
      <div data-testid="custom-pack-refused-input" data-pack-entry="refused">
        <Input placeholder="Search tenant or company..." />
      </div>

      <div data-testid="custom-pack-refused-select" data-pack-entry="refused">
        <Select options={SELECT_OPTIONS} placeholder="Choose a plan" />
      </div>

      <p data-testid="custom-pack-refusal-note" style={MUTED_NOTE_STYLE}>
        refused: {PACK_REFUSED_NAMES.join(', ')}
      </p>

      <Card
        data-testid="custom-pack-card"
        style={{
          border: '1px solid var(--ds-color-border-secondary)',
          background: 'var(--ds-color-bg-primary)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ds-color-text-primary)',
              }}
            >
              Workflow module
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--ds-color-success-700, var(--ds-color-text-primary))',
              }}
            >
              Active
            </span>
          </div>
          <p style={NOTE_STYLE}>
            This card is the pack&apos;s own card -- the accent rail on its left edge is anatomy the
            flagship card does not have, and the style passed by this caller merges over the
            pack&apos;s own base without removing it.
          </p>
        </div>
      </Card>

      {/*
        The client-side exit.

        Tearing this realm down by loading a different document proves nothing
        about the cleanup effect: a document teardown releases everything
        whether or not the effect is correct. Only a Next client-side route
        transition keeps the same document and the same module-global registry
        alive while React unmounts this subtree, which is the one condition
        under which the unregister/restore path in this page's effect is
        actually exercised and observable.

        So this is a real `next/link`, not a plain href and not `ShowroomLink`
        (which rewrites hrefs with an engine/tenant override read from
        localStorage and would move the realm out from under the test).
      */}
      <div>
        <Link
          href="/probe"
          data-testid="custom-pack-exit"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--ds-color-text-secondary)',
            textDecoration: 'underline',
          }}
        >
          Leave this realm (client-side)
        </Link>
      </div>
    </div>
  );
}

const REALM_STYLE: CSSProperties = { padding: 24, minHeight: 240 };

export default function CustomComponentPackProbePage() {
  /**
   * Registration is a client effect, never a module side effect.
   *
   * `createCustomWrapper` reads the pack registry at COMPONENT LOAD time and
   * `React.lazy` caches whatever that read produced, so a `Button` that begins
   * loading before the pack is registered caches a refusal and never looks
   * again. Registering at module scope would appear to work and would be a
   * race: on this route the module and the provider are in the same client
   * bundle, and load order is not a contract.
   *
   * So: register, then flip `packReady`, and only then mount the provider. The
   * gate makes "the pack is registered" a precondition of rendering rather than
   * a hope about ordering. The theme adapter rides the same gate for a
   * different reason — the provider resolves it while it renders, so it has to
   * exist before the provider is in the tree at all.
   *
   * Cleanup is deliberately not "delete the two keys". A registry is shared
   * mutable state, so this effect records what each key held BEFORE it wrote,
   * and on teardown it only acts on a key that still holds ITS OWN
   * implementation:
   *
   *   - key still ours, no predecessor  -> unregister it;
   *   - key still ours, had a predecessor -> put the predecessor back;
   *   - key taken over by someone else   -> leave it completely alone.
   *
   * The identity check is what makes the last case possible: without it, an
   * unmount would silently delete a foreign registration that happened to land
   * on the same name in the same pack. `getCustomComponent` is the public read
   * that makes the check available, so the restraint costs nothing.
   *
   * The theme adapter has no matching teardown, and that asymmetry is the
   * registry contract rather than an omission: `registerEngineAdapter` is the
   * only door on the public surface and it publishes no inverse, so an engine
   * id is answered for the life of the document once it is answered at all.
   *
   * Under React Strict Mode the effect runs, tears down and runs again. The
   * teardown restores exactly what was there before the first run, the second
   * run re-records it and re-registers, and the final state is registered. No
   * render happens between the teardown and the re-registration.
   */
  const [packReady, setPackReady] = useState(false);

  useEffect(() => {
    ensureCustomThemeAdapter();

    const ownedImplementations: Record<string, unknown> = {
      Button: PackButton,
      Card: PackCard,
    };
    const predecessors = new Map<string, unknown>();

    PACK_COMPONENT_NAMES.forEach((name) => {
      predecessors.set(name, getCustomComponent(name, PACK_ID));
    });

    registerCustomComponents(
      {
        Button: PackButton as never,
        Card: PackCard as never,
      },
      PACK_ID
    );
    setPackReady(true);

    return () => {
      PACK_COMPONENT_NAMES.forEach((name) => {
        const live: unknown = getCustomComponent(name, PACK_ID);

        if (live !== ownedImplementations[name]) {
          return;
        }

        const predecessor = predecessors.get(name);

        if (predecessor === undefined) {
          unregisterCustomComponent(name, PACK_ID);
          return;
        }

        registerCustomComponent(name, predecessor as never, PACK_ID);
      });
    };
  }, []);

  /*
    Both branches are native markup, and they have to be: this element is
    OUTSIDE the provider, so no engine is declared for it, and an engine-switched
    DS primitive refuses to render without one. That refusal is the same law the
    realm below demonstrates, seen from the other side.
  */
  if (!packReady) {
    return (
      <div data-testid="custom-pack-realm" data-pack-ready="false" style={REALM_STYLE}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--ds-color-text-primary)' }}>
          Registering ds-example-pack...
        </p>
      </div>
    );
  }

  return (
    <div data-testid="custom-pack-realm" data-pack-ready="true" style={REALM_STYLE}>
      <DesignSystemProvider forceEngine="custom" tenantConfig={PACK_TENANT_CONFIG}>
        <PackDemoGround />
      </DesignSystemProvider>
    </div>
  );
}
