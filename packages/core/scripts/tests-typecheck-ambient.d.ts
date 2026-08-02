// Ambient types for the tests-only typecheck program (tsconfig.tests.json).
//
// The production `tsconfig.json` excludes tests, so these types were never
// applied there. vitest globals and the jest-dom matcher augmentation must be
// referenced explicitly for the test program to typecheck bare `describe`/`it`
// and `expect(...).toBeInTheDocument()` calls.
//
// `*.css?raw` is imported only from test fixtures/specs (no production source
// imports it), so the main build carries no shim for it.

/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />
// `import.meta.glob` is Vite's, not Node's — the entrypoint contract tests
// enumerate engine modules with it.
/// <reference types="vite/client" />

declare module '*.css?raw' {
  const content: string;
  export default content;
}
