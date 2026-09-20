/**
 * The rewired motion sites, read from the skin sources rather than pinned.
 *
 * A site is one `transition`/`animation` layer whose DURATION slot binds an
 * intent name. The probe element is the axis instrument's own scene: the rule's
 * whole descendant chain collapsed onto one bare node, carrying every class and
 * attribute the chain names, with pseudo-classes dropped.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CORE = resolve(__dirname, '../../..');
export const SKIN_ROOTS = [
  'src/foundation/tokens/css/runtime/engines/modern/skin',
  'src/foundation/tokens/css/presentation/components/skin',
] as const;

const INTENTS = ['feedback', 'reveal', 'disclosure', 'resize', 'rearrange', 'attention'];
const INTENT_READ = new RegExp(`var\\(\\s*--ds-motion-(${INTENTS.join('|')})\\b`);

export interface MotionSite {
  /** `family#n`: unique per probed rule, so one family contributes many sites. */
  readonly id: string;
  readonly family: string;
  readonly root: string;
  readonly selector: string;
  readonly property: 'transition-duration' | 'animation-duration';
  /** The single-node scene the selector collapses to. */
  readonly markup: string;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, ' ');
}

function splitTop(value: string, separator: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of value) {
    if (char === '(' || char === '[') depth += 1;
    else if (char === ')' || char === ']') depth -= 1;
    if (char === separator && depth === 0) {
      out.push(current);
      current = '';
    } else current += char;
  }
  out.push(current);
  return out.map((part) => part.trim()).filter(Boolean);
}

/** Every top-level rule of a stylesheet: at-rule bodies are skipped, not descended. */
function topLevelRules(css: string): Array<{ selector: string; body: string }> {
  const rules: Array<{ selector: string; body: string }> = [];
  let index = 0;
  while (index < css.length) {
    const open = css.indexOf('{', index);
    if (open < 0) break;
    let depth = 0;
    let close = open;
    for (; close < css.length; close += 1) {
      if (css[close] === '{') depth += 1;
      else if (css[close] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const prelude = css.slice(index, open).trim();
    if (!prelude.startsWith('@')) rules.push({ selector: prelude, body: css.slice(open + 1, close) });
    index = close + 1;
  }
  return rules;
}

/** A compound selector reduced to the classes and attributes a bare node can carry. */
function stampsOf(compound: string): { type: string; classes: string[]; attributes: Map<string, string> } | null {
  // A pseudo-element or an interaction pseudo-class cannot be stamped: the
  // scene has no ::after box and the harness simulates no pointer.
  if (/::|:(?:hover|active|focus|focus-visible|focus-within|target|has)\b/.test(compound)) return null;
  const stripped = compound.replace(/:(?:not|where|is)\([^()]*\)/g, '').replace(/:[\w-]+(\([^()]*\))?/g, '');
  // A type selector must be honoured: `td[data-editable]` never matches a div.
  const type = /^([a-z][a-z0-9]*)/.exec(stripped)?.[1] ?? 'div';
  // A table part cannot be parsed inside a plain `<div>` scene, so a rule that
  // names one is left to the family's next candidate rather than mounted wrong.
  if (/^(td|th|tr|tbody|thead|tfoot|caption|col|colgroup)$/.test(type)) return null;
  const classes = [...stripped.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((match) => match[1]!);
  const attributes = new Map<string, string>();
  for (const match of stripped.matchAll(/\[([\w-]+)(?:([~^|$*]?=)\s*['"]?([^\]'"]*)['"]?)?\]/g)) {
    const [, name, operator, value] = match;
    if (!name) continue;
    // `~=` asks for one token of a list and every other operator is satisfied by
    // the exact value, so stamping the token itself is always legal.
    attributes.set(name, operator ? (value ?? '') : '');
  }
  return { type, classes, attributes };
}

/** The nested scene a selector's chain describes, with the subject marked. */
export function sceneFor(selector: string): string | null {
  const first = splitTop(selector, ',')[0];
  if (!first) return null;
  // `:where(a b)` / `:is(a b)` contribute their first alternative in place.
  const flattened = first
    // A `:is()`/`:where()` contributes its first alternative IN PLACE: padding it
    // with spaces would turn one compound into a descendant chain.
    .replace(/:(?:where|is)\(([^()]*)\)/g, (_match, inner: string) => splitTop(inner, ',')[0] ?? '')
    .replace(/\s*([>+~])\s*/g, ' $1 ')
    .trim();
  const parts = flattened.split(/\s+/).filter(Boolean);
  const compounds: string[] = [];
  for (const part of parts) {
    // A sibling combinator needs a preceding node, which an empty div supplies;
    // for the chain's shape that is the same as a descendant step.
    if (part === '>' || part === '+' || part === '~') continue;
    compounds.push(part);
  }
  if (!compounds.length) return null;
  const stamped = compounds.map(stampsOf);
  if (stamped.some((entry) => entry === null)) return null;
  let markup = '';
  for (let index = stamped.length - 1; index >= 0; index -= 1) {
    const { type, classes, attributes } = stamped[index]!;
    if (!classes.length && !attributes.size) return null;
    const attributeText = [...attributes].map(([name, value]) => ` ${name}="${value}"`).join('');
    const subject = index === stamped.length - 1 ? ' data-probe-subject="true"' : '';
    markup = `<${type}${subject} class="${classes.join(' ')}"${attributeText}>${markup}</${type}>`;
  }
  return markup;
}

/** Every probeable rule that binds an intent duration, across both skin roots. */
export function motionSites(): MotionSite[] {
  const sites: MotionSite[] = [];
  const seen = new Set<string>();
  for (const root of SKIN_ROOTS) {
    const rootPath = join(CORE, root);
    for (const family of readdirSync(rootPath).sort()) {
      const familyPath = join(rootPath, family);
      if (!statSync(familyPath).isDirectory()) continue;
      for (const file of readdirSync(familyPath).filter((name) => name.endsWith('.css'))) {
        const css = stripComments(readFileSync(join(familyPath, file), 'utf8'));
        for (const rule of topLevelRules(css)) {
          for (const declaration of splitTop(rule.body, ';')) {
            const [property, ...rest] = declaration.split(':');
            const name = property?.trim();
            if (name !== 'transition' && name !== 'animation') continue;
            const value = rest.join(':');
            // The intent name must sit in a DURATION slot: the first time-like
            // token of its layer, never the easing or the delay.
            const layer = splitTop(value, ',').find((part) => INTENT_READ.test(part));
            if (!layer) continue;
            const durationSlot = splitTop(layer, ' ').find((token) => /[0-9.]+m?s|var\(|calc\(/.test(token));
            if (!durationSlot || !INTENT_READ.test(durationSlot)) continue;
            const markup = sceneFor(rule.selector);
            if (!markup) continue;
            const key = `${markup}|${name}`;
            if (seen.has(key)) continue;
            seen.add(key);
            sites.push({
              id: `${family}#${sites.length}`,
              family,
              root,
              selector: rule.selector.replace(/\s+/g, ' '),
              property: name === 'animation' ? 'animation-duration' : 'transition-duration',
              markup,
            });
          }
        }
      }
    }
  }
  return sites;
}
