'use client';

import { densityScopeAttributes } from '@/infrastructure/runtime/foundation/density';
import React, { useId } from 'react';
import type {
  DecisionComparisonProps,
  DecisionComparisonSubject,
} from '../contracts';

function SubjectColumn({
  subject,
  index,
}: {
  subject: DecisionComparisonSubject;
  index: number;
}): React.ReactElement {
  const titleId = useId();

  return (
    <article
      className="ds-decision-comparison__subject"
      data-part="subject"
      data-leading={subject.leading ? 'true' : 'false'}
      aria-labelledby={titleId}
      style={
        {
          '--ds-decision-comparison-subject-index': index,
        } as React.CSSProperties
      }
    >
      <header className="ds-decision-comparison__identity" data-part="identity">
        {subject.avatar ? (
          <div className="ds-decision-comparison__avatar" data-part="avatar">
            {subject.avatar}
          </div>
        ) : null}
        <div className="ds-decision-comparison__identity-copy">
          <div className="ds-decision-comparison__title-row">
            <div
              id={titleId}
              className="ds-decision-comparison__title"
              data-part="title"
            >
              {subject.title}
            </div>
            {subject.score !== undefined ? (
              <div className="ds-decision-comparison__score" data-part="score">
                {subject.score}
              </div>
            ) : null}
          </div>
          {subject.subtitle ? (
            <div className="ds-decision-comparison__subtitle" data-part="subtitle">
              {subject.subtitle}
            </div>
          ) : null}
          {subject.scoreLabel ? (
            <div className="ds-decision-comparison__score-label" data-part="score-label">
              {subject.scoreLabel}
            </div>
          ) : null}
        </div>
      </header>

      {subject.badges ? (
        <div className="ds-decision-comparison__badges" data-part="badges">
          {subject.badges}
        </div>
      ) : null}

      {subject.visualization ? (
        <div className="ds-decision-comparison__visual" data-part="visualization">
          {subject.visualization}
        </div>
      ) : null}

      <dl className="ds-decision-comparison__facts" data-part="facts">
        {subject.facts.map((fact, factIndex) => (
          <div
            key={fact.key}
            className="ds-decision-comparison__fact"
            data-part="fact"
            data-tone={fact.tone ?? 'neutral'}
            style={
              {
                '--ds-decision-comparison-fact-index': factIndex,
              } as React.CSSProperties
            }
          >
            <dt className="ds-decision-comparison__fact-label">{fact.label}</dt>
            <dd className="ds-decision-comparison__fact-value">
              <span>{fact.value}</span>
              {fact.supporting ? (
                <small className="ds-decision-comparison__fact-supporting">
                  {fact.supporting}
                </small>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>

      {subject.actions || subject.footnote ? (
        <footer className="ds-decision-comparison__subject-footer" data-part="subject-footer">
          {subject.actions ? (
            <div className="ds-decision-comparison__subject-actions" data-part="subject-actions">
              {subject.actions}
            </div>
          ) : null}
          {subject.footnote ? (
            <div className="ds-decision-comparison__footnote" data-part="footnote">
              {subject.footnote}
            </div>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}

export function DecisionComparisonEngine({
  context,
  contextMeta,
  toolbar,
  subjects,
  verdict,
  insight,
  emptyState,
  ariaLabel,
  density = 'compact',
  loading = false,
  className,
  style,
}: DecisionComparisonProps): React.ReactElement {
  const rootClassName = [
    'ds-pattern-decision-comparison',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      className={rootClassName}
      data-part="root"
      {...densityScopeAttributes(density)}
      data-loading={loading ? 'true' : 'false'}
      data-subject-count={subjects.length}
      data-has-toolbar={context || contextMeta || toolbar ? 'true' : 'false'}
      data-has-verdict={verdict ? 'true' : 'false'}
      data-has-insight={insight ? 'true' : 'false'}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      style={style}
    >
      {context || contextMeta || toolbar ? (
        <header className="ds-decision-comparison__toolbar" data-part="toolbar">
          <div className="ds-decision-comparison__context">
            {context ? (
              <div className="ds-decision-comparison__context-primary">{context}</div>
            ) : null}
            {contextMeta ? (
              <div className="ds-decision-comparison__context-meta">{contextMeta}</div>
            ) : null}
          </div>
          {toolbar ? (
            <div className="ds-decision-comparison__toolbar-actions">{toolbar}</div>
          ) : null}
        </header>
      ) : null}

      {verdict ? (
        <div className="ds-decision-comparison__verdict" data-part="verdict">
          {verdict}
        </div>
      ) : null}

      {subjects.length > 0 ? (
        <div
          className="ds-decision-comparison__viewport"
          data-part="viewport"
          style={
            {
              '--ds-decision-comparison-columns': Math.min(subjects.length, 4),
            } as React.CSSProperties
          }
        >
          <div className="ds-decision-comparison__grid" data-part="grid">
            {subjects.map((subject, index) => (
              <SubjectColumn key={subject.key} subject={subject} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="ds-decision-comparison__empty" data-part="empty-state">
          {emptyState}
        </div>
      )}

      {insight ? (
        <aside className="ds-decision-comparison__insight" data-part="insight">
          {insight}
        </aside>
      ) : null}
    </section>
  );
}
