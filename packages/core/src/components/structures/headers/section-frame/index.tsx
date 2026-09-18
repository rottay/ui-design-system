import type { SectionFrameProps } from './contracts';
import { VisuallyHidden } from '../../../primitives/foundation/visually-hidden';

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
 * A numbered, framed monochrome section (spec section 5).
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

  // The skin keys on these `data-part` hooks; the `rt-section-frame` class is the
  // monochrome kit's scope, and the per-element BEM names it no longer selects are gone.
  return (
    <As className={classes} data-part="root">
      <div data-part="label-row">
        {marker != null && (
          <span data-part="index" aria-hidden="true">
            {marker}
          </span>
        )}
        {/* Without a title the ordinal is the only accessible carrier, so it stands alone here. */}
        {marker != null && title == null && (
          <VisuallyHidden data-part="index-label">{ordinal}</VisuallyHidden>
        )}
        {title != null && (
          <>
            <span data-part="dash" aria-hidden="true">
              —
            </span>
            {/* Inside the heading the ordinal joins its natural name, so no loose ordinal node
                exists to announce twice and no id wiring is needed. */}
            <Heading data-part="title">
              {marker != null && (
                <VisuallyHidden data-part="index-label">{ordinal} </VisuallyHidden>
              )}
              {title}
            </Heading>
          </>
        )}
        {meta != null && (
          <span data-part="meta">
            {meta}
          </span>
        )}
      </div>
      <div data-part="body">
        {children}
      </div>
    </As>
  );
}

export type { SectionFrameProps } from './contracts';
