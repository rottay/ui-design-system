/**
 * @rottay/no-direct-lucide
 *
 * Disallow direct value imports from 'lucide-react'. Apps must import icons
 * from '@rottay/design-system/icons' so the DS can control icon aliasing,
 * tree-shaking, and future icon-set swaps.
 *
 * Type-only imports (`import type { LucideIcon } from 'lucide-react'`) are
 * allowed during the transition period.
 *
 * Files inside `**/icons/catalog/**` are exempt by default because the DS
 * catalog itself must re-export from lucide.
 *
 * Consumers can add extra exempt paths via the `exempt` option (glob patterns
 * matched against the file path).
 */

import type { Rule } from '../types';

// ── Built-in exemption for the DS icon catalog ───────────────────────
const BUILTIN_EXEMPT = '**/icons/catalog/**';

// ── Lightweight glob matcher (same as no-raw-html) ───────────────────
function simpleGlobMatch(pattern: string, filepath: string): boolean {
  const normalizedPath = filepath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  const regexStr = normalizedPattern
    .replace(/[.+^${}()|[\]]/g, '\\$&')
    .replace(/\*\*/g, '{{GLOBSTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/\{\{GLOBSTAR\}\}/g, '.*');

  return new RegExp(`^${regexStr}$`).test(normalizedPath);
}

// ── Rule ─────────────────────────────────────────────────────────────
export const noDirectLucide: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct lucide-react imports; use DS icons instead',
    },
    schema: [
      {
        type: 'object',
        properties: {
          exempt: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Glob patterns for files allowed to import directly from lucide-react',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useDS:
        "Import icons from '@rottay/design-system/icons' instead of 'lucide-react'. " +
        'Use {{iconName}}Icon from the DS.',
    },
  },

  create(context) {
    const userExempt: string[] = context.options[0]?.exempt ?? [];
    const exempt = [BUILTIN_EXEMPT, ...userExempt];
    const filename: string = context.filename ?? context.getFilename?.() ?? '';

    // If the file matches an exemption pattern, skip entirely
    if (exempt.some((p) => simpleGlobMatch(p, filename))) {
      return { ImportDeclaration() { /* exempt - no-op */ } };
    }

    return {
      ImportDeclaration(node: any) {
        // Only care about imports from 'lucide-react'
        if (node.source?.value !== 'lucide-react') return;

        // Allow type-only imports: `import type { LucideIcon } from 'lucide-react'`
        if (node.importKind === 'type') return;

        // Determine a representative icon name for the message
        const firstSpecifier = node.specifiers?.[0];
        const iconName =
          firstSpecifier?.imported?.name ?? firstSpecifier?.local?.name ?? 'YourIcon';

        context.report({
          node,
          messageId: 'useDS',
          data: { iconName },
        });
      },
    };
  },
};
