/**
 * @fileoverview OAuthTransitionScreen -- premium animated OAuth redirect/return
 * transition surface used across all Rottay verticals.
 *
 * This is a self-contained, full-page surface that renders a branded transition
 * animation during OAuth redirects and returns. Its byte-exact skin is loaded
 * through the shared CSS entrypoints while its palette stays on the root as
 * --rh-* variables, intentionally decoupled from the DS token system since it
 * renders outside the normal app shell during auth flows.
 */

import type { CSSProperties, JSX } from 'react';
import type { OAuthProvider } from '../../foundation/contracts';
import {
  getOAuthTransitionApp,
  getOAuthTransitionProvider,
  getOAuthTransitionVariant,
} from '../../runtime/config';
import { renderOAuthProviderIcon } from './provider-icons';
import type {
  OAuthTransitionPhase,
  OAuthTransitionScreenProps,
  OAuthTransitionVariantDefinition,
} from '../../foundation/contracts';

function getSurfaceCopy(
  variant: OAuthTransitionVariantDefinition,
  destinationName: string,
  providerName: string,
  phase: OAuthTransitionPhase,
) {
  if (phase === 'return') {
    if (variant.family === 'watchtower-sweep') {
      return {
        kicker: 'Protected return by Rottay',
        title: `Back to ${destinationName}.`,
        subtitle: `${providerName} is confirmed. Rottay is reopening ${destinationName} and bringing the workspace back into focus.`,
        steps: [`${providerName} confirmed`, 'Session restoring', `${destinationName} opening`],
        footer: `${destinationName} is back in focus while Rottay finishes the protected return.`,
      };
    }

    if (variant.family === 'quiet-beam') {
      return {
        kicker: 'Protected return by Rottay',
        title: `Returning you to ${destinationName}.`,
        subtitle: `The return is confirmed. Rottay is reopening ${destinationName} with a calmer, guided return.`,
        steps: [`${providerName} confirmed`, 'Session restoring', `${destinationName} opening`],
        footer: `${destinationName} stays visible while the session settles in.`,
      };
    }

    if (variant.family === 'signal-line') {
      return {
        kicker: 'Protected return by Rottay',
        title: `A direct return into ${destinationName}.`,
        subtitle: `The route back is confirmed. Rottay is restoring access and bringing the workspace back into view.`,
        steps: [`${providerName} confirmed`, 'Session restoring', `${destinationName} opening`],
        footer: `${destinationName} is next, with no visual detour away from the destination.`,
      };
    }

    return {
      kicker: 'Protected return by Rottay',
      title: `Reopening ${destinationName}.`,
      subtitle: `Rottay is finishing the secure return so ${destinationName} can reopen with the same premium rhythm.`,
      steps: [`${providerName} confirmed`, 'Session restoring', `${destinationName} opening`],
      footer: `${destinationName} remains the destination while Rottay completes the guarded return.`,
    };
  }

  if (variant.family === 'watchtower-sweep') {
    return {
      kicker: 'Protected redirect by Rottay',
      title: `Redirecting to ${providerName} for ${destinationName}.`,
      subtitle: `Rottay keeps ${destinationName} in place, opens ${providerName}, and lines up the protected return.`,
      steps: [`${providerName} opening`, 'Redirect in motion', 'Return ready'],
      footer: `${destinationName} stays anchored while the protected redirect begins.`,
    };
  }

  if (variant.family === 'quiet-beam') {
    return {
      kicker: 'Protected redirect by Rottay',
      title: `Redirecting to ${providerName} for ${destinationName}.`,
      subtitle: `A calmer redirect carries sign-in forward while Rottay keeps ${destinationName} ready for the return.`,
      steps: [`${providerName} ready`, 'Redirect in motion', 'Return ready'],
      footer: `The provider window opens without losing the feeling of ${destinationName}.`,
    };
  }

  if (variant.family === 'signal-line') {
    return {
      kicker: 'Protected redirect by Rottay',
      title: `A protected redirect to ${providerName}.`,
      subtitle: `${destinationName} stays in frame while Rottay opens the direct sign-in route and prepares the return.`,
      steps: [`${providerName} ready`, 'Redirect live', 'Return ready'],
      footer: `${destinationName} stays recognizable even while the protected redirect opens.`,
    };
  }

  return {
    kicker: 'Protected redirect by Rottay',
    title: `Preparing ${providerName} for ${destinationName}.`,
    subtitle: `Rottay opens ${providerName} with the protected return already aligned for a clean comeback into ${destinationName}.`,
    steps: [`${providerName} opening`, 'Redirect aligned', 'Return ready'],
    footer: `${destinationName} stays protected while the redirect takes over.`,
  };
}

