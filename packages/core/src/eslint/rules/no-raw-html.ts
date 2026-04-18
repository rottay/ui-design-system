/**
 * @rottay/no-raw-html
 *
 * Disallow raw HTML elements in JSX when a Design System primitive exists.
 * Consumers can exempt paths via the `exempt` option (glob patterns matched
 * against the file path).
 */

import type { Rule } from '../types';

// ── Replacement map ────────────────────────────────────────────────
const REPLACEMENTS: Record<string, string> = {
  div: 'Box',
  span: 'Text',
  p: 'Text',
  button: 'Button',
  input: 'Input',
  h1: 'Text as="h1"',
  h2: 'Text as="h2"',
  h3: 'Text as="h3"',
  h4: 'Text as="h4"',
  h5: 'Text as="h5"',
  h6: 'Text as="h6"',
  table: 'Table',
  img: 'Image',
  form: 'Box as="form"',
  textarea: 'Textarea',
  select: 'Select',
  label: 'Text as="label"',
  section: 'Box as="section"',
  article: 'Box as="article"',
  nav: 'Box as="nav"',
  header: 'Box as="header"',
  footer: 'Box as="footer"',
  main: 'Box as="main"',
  aside: 'Box as="aside"',
};

// ── Lightweight glob matcher (no external deps) ────────────────────
function simpleGlobMatch(pattern: string, filepath: string): boolean {
  // Normalize path separators
  const normalizedPath = filepath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  // Convert glob to regex:
  //   **  -> match anything (including /)
  //   *   -> match anything except /
  //   ?   -> match single char except /
  //   .   -> escaped literal dot
  const regexStr = normalizedPattern
    .replace(/[.+^${}()|[\]]/g, '\\$&') // escape regex special chars (except * and ?)
    .replace(/\*\*/g, '{{GLOBSTAR}}')    // temp placeholder for **
    .replace(/\*/g, '[^/]*')             // * -> anything except /
    .replace(/\?/g, '[^/]')             // ? -> single char except /
    .replace(/\{\{GLOBSTAR\}\}/g, '.*'); // ** -> anything

  return new RegExp(`^${regexStr}$`).test(normalizedPath);
}

// ── Rule ───────────────────────────────────────────────────────────
export const noRawHtml: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw HTML elements; use DS primitives instead',
    },
    schema: [
      {
        type: 'object',
        properties: {
          exempt: {
            type: 'array',
            items: { type: 'string' },
            description: 'Glob patterns for files that are allowed to use raw HTML (e.g. landing pages)',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useDS: 'Use DS <{{replacement}}> instead of raw <{{element}}>.',
    },
  },

  create(context) {
    const exempt: string[] = context.options[0]?.exempt ?? [];
    const filename: string = context.filename ?? context.getFilename?.() ?? '';

    // If the file matches an exemption pattern, skip entirely
    if (exempt.some((p) => simpleGlobMatch(p, filename))) {
      return { JSXOpeningElement() { /* exempt - no-op */ } };
    }

    return {
      JSXOpeningElement(node: any) {
        // Only handle plain identifiers (lowercase = HTML element)
        if (node.name.type !== 'JSXIdentifier') return;
        const name: string = node.name.name;

        if (!(name in REPLACEMENTS)) return;

        context.report({
          node,
          messageId: 'useDS',
          data: {
            element: name,
            replacement: REPLACEMENTS[name],
          },
        });
      },
    };
  },
};
