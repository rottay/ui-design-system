"use client";

import React from "react";
import type { FeatureWorkspaceFrameProps } from "../contracts";

/**
 * Shared, token-driven feature workspace anatomy used by every rendering
 * engine. It deliberately adds no page heading and no decorative side rail.
 */
export function FeatureWorkspaceFrameEngine({
  children,
  navigation,
  ariaLabel,
  width = "fluid",
  stickyNavigation = false,
  loading = false,
  className,
  style,
}: FeatureWorkspaceFrameProps): React.ReactElement {
  return (
    <section
      className={["ds-pattern-feature-workspace-frame", className]
        .filter(Boolean)
        .join(" ")}
      data-part="root"
      data-width={width}
      data-has-navigation={navigation ? "true" : "false"}
      data-loading={loading ? "true" : "false"}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      style={style}
    >
      <div className="ds-feature-workspace-frame__frame" data-part="frame">
        {navigation ? (
          <div
            className="ds-feature-workspace-frame__navigation"
            data-part="navigation"
            data-sticky={stickyNavigation ? "true" : "false"}
          >
            <div
              className="ds-feature-workspace-frame__navigation-viewport"
              data-part="navigation-viewport"
            >
              {navigation}
            </div>
          </div>
        ) : null}

        <div
          className="ds-feature-workspace-frame__content"
          data-part="content"
        >
          {loading ? (
            <div
              className="ds-feature-workspace-frame__skeleton"
              data-part="loading-skeleton"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </section>
  );
}