function getDefaultStatusLabel(phase: OAuthTransitionPhase, destinationName: string, providerName: string): string {
  if (phase === 'return') {
    return `Opening ${destinationName}`;
  }

  return `Redirecting to ${providerName}`;
}

function getPhaseFlow(phase: OAuthTransitionPhase, destinationName: string, providerName: string) {
  if (phase === 'return') {
    return {
      start: providerName,
      tag: 'Protected return',
      end: destinationName,
    };
  }

  return {
    start: destinationName,
    tag: 'Protected redirect',
    end: providerName,
  };
}

function getPhaseMomentCopy(phase: OAuthTransitionPhase, destinationName: string, providerName: string) {
  if (phase === 'return') {
    return {
      kicker: 'Protected return',
      title: `${destinationName} reopens next`,
      detail: `${providerName} has confirmed the way back`,
    };
  }

  return {
    kicker: 'Protected redirect',
    title: `${providerName} opens next`,
    detail: `${destinationName} stays ready with Rottay`,
  };
}

function getProgressStepMeta(index: number, phase: OAuthTransitionPhase) {
  if (phase === 'return') {
    if (index === 0) {
      return { kicker: 'Provider', glyph: 'provider' as const };
    }

    if (index === 1) {
      return { kicker: 'Session', glyph: 'route' as const };
    }

    return { kicker: 'Workspace', glyph: 'destination' as const };
  }

  if (index === 0) {
    return { kicker: 'Provider', glyph: 'provider' as const };
  }

  if (index === 1) {
    return { kicker: 'Redirect', glyph: 'route' as const };
  }

  return { kicker: 'Return', glyph: 'destination' as const };
}

