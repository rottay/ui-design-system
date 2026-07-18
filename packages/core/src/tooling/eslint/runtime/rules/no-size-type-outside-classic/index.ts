/**
 * @rottay/no-size-type-outside-classic
 *
 * Restrict imports of the deprecated `SizeType` binding
 * (`foundation/contracts/kernel/common`) to `engines/classic/` paths -- the
 * antd size-vocabulary bridge, the only place a component still needs the
 * `'small' | 'middle' | 'large' | 'default'` spelling to translate a
 * canonical `size` step at the Ant Design boundary via `toLegacySize`.
 *
 * Public contract files (`contracts/index.ts`) and modern/rustic engines use
 * the canonical `Size` (`'sm' | 'md' | 'lg'`) widened for one release with
 * `LegacySizeAlias` -- a second, unrestricted export of the identical union,
 * so a public `*Size` type can still accept legacy spellings without pulling
 * in the classic-only name. Both `SizeType` and `LegacySizeAlias` are
 * type-only exports; unlike `no-direct-lucide`'s runtime-import scope, this
 * rule intentionally flags `import type` too, since a type-only import is
 * the only way `SizeType` is ever consumed.
 *
 * Consumers can add extra exempt paths via the `exempt` option (glob
 * patterns matched against the file path), matching the sibling rules'
 * `exempt` option shape.
 */

import type { Rule } from '../../../foundation/contracts';

// ── Built-in exemption: the antd size-vocabulary bridge ──────────────
const BUILTIN_EXEMPT = '**/engines/classic/**';

// ── Lightweight glob matcher (same as no-raw-html / no-direct-lucide) ─
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

const TARGET_NAME = 'SizeType';

// ── Rule ─────────────────────────────────────────────────────────────
export const noSizeTypeOutsideClassic: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: "Restrict the deprecated 'SizeType' import to engines/classic/ (the antd size-vocabulary bridge)",
    },
    schema: [
      {
        type: 'object',
        properties: {
          exempt: {
            type: 'array',
            items: { type: 'string' },
            description: 'Glob patterns for files allowed to import SizeType outside engines/classic/',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useCanonical:
        "Import 'SizeType' only under engines/classic/ (the antd size-vocabulary bridge). Public *Size contracts use " +
        "the canonical Size ('sm' | 'md' | 'lg') widened with LegacySizeAlias for one release; modern/rustic engines " +
        'normalize via toCanonicalSize.',
    },
  },

  create(context) {
    const userExempt: string[] = context.options[0]?.exempt ?? [];
    const exempt = [BUILTIN_EXEMPT, ...userExempt];
    const filename: string = context.filename ?? context.getFilename?.() ?? '';

    if (exempt.some((pattern) => simpleGlobMatch(pattern, filename))) {
      return {} as Record<string, (node: any) => void>;
    }

    function importedName(specifier: any): string | undefined {
      const imported = specifier?.imported;
      return imported?.name ?? imported?.value;
    }

    function report(node: any): void {
      context.report({ node, messageId: 'useCanonical' });
    }

    return {
      ImportDeclaration(node: any) {
        const specifiers = Array.isArray(node.specifiers) ? node.specifiers : [];
        const hit = specifiers.find(
          (specifier: any) => specifier.type === 'ImportSpecifier' && importedName(specifier) === TARGET_NAME,
        );
        if (hit) report(hit);
      },
      ExportNamedDeclaration(node: any) {
        // ESTree's ExportNamedDeclaration always carries `specifiers` directly
        // (possibly empty); `export * from '...'` is a distinct node type
        // (ExportAllDeclaration, unhandled here, matching no-direct-lucide's
        // scope) so there is no nested clause to unwrap first.
        const specifiers = Array.isArray(node.specifiers) ? node.specifiers : [];
        const hit = specifiers.find((specifier: any) => {
          if (specifier.type !== 'ExportSpecifier') return false;
          const local = specifier.local?.name ?? specifier.local?.value;
          const exported = specifier.exported?.name ?? specifier.exported?.value;
          return local === TARGET_NAME || exported === TARGET_NAME;
        });
        if (hit) report(hit);
      },
    };
  },
};
