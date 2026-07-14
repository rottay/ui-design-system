/**
 * Side-effect CSS imports.
 *
 * The commercial kit co-locates its stylesheet with its component and imports it
 * for effect (`import './SectionFrame.css'`). Under `moduleResolution: "bundler"`,
 * TypeScript refuses a side-effect import of a non-TS extension unless a module
 * declaration exists for it -- so without this, `tsc --noEmit` reports TS2882 for
 * every such import while the bundle itself builds and runs perfectly.
 *
 * The import carries no bindings; the bundler emits the CSS. There is nothing to
 * type beyond the module's existence.
 */
declare module '*.css';
