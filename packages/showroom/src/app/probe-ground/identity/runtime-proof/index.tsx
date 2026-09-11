'use client';

import {
  Badge,
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  useActiveResponsivePosture,
  useDensity,
  useRecipeProfile,
  useTokens,
} from '@rottay/design-system';
import { useMotionPolicy, useMotionRecipe } from '@rottay/design-system/motion';

// ---------------------------------------------------------------------------
// What the RUNTIME consumed, as opposed to what the stylesheet painted.
//
// Every reading below comes from a hook inside the mounted provider, and none
// of them is reachable from the artifact's CSS: a container-width ladder, a
// motion policy resolved against the device, a recipe duration in milliseconds
// and the JS token layer are numbers React reads, not variables a rule applies.
// If the client provider does not admit the same artifact the server mounted,
// every one of them falls back to the DS baseline and the three candidates
// become indistinguishable here while their screens still look different --
// which is exactly the gap this surface exists to make visible.
// ---------------------------------------------------------------------------

export interface RuntimeProofProps {
  /** The seed the candidate's document authored; the negative control's subject. */
  authoredSeed: string | null;
}

interface Reading {
  label: string;
  source: string;
  value: string;
}

function ReadingTable({ rows, testId }: { rows: Reading[]; testId: string }) {
  return (
    <Stack spacing="xs" fullWidth data-testid={testId}>
      {rows.map((row) => (
        <Flex key={row.label} align="baseline" gap={10} wrap="wrap">
          <Box minWidth={190}>
            <Text size="xs" weight="semibold">
              {row.label}
            </Text>
          </Box>
          <Box minWidth={230}>
            <Text size="xs" color="muted">
              {row.source}
            </Text>
          </Box>
          <Text size="xs" data-testid={`runtime-proof-${row.label}`}>
            {row.value}
          </Text>
        </Flex>
      ))}
    </Stack>
  );
}

export function RuntimeProof({ authoredSeed }: RuntimeProofProps) {
  const posture = useActiveResponsivePosture();
  const policy = useMotionPolicy();
  const modal = useMotionRecipe('overlay.modal');
  const tokens = useTokens();
  const density = useDensity();
  const recipeProfile = useRecipeProfile();

  const consumed: Reading[] = [
    {
      label: 'responsive.posture',
      source: 'useActiveResponsivePosture()',
      value: `${posture.id} · compact ≤ ${posture.thresholds.compactMaxPx}px · standard ≤ ${posture.thresholds.standardMaxPx}px · span ${posture.spanBias}`,
    },
    {
      label: 'motion.dial',
      source: 'useMotionPolicy()',
      value: `intensity ${policy.intensity} · duration × ${policy.durationScale} · ambient ${policy.ambient} · ambient allowed ${String(policy.allowAmbientMotion)}`,
    },
    {
      label: 'overlay.modal',
      source: "useMotionRecipe('overlay.modal')",
      value: `enter ${modal.durations.enterMs}ms · exit ${modal.durations.exitMs}ms · ${modal.curve}`,
    },
    {
      label: 'personality.animation',
      source: 'useTokens().personality.animation',
      value: `intensity ${tokens.personality.animation.intensity} · entrance ${tokens.personality.animation.entranceDuration}ms · ${tokens.personality.animation.entrance}`,
    },
    {
      label: 'token layer',
      source: 'useTokens().borderRadius / .spacing',
      value: `radius.md ${tokens.borderRadius.md} · spacing[4] ${tokens.spacing[4]}`,
    },
    {
      label: 'density posture',
      source: 'useDensity()',
      value: density.posture,
    },
    {
      label: 'recipe profile',
      source: 'useRecipeProfile()',
      value: recipeProfile?.id ?? 'none',
    },
  ];

  // THE NEGATIVE CONTROL. `palette.seeds` is a paint decision: it belongs to
  // the artifact's CSS and must not arrive a second time as a JS value, because
  // a runtime that held the colour could repaint it and become the second
  // painter the whole authority barrier exists to prevent. So the seed must be
  // absent from every token this hook returns, and the colour token must still
  // be the variable REFERENCE it is for every tenant.
  const serializedTokens = JSON.stringify(tokens);
  const seedLeaked =
    authoredSeed !== null &&
    serializedTokens.toLowerCase().includes(authoredSeed.toLowerCase());
  const control: Reading[] = [
    {
      label: 'authored seed',
      source: "document.decisions['palette.seeds'].primary",
      value: authoredSeed ?? 'none (baseline column)',
    },
    {
      label: 'seed in JS tokens',
      source: 'JSON.stringify(useTokens()).includes(seed)',
      value: seedLeaked ? 'LEAKED' : 'absent',
    },
    {
      label: 'colors.primary',
      source: 'useTokens().colors.primary',
      value: tokens.colors.primary,
    },
  ];

  return (
    <Stack spacing="md" fullWidth data-testid="identity-runtime-proof">
      <Stack spacing="none">
        <Heading level="h2">Runtime readings</Heading>
        <Text size="sm" color="muted">
          Read from hooks inside the mounted provider. None of these values is in
          the artifact&apos;s CSS, so they move only when the client runtime
          consumes the same compiled decisions the server mounted.
        </Text>
      </Stack>
      <ReadingTable rows={consumed} testId="identity-runtime-consumed" />

      <Stack spacing="xs" fullWidth>
        <Flex align="center" gap={8}>
          <Text size="xs" weight="semibold" color="muted">
            Negative control
          </Text>
          <Badge
            variant={seedLeaked ? 'error' : 'success'}
            size="sm"
            data-testid="identity-runtime-negative-control"
          >
            {seedLeaked ? 'seed leaked into JS' : 'paint stayed in CSS'}
          </Badge>
        </Flex>
        <ReadingTable rows={control} testId="identity-runtime-control" />
      </Stack>
    </Stack>
  );
}