function renderProgressGlyph(
  glyph: 'provider' | 'route' | 'destination',
  provider: OAuthProvider,
  appMark: string,
): JSX.Element {
  if (glyph === 'provider') {
    return <span className="rottay-progress-glyph rottay-progress-glyph--provider">{renderOAuthProviderIcon(provider)}</span>;
  }

  if (glyph === 'destination') {
    return <span className="rottay-progress-glyph rottay-progress-glyph--destination">{appMark}</span>;
  }

  return (
    <span className="rottay-progress-glyph rottay-progress-glyph--route" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function renderFamilyMotif(
  variant: OAuthTransitionVariantDefinition,
  provider: OAuthProvider,
  providerName: string,
  appMark: string,
  appName: string,
  phase: OAuthTransitionPhase,
): JSX.Element {
  const isReturn = phase === 'return';

  if (variant.family === 'watchtower-sweep') {
    return (
      <div className="rottay-transition-scene rottay-transition-scene--watchtower" aria-hidden="true">
        <div className="rottay-transition-watch-shell">
          <div className="rottay-transition-watch-radar">
            <div className="rottay-transition-watch-ring" />
            <div className="rottay-transition-watch-ring" />
            <div className="rottay-transition-watch-ring" />
            <div className="rottay-transition-watch-sweep" />
            <div className="rottay-transition-watch-core">{isReturn ? appMark : renderOAuthProviderIcon(provider)}</div>
            <div className="rottay-transition-watch-provider">{isReturn ? appName : providerName}</div>
          </div>

          <div className="rottay-transition-watch-target">
            <div className="rottay-transition-watch-target-mark">{isReturn ? renderOAuthProviderIcon(provider) : appMark}</div>
            <div className="rottay-transition-watch-target-copy">
              <strong>{isReturn ? providerName : appName}</strong>
              <span>{isReturn ? 'Return confirmed' : 'Return ready'}</span>
            </div>
          </div>

          <div className="rottay-transition-watch-bars">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  if (variant.family === 'quiet-beam') {
    return (
      <div className="rottay-transition-scene rottay-transition-scene--quiet" aria-hidden="true">
        <div className="rottay-transition-quiet-shell">
          <div className={`rottay-transition-quiet-node ${isReturn ? 'is-provider' : 'is-app'} is-origin`}>
            {isReturn ? (
              <span className="rottay-transition-quiet-node-icon">{renderOAuthProviderIcon(provider)}</span>
            ) : (
              <span className="rottay-transition-quiet-node-mark">{appMark}</span>
            )}
            <span className="rottay-transition-quiet-node-label">{isReturn ? providerName : appName}</span>
          </div>

          <div className="rottay-transition-quiet-lane">
            <span />
            <span />
            <span />
            <div className="rottay-transition-quiet-beam" />
          </div>

          <div className="rottay-transition-quiet-bars">
            <span />
            <span />
            <span />
          </div>

          <div className={`rottay-transition-quiet-node ${isReturn ? 'is-app' : 'is-provider'} is-destination`}>
            {isReturn ? (
              <span className="rottay-transition-quiet-node-mark">{appMark}</span>
            ) : (
              <span className="rottay-transition-quiet-node-icon">{renderOAuthProviderIcon(provider)}</span>
            )}
            <span className="rottay-transition-quiet-node-label">{isReturn ? appName : providerName}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant.family === 'signal-line') {
    return (
      <div className="rottay-transition-scene rottay-transition-scene--signal" aria-hidden="true">
        <div className="rottay-transition-signal-shell">
          <div className={`rottay-transition-signal-node ${isReturn ? 'is-provider' : 'is-app'}`}>
            {isReturn ? (
              <span className="rottay-transition-signal-node-icon">{renderOAuthProviderIcon(provider)}</span>
            ) : (
              <span className="rottay-transition-signal-node-mark">{appMark}</span>
            )}
            <span className="rottay-transition-signal-node-label">{isReturn ? providerName : appName}</span>
          </div>

          <div className="rottay-transition-signal-rail">
            <div className="rottay-transition-signal-track" />
            <div className="rottay-transition-signal-track is-offset" />
            <div className="rottay-transition-signal-bracket is-left" />
            <div className="rottay-transition-signal-bracket is-right" />
            <div className="rottay-transition-signal-pulse" />
            <div className="rottay-transition-signal-pulse is-delayed" />
            <div className="rottay-transition-signal-caption">{isReturn ? 'Protected return' : 'Protected redirect'}</div>
          </div>

          <div className={`rottay-transition-signal-node ${isReturn ? 'is-app' : 'is-provider'}`}>
            {isReturn ? (
              <span className="rottay-transition-signal-node-mark">{appMark}</span>
            ) : (
              <span className="rottay-transition-signal-node-icon">{renderOAuthProviderIcon(provider)}</span>
            )}
            <span className="rottay-transition-signal-node-label">{isReturn ? appName : providerName}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rottay-transition-scene rottay-transition-scene--stack" aria-hidden="true">
      <div className="rottay-transition-stack-shell">
        <div className="rottay-transition-stack-frame" />
        <div className="rottay-transition-stack-frame" />
        <div className="rottay-transition-stack-frame" />
        <div className="rottay-transition-stack-scan" />
        <div className="rottay-transition-stack-thread" />
        <div className="rottay-transition-stack-pulse" />

        <div className={`rottay-transition-stack-node ${isReturn ? 'is-provider' : 'is-app'}`}>
          {isReturn ? (
            <span className="rottay-transition-stack-node-icon">{renderOAuthProviderIcon(provider)}</span>
          ) : (
            <span className="rottay-transition-stack-node-mark">{appMark}</span>
          )}
          <span className="rottay-transition-stack-node-label">{isReturn ? providerName : appName}</span>
        </div>

        <div className={`rottay-transition-stack-node ${isReturn ? 'is-app' : 'is-provider'}`}>
          {isReturn ? (
            <span className="rottay-transition-stack-node-mark">{appMark}</span>
          ) : (
            <span className="rottay-transition-stack-node-icon">{renderOAuthProviderIcon(provider)}</span>
          )}
          <span className="rottay-transition-stack-node-label">{isReturn ? appName : providerName}</span>
        </div>

        <div className="rottay-transition-stack-orbit is-a" />
        <div className="rottay-transition-stack-orbit is-b" />
      </div>
    </div>
  );
}

function renderStatusSteps(
  variant: OAuthTransitionVariantDefinition,
  steps: string[],
  activeStep: number | undefined,
  provider: OAuthProvider,
  appMark: string,
  phase: OAuthTransitionPhase,
): JSX.Element {
  const resolvedActiveStep =
    typeof activeStep === 'number'
      ? Math.max(0, Math.min(activeStep, Math.max(steps.length - 1, 0)))
      : undefined;

  const renderState = (index: number) =>
    resolvedActiveStep === undefined
      ? 'idle'
      : index < resolvedActiveStep
        ? 'complete'
        : index === resolvedActiveStep
          ? 'active'
          : 'pending';

  if (variant.family === 'signal-line') {
    return (
      <div className="rottay-progress rottay-progress--signal" aria-hidden="true">
        {steps.map((step, index) => {
          const meta = getProgressStepMeta(index, phase);
          return (
            <div className="rottay-progress-signal-step" data-step-state={renderState(index)} key={step}>
              <div className="rottay-progress-signal-rail">
                {renderProgressGlyph(meta.glyph, provider, appMark)}
                {index < steps.length - 1 ? <span className="rottay-progress-signal-stem" /> : null}
              </div>
              <div className="rottay-progress-signal-copy">
                <span>{meta.kicker}</span>
                <strong>{step}</strong>
                <em />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant.family === 'watchtower-sweep') {
    return (
      <div className="rottay-progress rottay-progress--watchtower" aria-hidden="true">
        {steps.map((step, index) => {
          const meta = getProgressStepMeta(index, phase);
          return (
            <div className="rottay-progress-watch-step" data-step-state={renderState(index)} key={step}>
              <div className="rottay-progress-watch-badge">{renderProgressGlyph(meta.glyph, provider, appMark)}</div>
              <div className="rottay-progress-watch-copy">
                <span>{meta.kicker}</span>
                <strong>{step}</strong>
              </div>
              <div className="rottay-progress-watch-scan">
                <i />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (variant.family === 'halo-orbit') {
    return (
      <div className="rottay-progress rottay-progress--halo" aria-hidden="true">
        {steps.map((step, index) => {
          const meta = getProgressStepMeta(index, phase);
          return (
            <div className="rottay-progress-halo-step" data-step-state={renderState(index)} key={step}>
              <div className="rottay-progress-halo-orbit">
                <div className="rottay-progress-halo-ring" />
                <div className="rottay-progress-halo-core">{renderProgressGlyph(meta.glyph, provider, appMark)}</div>
              </div>
              <div className="rottay-progress-halo-copy">
                <span>{meta.kicker}</span>
                <strong>{step}</strong>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="rottay-progress rottay-progress--quiet" aria-hidden="true">
      {steps.map((step, index) => {
        const meta = getProgressStepMeta(index, phase);
        return (
          <div
            className="rottay-progress-quiet-step"
            data-step-state={renderState(index)}
            key={step}
            style={{ '--step-delay': `${index * 220}ms` } as CSSProperties}
          >
            <div className="rottay-progress-quiet-glyph">{renderProgressGlyph(meta.glyph, provider, appMark)}</div>
            <div className="rottay-progress-quiet-copy">
              <span>{meta.kicker}</span>
              <strong>{step}</strong>
            </div>
            <div className="rottay-progress-quiet-trace" />
          </div>
        );
      })}
    </div>
  );
}

export function OAuthTransitionScreen({
  appId,
  provider,
  variantId,
  appName,
  appLabel,
  phase = 'redirect',
  statusLabel,
  stepLabels,
  activeStep,
  transitionState = 'idle',
  compact = false,
  showPoweredBy = true,
  rottayUrl = 'https://rottay.com',
}: OAuthTransitionScreenProps): JSX.Element {
  const app = getOAuthTransitionApp(appId);
  const variant = getOAuthTransitionVariant(variantId);
  const providerMeta = getOAuthTransitionProvider(provider);
  const destinationName = appName || app.name;
  const destinationLabel = appLabel || app.label;
  const copy = getSurfaceCopy(variant, destinationName, providerMeta.name, phase);
  const resolvedStepLabels = stepLabels && stepLabels.length > 0 ? stepLabels : copy.steps;
  const resolvedStatusLabel = statusLabel || getDefaultStatusLabel(phase, destinationName, providerMeta.name);
  const phaseFlow = getPhaseFlow(phase, destinationName, providerMeta.name);
  const phaseMoment = getPhaseMomentCopy(phase, destinationName, providerMeta.name);
  const providerBadge = phase === 'return' ? 'Return confirmed' : 'Redirect in progress';

  const vars = {
    '--rh-bg': variant.palette.bg,
    '--rh-bg-alt': variant.palette.bgAlt,
    '--rh-panel': variant.palette.panel,
    '--rh-panel-soft': variant.palette.panelSoft,
    '--rh-ink': variant.palette.ink,
    '--rh-muted': variant.palette.muted,
    '--rh-line': variant.palette.line,
    '--rh-line-strong': variant.palette.lineStrong,
    '--rh-glow': variant.palette.glow,
    '--rh-glow-soft': variant.palette.glowSoft,
    '--rh-accent': variant.palette.accent,
    '--rh-accent-soft': variant.palette.accentSoft,
    '--rh-shadow': variant.palette.shadow,
  } as CSSProperties;

  return (
    <div
      className="rottay-transition-root"
      data-compact={compact}
      data-variant={variant.id}
      data-family={variant.family}
      data-phase={phase}
      data-tone={variant.tone}
      data-transition={transitionState}
      style={vars}
    >
      <div className="rottay-transition-background" />
      <div className="rottay-transition-grid" />
      <div className="rottay-transition-noise" />
      <div className="rottay-transition-sweep" />
      <div className="rottay-transition-watermark">Rottay</div>
      <div className="rottay-transition-frame">
        <div className="rottay-transition-card">
          <div className="rottay-transition-top">
            <div className="rottay-transition-brand">
              <span className="rottay-transition-mark">{app.mark}</span>
              <span className="rottay-transition-brand-copy">
                <strong>{destinationName}</strong>
                <span>{destinationLabel}</span>
              </span>
            </div>

            <div className="rottay-transition-provider">
              <span className="rottay-transition-provider-icon">{renderOAuthProviderIcon(provider)}</span>
              <span className="rottay-transition-provider-copy">
                <strong>{providerMeta.name}</strong>
                <span>{providerBadge}</span>
              </span>
            </div>
          </div>

          <div className="rottay-transition-stage-shell">
            <div className="rottay-transition-copy-column">
              <span className="rottay-transition-kicker">{copy.kicker}</span>
              <h1 className="rottay-transition-title">{copy.title}</h1>
              <p className="rottay-transition-subtitle">{copy.subtitle}</p>
              <div className="rottay-transition-phase-moment">
                <div className="rottay-transition-phase-moment-badge">
                  <span className="rottay-transition-phase-moment-icon">
                    {phase === 'return' ? app.mark : renderOAuthProviderIcon(provider)}
                  </span>
                  <span className="rottay-transition-phase-moment-copy">
                    <em>{phaseMoment.kicker}</em>
                    <strong>{phaseMoment.title}</strong>
                    <span>{phaseMoment.detail}</span>
                  </span>
                </div>
                <div className="rottay-transition-phase-moment-trace" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="rottay-transition-flow" aria-hidden="true">
                <span className="rottay-transition-flow-node is-start">{phaseFlow.start}</span>
                <span className="rottay-transition-flow-rail">
                  <i />
                </span>
                <span className="rottay-transition-flow-tag">{phaseFlow.tag}</span>
                <span className="rottay-transition-flow-rail">
                  <i />
                </span>
                <span className="rottay-transition-flow-node is-end">{phaseFlow.end}</span>
              </div>
              {renderStatusSteps(variant, resolvedStepLabels, activeStep, provider, app.mark, phase)}
              <div className="rottay-transition-status">
                <span className="rottay-transition-status-dot" />
                <span className="rottay-transition-status-copy">{resolvedStatusLabel}</span>
              </div>
            </div>

            <div className="rottay-transition-scene-column">
              {renderFamilyMotif(variant, provider, providerMeta.name, app.mark, destinationName, phase)}
            </div>
          </div>

          <div className="rottay-transition-footer">
            <div className="rottay-transition-signature">
              <span className="rottay-transition-signature-dot" />
              <span className="rottay-transition-signature-copy">
                <strong>Security by Rottay</strong>
                <span>{copy.footer}</span>
              </span>
            </div>

            {showPoweredBy ? (
              <a className="rottay-transition-link rottay-transition-powered" href={rottayUrl} rel="noreferrer" target="_blank">
                <span>Built on Rottay</span>
                <strong>rottay.com</strong>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  getOAuthTransitionApp,
  getOAuthTransitionDefaultVariant,
  getOAuthTransitionPool,
  getOAuthTransitionProvider,
  getOAuthTransitionVariant,
  isOAuthTransitionVariantId,
  isOAuthProvider,
  OAUTH_TRANSITION_VARIANT_ORDER,
  pickOAuthTransitionVariant,
} from '../../runtime/config';

export type {
  OAuthProvider,
  OAuthTransitionAppDefinition,
  OAuthTransitionAppId,
  OAuthTransitionFamily,
  OAuthTransitionPhase,
  OAuthTransitionPalette,
  OAuthTransitionProviderDefinition,
  OAuthTransitionScreenProps,
  OAuthTransitionState,
  OAuthTransitionTone,
  OAuthTransitionVariantDefinition,
  OAuthTransitionVariantId,
} from '../../foundation/contracts';
