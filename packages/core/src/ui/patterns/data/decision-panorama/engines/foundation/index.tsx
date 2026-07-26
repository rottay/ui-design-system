'use client';

import React from 'react';
import type { DecisionPanoramaProps } from '../../contracts';

export function DecisionPanoramaEngine({
  ariaLabel,
  contextLabel,
  contextFacts = [],
  identityVisual,
  identityEyebrow,
  title,
  subtitle,
  badges,
  decisionLabel,
  decisionTitle,
  decisionScore,
  decisionSummary,
  decisionProgress,
  decisionMeta,
  actions,
  loading = false,
  className,
  style,
}: DecisionPanoramaProps): React.ReactElement {
  return (
    <section
      className={['ds-pattern-decision-panorama', className].filter(Boolean).join(' ')}
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      aria-label={ariaLabel}
      style={style}
    >
      <div className="ds-decision-panorama__grid" data-part="grid">
        <aside className="ds-decision-panorama__context" data-part="context">
          {contextLabel ? (
            <div className="ds-decision-panorama__eyebrow">{contextLabel}</div>
          ) : null}
          <dl className="ds-decision-panorama__facts">
            {contextFacts.map((fact) => (
              <div className="ds-decision-panorama__fact" key={fact.key} data-part="fact">
                {fact.icon ? (
                  <div className="ds-decision-panorama__fact-icon" aria-hidden="true">
                    {fact.icon}
                  </div>
                ) : null}
                <div className="ds-decision-panorama__fact-copy">
                  <dt>{fact.label}</dt>
                  <dd>
                    <strong>{fact.value}</strong>
                    {fact.supporting ? <small>{fact.supporting}</small> : null}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </aside>

        <header className="ds-decision-panorama__identity" data-part="identity">
          {identityEyebrow ? (
            <div className="ds-decision-panorama__identity-eyebrow">{identityEyebrow}</div>
          ) : null}
          {identityVisual ? (
            <div className="ds-decision-panorama__visual" data-part="identity-visual">
              <span className="ds-decision-panorama__visual-aura" aria-hidden="true" />
              {identityVisual}
            </div>
          ) : null}
          <div className="ds-decision-panorama__identity-copy">
            <div className="ds-decision-panorama__title">{title}</div>
            {subtitle ? <div className="ds-decision-panorama__subtitle">{subtitle}</div> : null}
          </div>
          {badges ? <div className="ds-decision-panorama__badges">{badges}</div> : null}
        </header>

        <aside className="ds-decision-panorama__decision" data-part="decision">
          {decisionLabel ? (
            <div className="ds-decision-panorama__eyebrow">{decisionLabel}</div>
          ) : null}
          <div className="ds-decision-panorama__decision-heading">
            {decisionTitle ? (
              <div className="ds-decision-panorama__decision-title">{decisionTitle}</div>
            ) : null}
            {decisionScore !== undefined ? (
              <div className="ds-decision-panorama__score">{decisionScore}</div>
            ) : null}
          </div>
          {decisionSummary ? (
            <div className="ds-decision-panorama__decision-summary">{decisionSummary}</div>
          ) : null}
          {decisionProgress ? (
            <div className="ds-decision-panorama__progress">{decisionProgress}</div>
          ) : null}
          {decisionMeta ? (
            <div className="ds-decision-panorama__decision-meta">{decisionMeta}</div>
          ) : null}
        </aside>
      </div>

      {actions ? (
        <footer className="ds-decision-panorama__actions" data-part="actions">
          {actions}
        </footer>
      ) : null}
    </section>
  );
}
