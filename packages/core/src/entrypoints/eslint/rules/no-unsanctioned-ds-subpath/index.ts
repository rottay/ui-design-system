/**
 * @rottay/no-unsanctioned-ds-subpath
 *
 * The apps may only import the subpaths the consumer contract guarantees.
 * Everything else -- internal contracts and runtimes, per-component subpaths,
 * product icon packs, published test fixtures, per-vertical stylesheets,
 * internal tooling manifests -- is either scheduled for retirement or was
 * never published, and coupling to it blocks WO-RET-01 / WO-CAN-03.
 *
 * The rule is fail-closed: a specifier that addresses @rottay/design-system
 * and is not `guaranteed` in the contract table is reported, including
 * subpaths that appear in no table at all.
 *
 * Source of the table: packages/core/docs/consumer-contract/index.md §1.2/§1.3.
 */

import type { Rule } from '../../contracts';

import {
  CONTRACT_DOCUMENT_PATH,
  CONTRACT_PACKAGE,
  classifySubpath,
  subpathOfSpecifier,
} from './contract';

// ── Lightweight glob matcher (same shape as the sibling governance rules) ──
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

export const noUnsanctionedDsSubpath: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Only import the @rottay/design-system subpaths the consumer contract guarantees',
      url: CONTRACT_DOCUMENT_PATH,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowSubpaths: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Per-app baseline of unsanctioned subpaths, e.g. "./icons/presets/bithire". Decrease-only: entries are removed as the app migrates, never added.',
          },
          exempt: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Glob patterns for files allowed to import outside the sanctioned surface',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      retireBy:
        "'{{specifier}}' is not part of the sanctioned import surface " +
        '(disposition: retire-by {{retiredBy}}). Import it from the guaranteed ' +
        `surface instead; see ${CONTRACT_DOCUMENT_PATH}.`,
      forbidden:
        "'{{specifier}}' is not a published subpath of " +
        `${CONTRACT_PACKAGE} and the design system takes no retirement action ` +
        `on it. Resolve it in the consuming app; see ${CONTRACT_DOCUMENT_PATH}.`,
      unknown:
        "'{{specifier}}' is not listed in the consumer contract. The contract " +
        'is fail-closed: only the guaranteed subpaths of ' +
        `${CONTRACT_DOCUMENT_PATH} may be imported.`,
    },
  },

  create(context) {
    const allowSubpaths: string[] = context.options[0]?.allowSubpaths ?? [];
    const exempt: string[] = context.options[0]?.exempt ?? [];
    const filename: string = context.filename ?? context.getFilename?.() ?? '';

    if (exempt.some((pattern) => simpleGlobMatch(pattern, filename))) {
      return {} as Record<string, (node: any) => void>;
    }

    const allowed = new Set(allowSubpaths);

    function check(node: any, specifier: unknown): void {
      if (typeof specifier !== 'string') return;
      const subpath = subpathOfSpecifier(specifier);
      if (subpath === null) return;
      if (allowed.has(subpath)) return;

      const row = classifySubpath(subpath);
      if (row?.disposition === 'guaranteed') return;

      const messageId =
        row === null
          ? 'unknown'
          : row.disposition === 'forbidden'
            ? 'forbidden'
            : 'retireBy';

      context.report({
        node,
        messageId,
        data: { specifier, subpath, retiredBy: row?.retiredBy ?? '' },
      });
    }

    function sourceValue(node: any): unknown {
      return node?.source?.value ?? node?.value;
    }

    return {
      ImportDeclaration(node: any) {
        check(node, sourceValue(node));
      },
      ExportNamedDeclaration(node: any) {
        if (node?.source) check(node, sourceValue(node));
      },
      ExportAllDeclaration(node: any) {
        check(node, sourceValue(node));
      },
      ImportExpression(node: any) {
        check(node, sourceValue(node));
      },
      CallExpression(node: any) {
        const isRequire =
          node.callee?.type === 'Identifier' && node.callee.name === 'require';
        const isLegacyDynamicImport = node.callee?.type === 'Import';
        if (!isRequire && !isLegacyDynamicImport) return;
        check(node, sourceValue(node.arguments?.[0]));
      },
    };
  },
};
