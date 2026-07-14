'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import {
  OAuthTransitionScreen,
  type OAuthProvider,
  type OAuthTransitionPhase,
  type OAuthTransitionTone,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// OAuth Transition production-capture probe.
//
// This route renders the real DS surface without a provider or substitute
// shell: OAuthTransitionScreen uses its externalized full-page DS skin and
// still owns its runtime --rh-* palette because it runs outside the
// authenticated application shell.
//
//   ?tone=light|dark          selects the production light/dark direction
//   ?phase=redirect|return    selects the real copy and motion direction
//   ?compact=1                enables the public compact contract
//   ?provider=<oauth id>      optionally overrides the fixture provider
// ---------------------------------------------------------------------------

const PROVIDERS: readonly OAuthProvider[] = ['google', 'github', 'linkedin', 'azure-ad', 'microsoft'];

function readTone(value: string | null): OAuthTransitionTone {
  return value === 'light' ? 'light' : 'dark';
}

function readPhase(value: string | null): OAuthTransitionPhase {
  return value === 'return' ? 'return' : 'redirect';
}

function readProvider(value: string | null, tone: OAuthTransitionTone): OAuthProvider {
  if (value && (PROVIDERS as readonly string[]).includes(value)) {
    return value as OAuthProvider;
  }

  return tone === 'light' ? 'google' : 'github';
}

function OAuthTransitionProbeContent() {
  const searchParams = useSearchParams();
  const tone = useMemo(() => readTone(searchParams.get('tone')), [searchParams]);
  const phase = useMemo(() => readPhase(searchParams.get('phase')), [searchParams]);
  const compact = searchParams.get('compact') === '1';
  const provider = useMemo(() => readProvider(searchParams.get('provider'), tone), [searchParams, tone]);

  const fixture = tone === 'light'
    ? {
        appId: 'bithire' as const,
        variantId: 'quiet-beam-light' as const,
        ground: '#ece6dc',
      }
    : {
        appId: 'platform' as const,
        variantId: 'watchtower-sweep-dark' as const,
        ground: '#040404',
      };

  return (
    <main
      data-testid="probe-oauth-transition"
      data-fixture-tone={tone}
      data-fixture-phase={phase}
      data-fixture-compact={compact ? 'true' : 'false'}
      data-fixture-provider={provider}
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: compact ? 12 : 0,
        background: fixture.ground,
      }}
    >
      <OAuthTransitionScreen
        appId={fixture.appId}
        provider={provider}
        variantId={fixture.variantId}
        phase={phase}
        activeStep={phase === 'return' ? 2 : 1}
        compact={compact}
        transitionState="idle"
      />
    </main>
  );
}

export default function OAuthTransitionProbePage() {
  return (
    <Suspense fallback={<main data-testid="probe-oauth-transition-loading" />}>
      <OAuthTransitionProbeContent />
    </Suspense>
  );
}
