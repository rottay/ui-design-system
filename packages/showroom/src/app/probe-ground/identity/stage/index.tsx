'use client';

import {
  Badge,
  Box,
  DesignSystemProvider,
  Divider,
  Flex,
  getKnownTenantConfig,
  Heading,
  Link,
  Stack,
  Text,
  type TenantConfig,
} from '@rottay/design-system';
import {
  emitTenantThemeArtifactForSsr,
  type MountedThemeStyleElement,
  type TenantThemeArtifact,
} from '@rottay/design-system/server';

import { RuntimeProof } from '../runtime-proof';
import { DashboardScreen } from '../screens/dashboard';
import { FormScreen } from '../screens/form';
import { ListScreen } from '../screens/list';
import { ModalScreen } from '../screens/modal';
import { PhoneScreen } from '../screens/phone';
import { RecordScreen } from '../screens/record';

export interface IdentityStageOption {
  id: string;
  label: string;
  href: string;
  active: boolean;
}

/** One row of the door's own unlit report, carried verbatim. */
export interface IdentityUnlitRow {
  id: string;
  tier: string;
  reason: string;
}

/**
 * The saved and the unsaved door, compared on the server over one document.
 * Every field is the result of a comparison the page performed, never a claim
 * this component restates.
 */
export interface IdentityDoorProof {
  publishOrigin: string;
  previewOrigin: string;
  patchIdentical: boolean;
  ledgerIdentical: boolean;
  reportIdentical: boolean;
  digestIdentical: boolean;
  cssIdentical: boolean;
  scopeIdentical: boolean;
}

export interface IdentityStageProps {
  title: string;
  intent: string;
  mode: 'light' | 'dark';
  screen: string;
  digest: string;
  decisionCount: number;
  unlit: IdentityUnlitRow[];
  tenantConfig: TenantConfig | null;
  /** The artifact the server mounted; `null` for the code-owned baseline. */
  artifact: TenantThemeArtifact | null;
  /** Exactly what `mountTenantTheme` returned, emitted here and nowhere else. */
  styleElements: readonly MountedThemeStyleElement[];
  authoredSeed: string | null;
  doorProof: IdentityDoorProof | null;
  columns: IdentityStageOption[];
  modes: IdentityStageOption[];
  screens: IdentityStageOption[];
}

function OptionRow({ label, options }: { label: string; options: IdentityStageOption[] }) {
  return (
    <Flex align="center" gap={10} wrap="wrap">
      <Text size="xs" weight="semibold" color="muted">
        {label}
      </Text>
      {options.map((option) => (
        <Link key={option.id} href={option.href}>
          <Text size="sm" weight={option.active ? 'semibold' : 'normal'}>
            {option.active ? `· ${option.label}` : option.label}
          </Text>
        </Link>
      ))}
    </Flex>
  );
}

/**
 * What the mounted identity does NOT show. The rows are the admission door's
 * own `unlit` list, so the stage states the gap the intent line above it would
 * otherwise imply is rendered.
 */
function UnlitReport({ rows, decisionCount }: { rows: IdentityUnlitRow[]; decisionCount: number }) {
  if (rows.length === 0) return null;
  return (
    <Stack spacing="xs">
      <Text size="xs" weight="semibold" color="muted">
        Accepted but unlit — {rows.length} of {decisionCount} decisions move nothing on this
        render; the door reports them, the stage does not derive them
      </Text>
      <Flex gap={8} wrap="wrap">
        {rows.map((row) => (
          <Badge key={row.id} variant="secondary" size="sm">
            {`${row.id} · ${row.tier} · ${row.reason}`}
          </Badge>
        ))}
      </Flex>
    </Stack>
  );
}

/**
 * What the two doors resolved, and whether the client saw the server's bytes.
 * Every row is a comparison someone else performed; this renders the verdicts.
 */
function MountReport({
  doorProof,
  bytesAgree,
  digest,
}: {
  doorProof: IdentityDoorProof | null;
  bytesAgree: boolean | null;
  digest: string | null;
}) {
  if (!doorProof || digest === null) return null;
  const rows: [string, boolean][] = [
    ['patch', doorProof.patchIdentical],
    ['ledger', doorProof.ledgerIdentical],
    ['admission report', doorProof.reportIdentical],
    ['artifact digest', doorProof.digestIdentical],
    ['artifact bytes', doorProof.cssIdentical],
    ['mount scope', doorProof.scopeIdentical],
    ['server bytes = client emission', bytesAgree === true],
  ];
  return (
    <Stack spacing="xs" data-testid="identity-mount-report">
      <Text size="xs" weight="semibold" color="muted">
        {`Two doors, one payload — ${doorProof.publishOrigin} against ${doorProof.previewOrigin}, over ${digest}`}
      </Text>
      <Flex gap={8} wrap="wrap">
        {rows.map(([label, agreed]) => (
          <Badge key={label} variant={agreed ? 'success' : 'error'} size="sm">
            {`${label} · ${agreed ? 'identical' : 'DIVERGED'}`}
          </Badge>
        ))}
      </Flex>
    </Stack>
  );
}

