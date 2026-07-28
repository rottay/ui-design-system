/**
 * Same-reachable-state analysis for a rendered first-party artifact.
 *
 * Shared by the two tests that need it: EXTENSION-CANNOT-BEAT-TENANT asserts
 * no extension re-declares a compiled channel in a state both reach, and
 * TENANT-COLOR-PROPAGATION uses the same detector to prove that a channel
 * frozen by an extension is a detected override rather than a silent one. One
 * implementation, so the two can never disagree about what "competing" means.
 *
 * Not a test file: `tests/**` is collected by pattern `*.test.ts`, and this
 * module deliberately does not match it.
 */
import postcss, { type Container, type Document, type Rule } from 'postcss';

/** Separates the compiled authorship from the declared extension. */
export const EXTENSION_MARKER =
  '/* === Declared artifact extension (authored source, mechanically scoped) === */';

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
 * `:not([data-theme='dark']):not(.dark)` excludes dark and keeps the rest —
 * which is how the bithire extension is written, and why its rules do not
 * compete with the compiled dark mode block even though they name the same
 * channels.
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

/** Split a rendered artifact into its compiled authorship and its extension. */
export function splitArtifact(artifactCss: string): {
  compiled: string;
  extension: string;
} {
  const markerIndex = artifactCss.indexOf(EXTENSION_MARKER);
  if (markerIndex === -1) throw new Error('the artifact has no extension section');
  return {
    compiled: artifactCss.slice(0, markerIndex),
    extension: artifactCss.slice(markerIndex + EXTENSION_MARKER.length),
  };
}

/**
 * Channels the extension re-declares in a state the compiled side also
 * authors. Same channel in disjoint states is not a conflict — that is the
 * entire purpose of a mode block.
 */
export function tenantOverrideConflicts(artifactCss: string): string[] {
  const { compiled: compiledCss, extension: extensionCss } = splitArtifact(artifactCss);
  const compiled = channelStates(compiledCss);
  const extension = channelStates(extensionCss);
  if (compiled.size === 0) throw new Error('the compiled block emits nothing');

  const found: string[] = [];
  for (const [channel, extensionStates] of extension) {
    const compiledStates = compiled.get(channel);
    if (!compiledStates) continue;
    if ([...extensionStates].some((state) => compiledStates.has(state))) found.push(channel);
  }
  return found.sort();
}
