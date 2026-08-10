import type { SectionFrameProps } from '../../../foundation/contracts/framing/section-frame';
import { VisuallyHidden } from '../../../../../primitives/foundation/VisuallyHidden';

import "./SectionFrame.css";

function formatIndexText(index: number | string | undefined): string | null {
  if (index == null) return null;
  if (typeof index === "number") return String(index).padStart(2, "0");
  return String(index);
}

function formatIndex(index: number | string | undefined): string | null {
  const text = formatIndexText(index);
  return text === null ? null : `[${text}]`;
}

/**
 * A numbered, framed commercial section (spec section 5).
 *
 * Renders `[01] — TITLE` as a mono label on a top hairline rule so the section is explicitly
 * segmented and never floats. The title is a real heading (level set by `headingLevel`) so
 * the document outline stays correct; the bracket and rule are presentational chrome.
 */

/* With a title the ordinal joins the heading's own name; without one it stands alone as the only
   accessible carrier. It carries just the index unless the consumer passes `indexLabel`. */
export function SectionFrame({
  children,
  index,
  indexLabel,
  title,
  meta,
  as: As = "section",
  className,
  headingLevel = "h2",
}: SectionFrameProps): React.JSX.Element {
  const Heading = headingLevel;
  const marker = formatIndex(index);
  const classes = ["rt-section-frame", className].filter(Boolean).join(" ");
  const ordinal = marker != null ? (indexLabel ?? formatIndexText(index)) : null;

  // data-part hooks match the kit-wide anatomy contract (product-window, tree-view, ...).
  return (
    <As className={classes} data-part="root">
      <div className="rt-section-frame__label" data-part="label-row">
        {marker != null && (
          <span className="rt-section-frame__index" data-part="index" aria-hidden="true">
            {marker}
          </span>
        )}
        {/* Without a title the ordinal is the only accessible carrier, so it stands alone here. */}
        {marker != null && title == null && (
          <VisuallyHidden data-part="index-label">{ordinal}</VisuallyHidden>
        )}
        {title != null && (
          <>
            <span className="rt-section-frame__dash" data-part="dash" aria-hidden="true">
              —
            </span>
            {/* Inside the heading the ordinal joins its natural name, so no loose ordinal node
                exists to announce twice and no id wiring is needed. */}
            <Heading className="rt-section-frame__title" data-part="title">
              {marker != null && (
                <VisuallyHidden data-part="index-label">{ordinal} </VisuallyHidden>
              )}
              {title}
            </Heading>
          </>
        )}
        {meta != null && (
          <span className="rt-section-frame__meta" data-part="meta">
            {meta}
          </span>
        )}
      </div>
      <div className="rt-section-frame__body" data-part="body">
        {children}
      </div>
    </As>
  );
}

export type { SectionFrameProps } from '../../../foundation/contracts/framing/section-frame';
