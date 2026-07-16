/**
 * @rottay/no-direct-lucide
 *
 * Disallow direct runtime access to 'lucide-react'. Apps must import icons
 * from the semantic design-system entrypoints so the DS can control meaning,
 * tree-shaking, and future supplier swaps.
 *
 * Type-only imports (`import type { LucideIcon } from 'lucide-react'`) are
 * allowed during the transition period.
 *
 * Files inside the DS compatibility catalog are exempt by default because the
 * temporary legacy catalog itself still wraps Lucide.
 *
 * Consumers can add extra exempt paths via the `exempt` option (glob patterns
 * matched against the file path).
 */

import type { Rule } from "../types";

// ── Built-in exemption for the DS icon catalog ───────────────────────
const BUILTIN_EXEMPT = "**/icons/catalog/**";

// ── Lightweight glob matcher (same as no-raw-html) ───────────────────
function simpleGlobMatch(pattern: string, filepath: string): boolean {
  const normalizedPath = filepath.replace(/\\/g, "/");
  const normalizedPattern = pattern.replace(/\\/g, "/");

  const regexStr = normalizedPattern
    .replace(/[.+^${}()|[\]]/g, "\\$&")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, "[^/]")
    .replace(/\{\{GLOBSTAR\}\}/g, ".*");

  return new RegExp(`^${regexStr}$`).test(normalizedPath);
}

// ── Rule ─────────────────────────────────────────────────────────────
export const noDirectLucide: Rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct lucide-react imports; use DS icons instead",
    },
    schema: [
      {
        type: "object",
        properties: {
          exempt: {
            type: "array",
            items: { type: "string" },
            description:
              "Glob patterns for files allowed to import directly from lucide-react",
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useDS:
        "Use a semantic '@rottay/design-system/icons/*' entrypoint instead of " +
        "the Lucide supplier module '{{source}}'.",
    },
  },

  create(context) {
    const userExempt: string[] = context.options[0]?.exempt ?? [];
    const exempt = [BUILTIN_EXEMPT, ...userExempt];
    const filename: string = context.filename ?? context.getFilename?.() ?? "";

    // If the file matches an exemption pattern, skip entirely.
    if (exempt.some((p) => simpleGlobMatch(p, filename))) {
      return {} as Record<string, (node: any) => void>;
    }

    function isLucideSource(value: unknown): value is string {
      return (
        typeof value === "string" &&
        (value === "lucide-react" || value.startsWith("lucide-react/"))
      );
    }

    function report(node: any, source: string): void {
      context.report({
        node,
        messageId: "useDS",
        data: { source },
      });
    }

    function hasRuntimeImport(node: any): boolean {
      if (node.importKind === "type") return false;
      const specifiers = Array.isArray(node.specifiers) ? node.specifiers : [];
      return (
        specifiers.length === 0 ||
        specifiers.some((specifier: any) => specifier.importKind !== "type")
      );
    }

    function literalSource(node: any): string | null {
      const value = node?.source?.value ?? node?.value;
      return isLucideSource(value) ? value : null;
    }

    return {
      ImportDeclaration(node: any) {
        const source = literalSource(node);
        if (source && hasRuntimeImport(node)) report(node, source);
      },
      ExportNamedDeclaration(node: any) {
        const source = literalSource(node);
        if (source && node.exportKind !== "type") report(node, source);
      },
      ExportAllDeclaration(node: any) {
        const source = literalSource(node);
        if (source && node.exportKind !== "type") report(node, source);
      },
      ImportExpression(node: any) {
        const source = literalSource(node);
        if (source) report(node, source);
      },
      CallExpression(node: any) {
        const firstArgument = node.arguments?.[0];
        const source = literalSource(firstArgument);
        const isRequire =
          node.callee?.type === "Identifier" && node.callee.name === "require";
        const isLegacyDynamicImport = node.callee?.type === "Import";
        if (source && (isRequire || isLegacyDynamicImport))
          report(node, source);
      },
    };
  },
};
