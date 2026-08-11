/**
 * @fileoverview Skin-reachability harness — does an authored selector match a
 * node the family actually renders?
 *
 * A CSS rule only paints if something can satisfy its selector. Two defect
 * shapes hide from review and from a static census alike:
 *   - a rule predicated on a `data-part` the component does not stamp (a bare
 *     descendant `[data-part='root']` needs a SECOND root-parted element
 *     nested inside the family; Box stamps none and Flex forwards only what
 *     the caller passes);
 *   - a rule whose predicate the caller's own props defeat — passing
 *     `data-part='search-input'` to a primitive REPLACES its default `root`,
 *     so `:has(> …[data-part='root'])` can never hold.
 * Neither is visible in the file. Both are obvious the moment you ask the
 * rendered DOM.
 *
 * ── THE PORTAL LAW (this harness exists because of it) ───────────────────
 * A portalled family mounts its governed SURFACE one tick before the family's
 * CONTENT renders inside it. A fixture that waits for the surface and then
 * samples sees a correctly-classed, entirely EMPTY panel, and every content
 * rule reads as dead. Measured on `column-menu`: 44 unmatched with a
 * surface-level gate, 5 with a content-level gate and full props — same skin,
 * same commit. The 5 are real interaction states; the 44 were fiction.
 *
 * `waitForPortalContent` is therefore the only sanctioned readiness gate for
 * a portalled family, and `unreachableSelectors` takes its scopes explicitly
 * so a portalled panel is never sampled through the render container it does
 * not live in.
 *
 * A false "dead rule" reading is worse than none: it invites deleting paint
 * that was working. Prefer exempting a selector with a stated reason over
 * widening a fixture until it accidentally matches.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import postcss, { type AtRule, type Rule } from 'postcss';

export interface SkinRule {
  /** One selector from the rule's selector list, whitespace-normalised. */
  selector: string;
  /** Enclosing at-rules, joined; empty for an unconditional rule. */
  conditions: string;
  /** Declarations, last-wins within the rule. */
  decls: Record<string, string>;
}

const SKIN_ROOT = 'src/foundation/tokens/css/presentation/components/skin';

/** Every authored rule of a family's skin. Keyframe steps are not selectors. */
export function readSkinRules(family: string, root = SKIN_ROOT): SkinRule[] {
  const css = readFileSync(resolve(process.cwd(), `${root}/${family}.css`), 'utf8');
  const out: SkinRule[] = [];
  postcss.parse(css).walkRules((rule: Rule) => {
    const conditions: string[] = [];
    let inKeyframes = false;
    for (let node = rule.parent; node; node = node.parent) {
      if ((node as AtRule).type === 'atrule') {
        const at = node as AtRule;
        if (at.name === 'keyframes') inKeyframes = true;
        conditions.push(`@${at.name} ${at.params}`);
      }
    }
    if (inKeyframes) return;
    const decls: Record<string, string> = {};
    rule.walkDecls((decl) => {
      decls[decl.prop] = decl.value.replace(/\s+/g, ' ').trim();
    });
    for (const selector of rule.selectors) {
      out.push({
        selector: selector.replace(/\s+/g, ' ').trim(),
        conditions: conditions.join(' '),
        decls,
      });
    }
  });
  return out;
}

/** The family's skin with comments blanked — declarations only, never prose. */
export function readSkinDeclarations(family: string, root = SKIN_ROOT): string {
  return readFileSync(resolve(process.cwd(), `${root}/${family}.css`), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    ''
  );
}

/** Selectors that need a state no static fixture holds. */
export const STATE_DEPENDENT =
  /:hover|:focus|:active|:focus-within|:focus-visible|:dir\(|::-webkit|::placeholder|:disabled/;

export interface ReachabilityQuery {
  rules: readonly SkinRule[];
  /**
   * Every root to search. A portalled panel does not live inside the render
   * container, so pass `document` for a portalled family — passing only the
   * container is the second way to manufacture a false dead reading.
   */
  scopes: readonly ParentNode[];
  /** Selectors excluded on purpose; each caller states its reason in situ. */
  exempt?: (selector: string) => boolean;
}

/**
 * Selectors that match nothing in any scope. A selector the test DOM cannot
 * parse is NOT reported — an unsupported selector is a limitation of the
 * environment, never evidence that paint is dead.
 */
export function unreachableSelectors({
  rules,
  scopes,
  exempt,
}: ReachabilityQuery): string[] {
  const unreachable: string[] = [];
  for (const rule of rules) {
    if (STATE_DEPENDENT.test(rule.selector)) continue;
    if (exempt?.(rule.selector)) continue;
    let matched = false;
    for (const scope of scopes) {
      try {
        if (scope.querySelector(rule.selector) !== null) {
          matched = true;
          break;
        }
      } catch {
        matched = true;
        break;
      }
    }
    if (!matched) {
      unreachable.push(`${rule.conditions ? `${rule.conditions} ` : ''}${rule.selector}`);
    }
  }
  return unreachable;
}

/**
 * The readiness gate for a portalled family: resolves only once the family's
 * CONTENT is mounted inside its governed surface, never at the surface alone.
 * `minContent` guards the case where a list container mounts before its rows.
 */
export async function waitForPortalContent(
  waitFor: (cb: () => void) => Promise<unknown>,
  surface: string,
  content: string,
  minContent = 1
): Promise<HTMLElement> {
  await waitFor(() => {
    const nodes = document.querySelectorAll(`${surface} ${content}`);
    if (nodes.length < minContent) {
      throw new Error(
        `portal content not ready: ${surface} ${content} matched ${nodes.length}, need ${minContent}`
      );
    }
  });
  return document.querySelector(surface) as HTMLElement;
}

/** The winning declaration for a property among rules the caller narrows. */
export function winningDecl(
  rules: readonly SkinRule[],
  property: string,
  match: (rule: SkinRule) => boolean
): SkinRule | undefined {
  return [...rules].reverse().find((rule) => match(rule) && property in rule.decls);
}