export function IdentityStage(props: IdentityStageProps) {
  const { artifact, screen, styleElements } = props;
  const shows = (name: string) => screen === 'all' || screen === name;
  const tenantConfig = props.tenantConfig ?? getKnownTenantConfig('bithire');

  // THE SERVER'S OWN BYTES, and the receipt that lets the runtime admit them.
  //
  // The emission is re-minted here rather than carried from the page because a
  // receipt is provenance, not data: it is admitted by module-private identity,
  // and the copy that survives the flight boundary is a different object in a
  // different module realm. What is carried is what a receipt cannot replace --
  // the mount's own `styleElements` -- and the two are compared below, so the
  // client half is proven against the server half instead of trusted.
  const emission = artifact
    ? emitTenantThemeArtifactForSsr(artifact, {
        slug: artifact.slug,
        verticalKey: artifact.verticalKey,
      })
    : null;
  const bytesAgree = emission ? emission.css === styleElements[0]?.css : null;

  return (
    <>
      {/* Outside the provider on purpose: the provider resolves during its own
          render, before any child has been committed, so an artifact mounted as
          a child is invisible to the proof that admits it. */}
      {styleElements.map((element) => (
        <style
          key={element.id}
          {...element.attributes}
          data-testid="identity-probe-artifact-style"
          dangerouslySetInnerHTML={{ __html: element.css }}
        />
      ))}
      <DesignSystemProvider
        forceEngine="modern"
        forceTheme={props.mode}
        tenantConfig={tenantConfig}
        visualAuthority={
          artifact && emission
            ? { authority: 'compiled-artifact', artifact, ssrReceipt: emission.receipt }
            : undefined
        }
        locale="en"
      >
        {/* The showroom body pins its own ground and font. `data-ds-root` is
            the DS's own nested-surface boundary, so tenant typography wins here
            by declaration instead of inheriting the host's. */}
        <Box
          data-testid="identity-probe-stage"
          data-ds-root=""
          padding="lg"
          minHeight="100vh"
          background="var(--ds-color-bg)"
        >
          <Stack spacing="lg" fullWidth>
            <Stack spacing="sm">
              <Flex align="center" gap={10} wrap="wrap">
                <Heading level="h1">{props.title}</Heading>
                <Badge variant="secondary">{props.mode}</Badge>
                <Badge variant="secondary">{props.decisionCount} decisions</Badge>
              </Flex>
              <Text size="sm" color="muted">
                {props.intent}
              </Text>
              <Text size="xs" color="muted">
                {props.digest}
              </Text>
              <MountReport
                doorProof={props.doorProof}
                bytesAgree={bytesAgree}
                digest={artifact?.digest ?? null}
              />
              <UnlitReport rows={props.unlit} decisionCount={props.decisionCount} />
              {/* Stated by hand, unlike the door's list above: a lit decision whose
                  render is identical across candidates, already routed elsewhere. */}
              <Text size="xs" color="muted">
                Named residual — shape.radius-scale is lit and its scale channel differs per
                candidate, but the ramp is emitted as calc(calc(Npx / scale) * scale), so it
                cancels itself: every candidate computes the same 9px control radius (button,
                input) and the same 0px table cell. That self-cancel is the DER-03 radius-dial
                residual, so nothing on this page is evidence about radius.
              </Text>
              <OptionRow label="Candidate" options={props.columns} />
              <OptionRow label="Mode" options={props.modes} />
              <OptionRow label="Screen" options={props.screens} />
            </Stack>

            <Divider />

            <RuntimeProof authoredSeed={props.authoredSeed} />

            <Divider />

            {shows('list') ? <ListScreen /> : null}
            {shows('list') && shows('record') ? <Divider /> : null}
            {shows('record') ? <RecordScreen /> : null}
            {shows('record') && shows('form') ? <Divider /> : null}
            {shows('form') ? <FormScreen /> : null}
            {shows('form') && shows('dashboard') ? <Divider /> : null}
            {shows('dashboard') ? <DashboardScreen /> : null}
            {shows('dashboard') && shows('modal') ? <Divider /> : null}
            {shows('modal') ? <ModalScreen initialOpen={screen === 'modal'} /> : null}
            {shows('modal') && shows('phone') ? <Divider /> : null}
            {shows('phone') ? <PhoneScreen /> : null}
          </Stack>
        </Box>
      </DesignSystemProvider>
    </>
  );
}
