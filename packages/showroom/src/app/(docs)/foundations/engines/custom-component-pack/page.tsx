'use client';

import { useCallback, useState } from 'react';
import { Badge, Box, Button, Card, Flex, Stack, Text, useTokens } from '@rottay/design-system';
import { CodeBlock } from '@/components/playground';
import { FoundationTopRail } from '../../foundation-top-rail';

/**
 * Docs page for custom component packs.
 *
 * This page registers nothing, activates no tenant and mounts no
 * `DesignSystemProvider`. That is deliberate and it is the lesson: a provider
 * claims the DOCUMENT ROOT's tenant, theme, engine and language channels, and
 * the docs shell already owns those channels for every page in this section. A
 * second provider in the same document is a second claimant of one set of
 * channels, and the claim stack gives the channel to whoever claimed LAST --
 * which is the docs shell on a hard load, and this page on a client-side
 * arrival. Both readings are correct; that is precisely why the arrangement is
 * wrong.
 *
 * So the live pack runs in `/probe/custom-component-pack`, in an iframe. One
 * provider per document, and the document the provider owns is the frame's.
 */

const PACK_FRAME_SRC = '/probe/custom-component-pack';

const REGISTRATION_CODE = `import {
  DesignSystemProvider,
  defineEngineAdapter,
  registerCustomComponents,
  registerEngineAdapter,
  resolveAdapter,
  unregisterCustomComponent,
  type TenantConfig,
} from '@rottay/design-system';

// 1. A pack carries bespoke React components and nothing else. The key is the
//    flagship component's name; the second argument is the pack id. Register in
//    a client effect, not at module scope: the component factory reads the
//    registry at component LOAD time and React.lazy caches that read, so a
//    Button that starts loading before registration caches a refusal and never
//    looks again. Gate the provider on packReady so registration is a
//    precondition of rendering rather than a hope about module order.
//
//    This is the SIMPLE case: your app owns the pack id and nothing else writes
//    to it, so unregistering the names you wrote is safe. The registry is
//    shared mutable state, though, so if a pack id can be written by more than
//    one owner, read the key back with getCustomComponent before removing it
//    and only act when it still holds YOUR implementation -- otherwise an
//    unmount deletes somebody else's registration. The probe page behind the
//    frame below does exactly that, and restores a predecessor if there was one.
useEffect(() => {
  // The theme adapter from step 2, registered here and guarded: resolveAdapter
  // is the only public statement of whether 'custom' is already answered, so a
  // module re-evaluated by fast refresh adopts the live registration instead of
  // colliding with it.
  try {
    resolveAdapter('custom');
  } catch {
    registerEngineAdapter(customThemeAdapter);
  }

  registerCustomComponents({ Button: PackButton, Card: PackCard }, 'ds-example-pack');
  setPackReady(true);

  return () => {
    unregisterCustomComponent('Button', 'ds-example-pack');
    unregisterCustomComponent('Card', 'ds-example-pack');
  };
}, []);

// 2. A pack replaces components; it says nothing about tokens. 'custom' ships
//    no theme adapter, so resolveAdapter('custom') throws until one is
//    registered -- and DesignSystemProvider resolves it while it renders, so a
//    custom realm without one does not mount at all. Register exactly one,
//    through the single door any engine beyond the shipped three enters by.
//
//    Defining the adapter is pure, so it belongs at module scope. REGISTERING
//    it is not: registerEngineAdapter refuses a second registration for the
//    same id and the registry publishes no public teardown, so an unguarded
//    module-scope call throws on the first fast refresh, and again if two
//    modules in one document both make it. Do it in the effect above, behind
//    the resolveAdapter probe, which is what the probe page below does.
const modern = resolveAdapter('modern');

const customThemeAdapter = defineEngineAdapter({
  id: 'custom',
  tokenBaseline: modern.tokenBaseline,
  controls: modern.controls,
  project: () => ({ seeds: {}, modes: [] }),
});

// 3. Activate it with a full CUSTOMER tenant config -- authored, never spread
//    from another tenant. Identity is the customer's own: a slug, name or
//    companyName that folds onto a reserved first-party identity is rejected,
//    and the slug must be canonical lower-kebab. The config is identity-only:
//    no brandTheme, appearance, personality, tokenOverrides, colour or font.
//    'vertical' names a registered DS vertical preset (a baseline), not an
//    identity; 'componentPack' is the only pack field a tenant ever sets.
const tenantConfig: TenantConfig = {
  slug: 'showroom-component-pack',
  name: 'Showroom Component Pack',
  theme: 'base',
  plan: 'starter',
  features: [],
  branding: { companyName: 'Showroom Component Pack' },
  vertical: 'rottay',
  componentPack: 'ds-example-pack',
};

// 4. One provider per document. The provider claims the document root's tenant,
//    theme, engine and language channels, so it belongs at the root of a
//    document nothing else owns -- your app shell, or a frame. No
//    visualAuthority prop, because the config paints nothing and there is
//    nothing to declare; a config that DID carry visual payload would need a
//    verified compiled artifact declaration, and without one the provider
//    blocks. Every engine-switched name rendered inside this realm must have an
//    entry in the pack: a name with none is refused by name, with no fallback
//    engine and no fallback loader behind it.
<DesignSystemProvider forceEngine="custom" tenantConfig={tenantConfig}>
  <Button variant="primary">Approve</Button>
</DesignSystemProvider>`;

