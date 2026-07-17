/**
 * @rottay/no-db-in-components
 *
 * Prevent database/ORM imports from appearing in UI component files.
 * Component code should never directly import from drizzle-orm, database
 * clients, or schema modules -- data fetching belongs in server actions,
 * API routes, or dedicated data-access layers.
 *
 * Trigger conditions (any one is enough):
 *   1. File path contains /components/, /screens/, or /ui/
 *   2. File contains "use client" directive
 *
 * Flagged import sources:
 *   - drizzle-orm (and subpaths)
 *   - Any path containing /database/ or /db/
 *   - @/core/lib/db, @/core/database, @/lib/db, @/lib/database
 *   - @rottay/{module}/database, @rottay/{module}/db
 */

import type { Rule } from '../../../foundation/contracts';

// ── Patterns ───────────────────────────────────────────────────────

/** Import source patterns that indicate DB access */
const DB_PATTERNS: RegExp[] = [
  /^drizzle-orm/,
  /\/database\//,
  /\/db\//,
  /^@\/core\/lib\/db/,
  /^@\/core\/database/,
  /^@\/lib\/db/,
  /^@\/lib\/database/,
  /^@rottay\/[^/]+\/database/,
  /^@rottay\/[^/]+\/db/,
  /^\.\.?\/.*database/,
  /^\.\.?\/.*\/db\//,
  /^pg$/,
  /^postgres$/,
  /^mysql2?$/,
  /^better-sqlite3$/,
  /^@neondatabase\//,
  /^@planetscale\//,
  /^@vercel\/postgres/,
  /^kysely/,
  /^prisma/,
  /^@prisma\//,
  /^typeorm/,
  /^sequelize/,
  /^knex/,
  /^mongoose/,
];

/** File path patterns that indicate a UI component file */
const COMPONENT_PATH_PATTERNS: RegExp[] = [
  /\/components\//,
  /\/screens\//,
  /\/ui\//,
];

// ── Helpers ────────────────────────────────────────────────────────

function isComponentFile(filename: string): boolean {
  const normalized = filename.replace(/\\/g, '/');
  return COMPONENT_PATH_PATTERNS.some((re) => re.test(normalized));
}

function isDbSource(source: string): boolean {
  return DB_PATTERNS.some((re) => re.test(source));
}

// ── Rule ───────────────────────────────────────────────────────────

export const noDbInComponents: Rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow database/ORM imports in UI component files',
    },
    schema: [
      {
        type: 'object',
        properties: {
          additionalPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional import source regex patterns to flag',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noDb: 'Database import "{{source}}" is not allowed in component files. Move data fetching to a server action, API route, or data-access layer.',
    },
  },

  create(context) {
    const opts = context.options[0] ?? {};
    const filename: string = context.filename ?? context.getFilename?.() ?? '';

    // Build extra patterns from options
    const extraPatterns: RegExp[] = (opts.additionalPatterns ?? []).map(
      (p: string) => new RegExp(p),
    );
    const allPatterns = [...DB_PATTERNS, ...extraPatterns];

    function isDbSourceExtended(source: string): boolean {
      return allPatterns.some((re) => re.test(source));
    }

    // We need to check both the file path and the "use client" directive.
    // If the file path matches, we check all imports immediately.
    // If the file has "use client", we also check (detected via the AST).
    const pathIsComponent = isComponentFile(filename);

    // Track whether we've seen "use client"
    let hasUseClient = false;
    // Store import nodes to check later (if "use client" is found after imports)
    const pendingImports: Array<{ node: any; source: string }> = [];

    function reportIfDb(node: any, source: string) {
      if (isDbSourceExtended(source)) {
        context.report({
          node,
          messageId: 'noDb',
          data: { source },
        });
      }
    }

    return {
      // Detect "use client" directive (may appear as ExpressionStatement
      // with directive property, or as a plain string literal expression)
      ExpressionStatement(node: any) {
        const isDirective =
          node.directive === 'use client' ||
          (node.expression?.type === 'Literal' && node.expression.value === 'use client');

        if (!isDirective) return;

        hasUseClient = true;
        // Report any pending imports that are DB-related
        for (const pending of pendingImports) {
          reportIfDb(pending.node, pending.source);
        }
        pendingImports.length = 0;
      },

      // Check static imports: import { x } from 'drizzle-orm'
      ImportDeclaration(node: any) {
        const source = node.source?.value;
        if (typeof source !== 'string') return;

        if (pathIsComponent || hasUseClient) {
          reportIfDb(node, source);
        } else {
          // Store for later in case "use client" appears after imports
          pendingImports.push({ node, source });
        }
      },

      // Check dynamic imports: const db = await import('drizzle-orm')
      'CallExpression[callee.type="Import"]'(node: any) {
        const arg = node.arguments?.[0];
        if (!arg) return;
        const source =
          arg.type === 'Literal' ? arg.value :
          arg.type === 'TemplateLiteral' && arg.quasis.length === 1 && arg.expressions.length === 0
            ? (arg.quasis[0].value.cooked ?? arg.quasis[0].value.raw)
            : null;

        if (typeof source !== 'string') return;

        if (pathIsComponent || hasUseClient) {
          reportIfDb(node, source);
        }
      },

      // Check require calls: const db = require('drizzle-orm')
      'CallExpression[callee.name="require"]'(node: any) {
        const arg = node.arguments?.[0];
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string') return;

        if (pathIsComponent || hasUseClient) {
          reportIfDb(node, arg.value);
        }
      },

      // At program end, handle "use client" directive detection via Program node
      'Program:exit'() {
        // Clear pending imports -- if "use client" was never found and path
        // didn't match, these are fine.
        pendingImports.length = 0;
      },
    };
  },
};
