import type { SectionFrameProps } from "./SectionFrame.types";

import "./SectionFrame.css";

function formatIndex(index: number | string | undefined): string | null {
  if (index == null) return null;
  if (typeof index === "number") return `[${String(index).padStart(2, "0")}]`;
  return `[${index}]`;
}

/**
 * A numbered, framed commercial section (spec section 5).
 *
 * Renders `[01] — TITLE` as a mono label on a top hairline rule so the section is explicitly
 * segmented and never floats. The title is a real heading (level set by `headingLevel`) so
 * the document outline stays correct; the bracket and rule are presentational chrome.
 */
export function SectionFrame({
  children,
  index,
  title,
  meta,
  as: As = "section",
  className,
  headingLevel = "h2",
}: SectionFrameProps): React.JSX.Element {
  const Heading = headingLevel;
  const marker = formatIndex(index);
  const classes = ["rt-section-frame", className].filter(Boolean).join(" ");

  return (
    <As className={classes}>
      <div className="rt-section-frame__label">
        {marker != null && (
          <span className="rt-section-frame__index" aria-hidden="true">
            {marker}
          </span>
        )}
        {title != null && (
          <>
            <span className="rt-section-frame__dash" aria-hidden="true">
              —
            </span>
            <Heading className="rt-section-frame__title">{title}</Heading>
          </>
        )}
        {meta != null && <span className="rt-section-frame__meta">{meta}</span>}
      </div>
      <div className="rt-section-frame__body">{children}</div>
    </As>
  );
}

export type { SectionFrameProps } from "./SectionFrame.types";
