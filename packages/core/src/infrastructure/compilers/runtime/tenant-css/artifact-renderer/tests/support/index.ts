/**
 * Same-reachable-state analysis for a rendered first-party artifact.
 *
 * The artifact has exactly ONE authored source. These helpers answer the only
 * question the single-author laws still need answered mechanically: which
 * document states a given rule authors the tenant ROOT in. That is how
 * `single-author.test.ts` tells the base block apart from a mode block without
 * matching on comment banners, so the laws survive a change of section prose.
 *
 * The conflict detector that used to live here existed to referee a second
 * author. There is no second author, so there is nothing to referee.
 *
 * Not a test file: `tests/**` is collected by pattern `*.test.ts`, and this
 * module deliberately does not match it.
 */
import postcss, { type Container, type Document, type Rule } from 'postcss';

/**
 * The document states a selector can match: `default` is the state with no
 * mode attribute set at all, alongside the two explicit modes.
 */
export type ReachableState = 'default' | 'light' | 'dark';

const ALL_STATES: readonly ReachableState[] = ['default', 'light', 'dark'];

/** Split a selector list on top-level commas; `:is(a, b)` stays one arm. */
export function splitArms(selector: string): string[] {
  const arms: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of selector) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) {
      if (current.trim()) arms.push(current.trim());
      current = '';
    } else current += char;
  }
  if (current.trim()) arms.push(current.trim());
  return arms;
}

/** True when the arm targets something INSIDE the root rather than the root. */
export function armIsDescendant(arm: string): boolean {
  let depth = 0;
  for (let i = 0; i < arm.length; i += 1) {
    const char = arm[i];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (depth === 0 && /[\s>+~]/.test(char) && arm.slice(i).trim().length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * The states an arm can match.
 *
 * A positive `[data-theme='dark']` or `.dark` pins the arm to dark. A
 * `:not([data-theme='dark']):not(.dark)` excludes dark and keeps the rest, so
 * an arm that merely avoids dark still reaches the default state — which is
 * why state membership, not selector text, decides what a rule authors.
 */
export function armStates(arm: string): ReachableState[] {
  const negated: string[] = [];
  const positive = arm.replace(/:not\(([^()]*)\)/g, (_match, inner: string) => {
    negated.push(inner);
    return ' ';
  });
  const negatedText = negated.join(' ');
  const namesDark = (text: string) =>
    /\[data-theme\s*=\s*['"]?dark['"]?\]/.test(text) || /\.dark\b/.test(text);
  const namesLight = (text: string) =>
    /\[data-theme\s*=\s*['"]?light['"]?\]/.test(text) || /\.light\b/.test(text);

  if (namesDark(positive)) return ['dark'];
  if (namesLight(positive)) return ['light'];
  return ALL_STATES.filter((state) => {
    if (state === 'dark' && namesDark(negatedText)) return false;
    if (state === 'light' && namesLight(negatedText)) return false;
    return true;
  });
}

/** The states in which a rule can author the tenant ROOT (never a descendant). */
export function ruleRootStates(rule: Rule): Set<ReachableState> {
  const states = new Set<ReachableState>();
  for (const arm of splitArms(rule.selector)) {
    if (armIsDescendant(arm)) continue;
    for (const state of armStates(arm)) states.add(state);
  }
  return states;
}

/** Channel → the states some root-level rule in this CSS authors it in. */
export function channelStates(css: string): Map<string, Set<ReachableState>> {
  const byChannel = new Map<string, Set<ReachableState>>();
  postcss.parse(css).walkRules((rule) => {
    // A rule inside `@media`/`@supports` is gated by a condition the compiled
    // block is not; a keyframe step is not a selector at all.
    for (
      let parent: Container | Document | undefined = rule.parent;
      parent;
      parent = parent.parent
    ) {
      if (parent.type === 'atrule') return;
    }
    const states = ruleRootStates(rule);
    if (states.size === 0) return;
    rule.walkDecls((decl) => {
      if (!decl.prop.startsWith('--')) return;
      const existing = byChannel.get(decl.prop) ?? new Set<ReachableState>();
      for (const state of states) existing.add(state);
      byChannel.set(decl.prop, existing);
    });
  });
  return byChannel;
}

/** One root-level declaration of a normal (non-custom) property. */
export interface RootPropertyDeclaration {
  /** Declared value, trimmed. */
  value: string;
  /** Document states the declaring rule authors the root in. */
  states: Set<ReachableState>;
  /** Selector of the declaring rule, for failure messages that name the block. */
  selector: string;
}

/**
 * Every root-level declaration of `prop` in the artifact, in source order.
 *
 * Deliberately keyed on the CASCADE, not on section banners: the single-author
 * laws must keep holding if the generated comment text is reworded, and must
 * not be satisfiable by a declaration hidden inside an at-rule or aimed at a
 * descendant. Custom properties are excluded by construction — this is the
 * counterpart of {@link channelStates}, which sees only `--*`.
 */
export function rootPropertyDeclarations(
  css: string,
  prop: string,
): RootPropertyDeclaration[] {
  const found: RootPropertyDeclaration[] = [];
  postcss.parse(css).walkRules((rule) => {
    for (
      let parent: Container | Document | undefined = rule.parent;
      parent;
      parent = parent.parent
    ) {
      if (parent.type === 'atrule') return;
    }
    const states = ruleRootStates(rule);
    if (states.size === 0) return;
    rule.walkDecls((decl) => {
      if (decl.prop !== prop) return;
      found.push({ value: decl.value.trim(), states, selector: rule.selector });
    });
  });
  return found;
}
