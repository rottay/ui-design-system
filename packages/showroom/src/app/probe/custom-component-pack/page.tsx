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
 * WHAT THIS REALM PROVES. `Button` and `Card` resolve to this file's bespoke
 * implementations under `ds-example-pack`; `Input` and `Select` have no entry
 * in that pack and resolve through their own fallback loader, and stay fully
 * interactive.
 *
 * WHAT "PAINTS NOTHING" ACTUALLY MEANS HERE, STATED NARROWLY. An earlier
 * version of this comment claimed the realm writes no `<style>` and no
 * `<link>` at all. That was an overclaim and it is withdrawn: a
 * `DesignSystemProvider` may legitimately mount subordinate or global styles
 * of its own, and Next mounts route CSS regardless. Those are not the pack's
 * doing and this file has no business asserting their absence.
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
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  DesignSystemProvider,
  getCustomComponent,
  registerCustomComponent,
  registerCustomComponents,
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

interface PackComponentProps {
  children?: ReactNode;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * A pack's bespoke Button.
 *
 * It renders its own anatomy — a state dot plus a tracked label — instead of the
 * flagship one. It must not render the DS `Button`: this component IS `Button`
 * under this pack, so doing so would re-enter the factory forever. `Box
 * as="button"` gives a real, focusable, clickable control.
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
 *   3. `as` is published after the spread with no escape hatch: this component
 *      IS the pack's Button, and it decides that its host element is a real
 *      `<button>`. A caller cannot spread it into a `<div>`.
 *   4. The pack's own witnesses are written AFTER `{...rest}`. A consumer prop
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
    <Box
      style={{ ...packBase, ...(style ?? {}) }}
      {...rest}
      as="button"
      type={type ?? 'button'}
      data-pack={PACK_ID}
      data-pack-part="button"
      data-pack-variant={variant}
    >
      <Box
        aria-hidden
        data-pack-part="button-dot"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          flex: '0 0 6px',
          background: isPrimary ? 'var(--ds-color-primary)' : 'var(--ds-color-text-muted)',
        }}
      />
      <Box as="span" data-pack-part="button-label">
        {children}
      </Box>
    </Box>
  );
}

/**
 * A pack's bespoke Card: a left accent rail the flagship card does not have.
 * Same two rules as `PackButton` — consumer style merges over the pack base,
 * and the pack's witnesses are written after the consumer's props.
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
    <Box
      style={{ ...packBase, ...(style ?? {}) }}
      {...rest}
      data-pack={PACK_ID}
      data-pack-part="card"
    >
      <Box
        aria-hidden
        data-pack-part="card-rail"
        style={{ width: 3, flex: '0 0 3px', background: 'var(--ds-color-primary)' }}
      />
      <Box data-pack-part="card-body" style={{ flex: 1, padding: 16 }}>
        {children}
      </Box>
    </Box>
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

/**
 * The live ground. Everything inside it resolves through the custom engine
 * against `ds-example-pack`: `Button` and `Card` hit the pack, `Input` and
 * `Select` miss it and resolve through the component's own fallback loader.
 *
 * Every control writes to a visible output, so "it rendered" and "it works" are
 * two different, separately observable claims.
 */
function PackDemoGround() {
  const [selectValue, setSelectValue] = useState('growth');
  const [inputValue, setInputValue] = useState('');
  const [lastAction, setLastAction] = useState('none');

  const onApprove = useCallback(() => setLastAction('approve'), []);
  const onDismiss = useCallback(() => setLastAction('dismiss'), []);

  return (
    <Box
      data-testid="custom-pack-ground"
      data-pack={PACK_ID}
      data-demo-engine="custom"
      style={{
        padding: 20,
        border: '1px solid var(--ds-color-border-secondary)',
        borderRadius: 4,
        background: 'linear-gradient(180deg, var(--ds-color-bg-elevated), var(--ds-color-bg-primary))',
      }}
    >
      <Stack spacing="md">
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Stack spacing={1}>
            <Text as={'h1' as never} size="lg" weight="bold">
              custom + ds-example-pack
            </Text>
            <Text size="xs" style={{ color: 'var(--ds-color-text-muted)', lineHeight: 1.55 }}>
              Bespoke Button and Card; fallback Input and Select. One provider, one document root.
            </Text>
          </Stack>
          <Badge variant="primary">custom</Badge>
        </Flex>

        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
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
        </Flex>

        <Text size="xs" data-testid="custom-pack-action-output" style={{ color: 'var(--ds-color-text-secondary)' }}>
          action: {lastAction}
        </Text>

        <Box data-testid="custom-pack-fallback-input" data-pack-entry="absent">
          <Input
            placeholder="Search tenant or company..."
            value={inputValue}
            onChange={(value) => setInputValue(value)}
          />
        </Box>

        <Text size="xs" data-testid="custom-pack-input-output" style={{ color: 'var(--ds-color-text-secondary)' }}>
          query: {inputValue}
        </Text>

        <Box data-testid="custom-pack-fallback-select" data-pack-entry="absent">
          <Select
            options={SELECT_OPTIONS}
            value={selectValue}
            onChange={(value) => setSelectValue(String(value))}
            placeholder="Choose a plan"
          />
        </Box>

        <Text size="xs" data-testid="custom-pack-select-output" style={{ color: 'var(--ds-color-text-secondary)' }}>
          plan: {selectValue}
        </Text>

        <Card
          data-testid="custom-pack-card"
          style={{
            border: '1px solid var(--ds-color-border-secondary)',
            background: 'var(--ds-color-bg-primary)',
          }}
        >
          <Stack spacing="sm">
            <Flex align="center" justify="between">
              <Text size="sm" weight="semibold">
                Workflow module
              </Text>
              <Badge variant="success">Active</Badge>
            </Flex>
            <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.55 }}>
              Selected plan: {selectValue}. This card is the pack&apos;s own card -- the accent rail
              on its left edge is anatomy the flagship card does not have, and the style passed by
              this caller merges over the pack&apos;s own base without removing it.
            </Text>
          </Stack>
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
        <Box>
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
        </Box>
      </Stack>
    </Box>
  );
}

export default function CustomComponentPackProbePage() {
  /**
   * Registration is a client effect, never a module side effect.
   *
   * `createCustomWrapper` reads the pack registry at COMPONENT LOAD time, so a
   * `Button` that begins loading before the pack is registered can legally
   * resolve the fallback and never look again. Registering at module scope
   * would appear to work and would be a race: on this route the module and the
   * provider are in the same client bundle, and load order is not a contract.
   *
   * So: register, then flip `packReady`, and only then mount the provider. The
   * gate makes "the pack is registered" a precondition of rendering rather than
   * a hope about ordering.
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
   * Under React Strict Mode the effect runs, tears down and runs again. The
   * teardown restores exactly what was there before the first run, the second
   * run re-records it and re-registers, and the final state is registered. No
   * render happens between the teardown and the re-registration.
   */
  const [packReady, setPackReady] = useState(false);

  useEffect(() => {
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

  if (!packReady) {
    return (
      <Box
        data-testid="custom-pack-realm"
        data-pack-ready="false"
        style={{ padding: 24, minHeight: 240 }}
      >
        <Text size="sm">Registering ds-example-pack...</Text>
      </Box>
    );
  }

  return (
    <Box
      data-testid="custom-pack-realm"
      data-pack-ready="true"
      style={{ padding: 24, minHeight: 240 }}
    >
      <DesignSystemProvider forceEngine="custom" tenantConfig={PACK_TENANT_CONFIG}>
        <PackDemoGround />
      </DesignSystemProvider>
    </Box>
  );
}