export default function CustomComponentPackPage() {
  const tokens = useTokens();
  const [frameMounted, setFrameMounted] = useState(false);

  const toggleFrame = useCallback(() => {
    setFrameMounted((mounted) => !mounted);
  }, []);

  return (
    <Stack spacing="lg" fullWidth>
      <FoundationTopRail
        backHref="/foundations/engines"
        backLabel="Engines"
        badge="Custom engine · component packs"
        title="Custom engine: component packs"
        description="A white-label tenant substitutes bespoke React components for the flagship set under a pack id. A pack changes which components render -- never how the product is painted."
        panels={[
          {
            title: 'What a pack is',
            body: 'A map of flagship component names to bespoke React components, registered under a pack id and activated per tenant through TenantConfig.componentPack.',
            tone: 'accent',
          },
          {
            title: 'What a pack is not',
            body: 'Not a visual layer. Tenant styling is compiled on the server and embedded for SSR; the client hydrates that exact artifact and nothing may paint over it. A pack ships no CSS and no token overrides.',
          },
          {
            title: 'A partial pack is a partial realm',
            body: 'A name with no pack entry is refused by name -- there is no fallback engine and no fallback loader behind it. In the frame below, Button and Card resolve from the pack; Input and Select are refused, inside the engine factory\'s own error boundary.',
            tone: 'dark',
          },
        ]}
        stats={[
          { label: 'Pack payload', value: 'Components', detail: 'Registered under a pack id' },
          { label: 'Overridden here', value: '2', detail: 'Button, Card -- Input/Select are refused' },
          { label: 'Theme adapters', value: '1', detail: "custom must register one; it ships none" },
          { label: 'Visual authority', value: 'None', detail: 'Tenant paint is the compiled artifact' },
          { label: 'Providers per document', value: '1', detail: 'The live pack owns a frame, not this page' },
        ]}
      />

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
            <Box>
              <Text as={'h2' as never} size="xl" weight="semibold">
                registerCustomComponents
              </Text>
              <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)' }}>
                Components registered in a client effect, activated per tenant via componentPack;
                the engine&apos;s own theme adapter registered alongside them.
              </Text>
            </Box>
            <Badge variant="secondary">customization/component-registry</Badge>
          </Flex>
          <CodeBlock title="registerCustomComponents" language="tsx" code={REGISTRATION_CODE} />
        </Stack>
      </Card>

      <Stack spacing="md" fullWidth>
        <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <Text as={'h2' as never} size="xl" weight="semibold">
            The pack, live
          </Text>
          <Badge variant="secondary">One provider per document</Badge>
        </Flex>

        <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
          <Stack spacing="md" fullWidth>
            <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
              The demo runs in a frame, and this page mounts no provider of its own. A{' '}
              <code>DesignSystemProvider</code> claims the document root&apos;s tenant, theme, engine
              and language channels; the docs shell already claims them for every page in this
              section. Two providers in one document are two claimants of one set of channels, and
              the last claim wins -- the shell on a hard load, the page on a client-side arrival. The
              rule is one provider per document, so the pack&apos;s provider gets a document of its
              own and this page keeps the root state the shell gave it.
            </Text>

            <Flex align="center" justify="between" style={{ flexWrap: 'wrap', gap: 12 }}>
              <Text size="xs" style={{ color: 'var(--ds-color-text-muted)' }}>
                Frame source: <code>{PACK_FRAME_SRC}</code>
              </Text>
              <Button
                variant="secondary"
                data-testid="custom-pack-frame-toggle"
                aria-expanded={frameMounted}
                onClick={toggleFrame}
              >
                {frameMounted ? 'Unmount the frame' : 'Mount the frame'}
              </Button>
            </Flex>

            <Box
              data-testid="custom-pack-frame-slot"
              data-frame-mounted={frameMounted ? 'true' : 'false'}
              style={{
                border: '1px solid var(--ds-color-border-secondary)',
                borderRadius: 4,
                background: 'var(--ds-color-bg-primary)',
                minHeight: 120,
                overflow: 'hidden',
              }}
            >
              {frameMounted ? (
                <iframe
                  src={PACK_FRAME_SRC}
                  title="Custom component pack, running in its own document"
                  data-testid="custom-pack-frame"
                  loading="lazy"
                  style={{ display: 'block', width: '100%', height: 620, border: 0 }}
                />
              ) : (
                <Box style={{ padding: 20 }}>
                  <Text size="sm" style={{ color: 'var(--ds-color-text-muted)', lineHeight: 1.6 }}>
                    The frame is not mounted. Mounting it loads a second document that owns its own
                    root; unmounting it takes that document away. Neither transition touches this
                    document&apos;s root attributes or its stylesheets.
                  </Text>
                </Box>
              )}
            </Box>
          </Stack>
        </Card>
      </Stack>

      <Card style={{ width: '100%', padding: tokens.spacing[5] }}>
        <Stack spacing="md" fullWidth>
          <Text as={'h2' as never} size="lg" weight="semibold">
            Coverage, stated plainly
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
            The frame swaps two components, not a stylesheet. <code>Button</code> and{' '}
            <code>Card</code> resolve to the probe&apos;s <code>PackButton</code>/<code>PackCard</code>,
            which render an anatomy the flagship components do not have -- a state dot, a left accent
            rail -- and which merge a caller&apos;s style over the pack&apos;s own base rather than
            replacing it. The bespoke button writes to a visible output, so &quot;it rendered&quot;
            and &quot;it works&quot; stay two separate claims.
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
            <code>Input</code> and <code>Select</code> have no entry under{' '}
            <code>ds-example-pack</code>, and that is the second thing the frame shows. They do not
            fall through to classic, modern, rustic or any default: the factory refuses them by name
            with{' '}
            <code>No custom implementation registered for &quot;Input&quot; in pack
            &quot;ds-example-pack&quot;</code>, and the engine factory&apos;s own{' '}
            <code>EngineErrorBoundary</code> renders that refusal in place, which is why one missing
            entry does not take the realm down with it. A refused component never mounts, so there is
            no behaviour to try: the refusal text is the whole observation. Everything else inside
            the realm is native markup, because under <code>custom</code> every engine-switched name
            resolves against the pack, and the compound typography owners (<code>Text</code>,{' '}
            <code>Heading</code>, <code>Paragraph</code>, <code>Link</code>) are not pack-resolvable
            at all.
          </Text>
          <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', lineHeight: 1.6 }}>
            The pack acquires no paint. Stated precisely, because the loose version of this
            sentence is wrong: a provider may legitimately mount subordinate or global styles, and
            Next mounts route CSS either way, so &quot;no <code>&lt;style&gt;</code> anywhere&quot;
            is not the law. The law is that an identity-only tenant carries no visual payload to
            compile, so no tenant-theme artifact is stamped and no <code>--ds-*</code> custom
            property or inline style is written on a document root. That is not a claim this page
            measures in your browser -- it is asserted in Core, by{' '}
            <code>component-pack-resolution.integration.test.tsx</code>, which fingerprints the whole
            style surface and requires it to stay identical across registering, activating, switching
            and unmounting a pack, and by{' '}
            <code>component-pack-admission.integration.test.tsx</code>, which admits the identity-only
            customer tenant and refuses a config folded onto a first-party identity. What these two
            documents add are stable witnesses for the browser isolation spec:{' '}
            <code>custom-pack-frame-toggle</code> and <code>custom-pack-frame</code> here;{' '}
            <code>custom-pack-realm</code>, <code>custom-pack-ground</code>,{' '}
            <code>custom-pack-button-primary</code>, <code>custom-pack-button-secondary</code>,{' '}
            <code>custom-pack-card</code> (each carrying <code>data-pack=&quot;ds-example-pack&quot;</code>{' '}
            and a <code>data-pack-part</code> anatomy witness) and{' '}
            <code>custom-pack-refused-input</code> / <code>custom-pack-refused-select</code>, marked{' '}
            <code>data-pack-entry=&quot;refused&quot;</code>, in the frame.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
