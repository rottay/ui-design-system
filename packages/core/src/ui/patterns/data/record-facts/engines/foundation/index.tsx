"use client";

import { densityScopeAttributes } from "@/infrastructure/runtime/foundation/density";
import React from "react";
import type { CSSProperties } from "react";
import type { RecordFactsProps } from "../../contracts";

export function RecordFactsEngine({
  ariaLabel,
  title,
  headingLevel = 3,
  description,
  icon,
  action,
  facts,
  density = "comfortable",
  loading = false,
  className,
  style,
}: RecordFactsProps): React.ReactElement {
  const generatedTitleId = React.useId();
  const titleId = `${generatedTitleId}-title`;
  const Heading: "h2" | "h3" | "h4" = `h${headingLevel}`;

  return (
    <section
      className={["ds-pattern-record-facts", className]
        .filter(Boolean)
        .join(" ")}
      data-part="root"
      data-columns="12"
      {...densityScopeAttributes(density)}
      data-loading={loading ? "true" : "false"}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-busy={loading || undefined}
      style={style}
    >
      <header className="ds-record-facts__header" data-part="header">
        <div className="ds-record-facts__heading">
          {icon ? (
            <span className="ds-record-facts__section-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <div className="ds-record-facts__heading-copy">
            <Heading id={titleId} className="ds-record-facts__title">
              {title}
            </Heading>
            {description ? (
              <p className="ds-record-facts__description" data-part="description">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {!loading && action ? (
          <div className="ds-record-facts__action">{action}</div>
        ) : null}
      </header>

      <dl className="ds-record-facts__grid" data-part="grid">
        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <div
                className="ds-record-facts__skeleton"
                data-part="skeleton"
                aria-hidden="true"
                key={`skeleton-${index}`}
              >
                <dt className="ds-record-facts__skeleton-line" />
                <dd className="ds-record-facts__skeleton-line" />
              </div>
            ))
          : facts.map((fact) => (
              <div
                className="ds-record-facts__fact"
                key={fact.key}
                data-part="fact"
                data-fact-key={fact.key}
                data-span={fact.span ?? 3}
                data-emphasis={fact.emphasis ?? "default"}
                data-state={fact.state ?? "set"}
                data-kind={fact.kind}
                data-format={fact.format}
                style={
                  {
                    "--ds-record-fact-span":
                      fact.span === "full" ? 12 : fact.span ?? 3,
                  } as CSSProperties
                }
              >
                {fact.icon ? (
                  <span
                    className="ds-record-facts__fact-icon"
                    data-part="fact-icon"
                    aria-hidden="true"
                  >
                    {fact.icon}
                  </span>
                ) : null}
                <div className="ds-record-facts__fact-copy">
                  <dt className="ds-record-facts__label">{fact.label}</dt>
                  <dd className="ds-record-facts__value">{fact.value}</dd>
                  {fact.supporting ? (
                    <dd className="ds-record-facts__supporting">
                      {fact.supporting}
                    </dd>
                  ) : null}
                </div>
              </div>
            ))}
      </dl>
    </section>
  );
}
