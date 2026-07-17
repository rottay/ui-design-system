/**
 * @rottay/no-hardcoded-colors
 *
 * Detect hardcoded color values in JSX style props, style objects, and
 * Tailwind color utility classes. Colors should come from DS CSS variables
 * (var(--ds-*)) or semantic tokens.
 *
 * Allowed values: transparent, inherit, currentColor, currentcolor, unset,
 * initial, none, var(--ds-*), var(--*), CSS functions like calc().
 */

import type { Rule } from '../../../foundation/contracts';

// ── Patterns ───────────────────────────────────────────────────────

/** Hex colors: #rgb, #rrggbb, #rrggbbaa */
const HEX_RE = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

/** Functional color notations: rgb(), rgba(), hsl(), hsla(), oklch(), oklab(), lch(), lab(), color() */
const FUNC_COLOR_RE = /^(?:rgba?|hsla?|oklch|oklab|lch|lab|color|hwb)\s*\(/i;

/** CSS named colors (subset of the most common ones -- catches the vast majority) */
const NAMED_COLORS = new Set([
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure',
  'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood',
  'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan',
  'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon',
  'darkseagreen', 'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet',
  'deeppink', 'deepskyblue', 'dimgray', 'dimgrey', 'dodgerblue',
  'firebrick', 'floralwhite', 'forestgreen', 'fuchsia',
  'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey',
  'honeydew', 'hotpink',
  'indianred', 'indigo', 'ivory',
  'khaki',
  'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon',
  'lightseagreen', 'lightskyblue', 'lightslategray', 'lightslategrey', 'lightsteelblue',
  'lightyellow', 'lime', 'limegreen', 'linen',
  'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple',
  'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred',
  'midnightblue', 'mintcream', 'mistyrose', 'moccasin',
  'navajowhite', 'navy',
  'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid',
  'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
  'peru', 'pink', 'plum', 'powderblue', 'purple',
  'rebeccapurple', 'red', 'rosybrown', 'royalblue',
  'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue',
  'slateblue', 'slategray', 'slategrey', 'snow', 'springgreen', 'steelblue',
  'tan', 'teal', 'thistle', 'tomato', 'turquoise',
  'violet',
  'wheat', 'white', 'whitesmoke',
  'yellow', 'yellowgreen',
]);

/** Values that are safe and should not be flagged */
const SAFE_VALUES = new Set([
  'transparent', 'inherit', 'currentColor', 'currentcolor',
  'unset', 'initial', 'none', 'auto',
]);

/** Tailwind color utility class prefixes */
const TW_COLOR_PREFIXES = [
  'text-', 'bg-', 'border-', 'ring-', 'outline-', 'shadow-',
  'divide-', 'accent-', 'caret-', 'fill-', 'stroke-',
  'decoration-', 'placeholder-', 'from-', 'via-', 'to-',
];

/** Tailwind color names (the "palette" part after the prefix) */
const TW_COLOR_RE = /^(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{1,3}(?:\/\d{1,3})?)?$/;

// ── Helpers ────────────────────────────────────────────────────────

function isHardcodedColor(value: string): boolean {
  const trimmed = value.trim();
  if (SAFE_VALUES.has(trimmed)) return false;
  if (trimmed.startsWith('var(')) return false;
  if (trimmed.startsWith('calc(')) return false;
  if (HEX_RE.test(trimmed)) return true;
  if (FUNC_COLOR_RE.test(trimmed)) return true;
  if (NAMED_COLORS.has(trimmed.toLowerCase())) return true;
  return false;
}

/** CSS properties that hold color values */
const COLOR_PROPS = new Set([
  'color', 'backgroundColor', 'background', 'borderColor',
  'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
  'outlineColor', 'textDecorationColor', 'fill', 'stroke',
  'caretColor', 'columnRuleColor', 'accentColor',
  'boxShadow', 'textShadow',
]);

function isTailwindColorClass(cls: string): boolean {
  for (const prefix of TW_COLOR_PREFIXES) {
    if (cls.startsWith(prefix)) {
      const rest = cls.slice(prefix.length);
      if (TW_COLOR_RE.test(rest)) return true;
    }
  }
  return false;
}

// ── Rule ───────────────────────────────────────────────────────────

export const noHardcodedColors: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded color values; use DS CSS variables instead',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowTailwind: {
            type: 'boolean',
            description: 'When true, Tailwind color utilities are allowed (for marketing/landing pages)',
          },
          exempt: {
            type: 'array',
            items: { type: 'string' },
            description: 'Glob patterns for files that are exempt from this rule',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      hardcodedStyle: 'Hardcoded color "{{value}}" in style prop "{{prop}}". Use a DS CSS variable instead (e.g. var(--ds-color-*)).',
      hardcodedTailwind: 'Tailwind color class "{{className}}" detected. Use a DS CSS variable or semantic token instead.',
    },
  },

  create(context) {
    const opts = context.options[0] ?? {};
    const allowTailwind: boolean = opts.allowTailwind ?? false;
    const exempt: string[] = opts.exempt ?? [];
    const filename: string = context.filename ?? context.getFilename?.() ?? '';

    // Lightweight glob check (reuse the same logic from no-raw-html)
    function simpleGlobMatch(pattern: string, filepath: string): boolean {
      const np = filepath.replace(/\\/g, '/');
      const npat = pattern.replace(/\\/g, '/');
      const regexStr = npat
        .replace(/[.+^${}()|[\]]/g, '\\$&')
        .replace(/\*\*/g, '{{GLOBSTAR}}')
        .replace(/\*/g, '[^/]*')
        .replace(/\?/g, '[^/]')
        .replace(/\{\{GLOBSTAR\}\}/g, '.*');
      return new RegExp(`^${regexStr}$`).test(np);
    }

    if (exempt.some((p) => simpleGlobMatch(p, filename))) {
      return {};
    }

    // Resolve a node to a raw string value (if possible)
    function resolveStringValue(node: any): string | null {
      if (!node) return null;
      if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
      if (node.type === 'TemplateLiteral' && node.quasis.length === 1 && node.expressions.length === 0) {
        return node.quasis[0].value.cooked ?? node.quasis[0].value.raw;
      }
      return null;
    }

    return {
      // Check style={{ color: '#fff' }}
      JSXAttribute(node: any) {
        if (node.name?.name !== 'style') return;
        const valueNode = node.value;
        if (!valueNode || valueNode.type !== 'JSXExpressionContainer') return;

        const expr = valueNode.expression;
        if (!expr || expr.type !== 'ObjectExpression') return;

        for (const prop of expr.properties) {
          if (prop.type !== 'Property') continue;
          const propName =
            prop.key.type === 'Identifier' ? prop.key.name :
            prop.key.type === 'Literal' ? String(prop.key.value) : null;
          if (!propName || !COLOR_PROPS.has(propName)) continue;

          const raw = resolveStringValue(prop.value);
          if (raw && isHardcodedColor(raw)) {
            context.report({
              node: prop.value,
              messageId: 'hardcodedStyle',
              data: { value: raw, prop: propName },
            });
          }
        }
      },

      // Check className="text-blue-500 bg-gray-100"
      ...(allowTailwind ? {} : {
        JSXOpeningElement(node: any) {
          for (const attr of node.attributes ?? []) {
            if (attr.type !== 'JSXAttribute') continue;
            if (attr.name?.name !== 'className') continue;

            const raw = resolveStringValue(attr.value);
            if (!raw) continue;

            const classes = raw.split(/\s+/).filter(Boolean);
            for (const cls of classes) {
              if (isTailwindColorClass(cls)) {
                context.report({
                  node: attr.value,
                  messageId: 'hardcodedTailwind',
                  data: { className: cls },
                });
              }
            }
          }
        },
      }),
    };
  },
};
