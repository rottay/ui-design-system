/**
 * Side-effect CSS imports.
 *
 * Authored UI modules may co-locate a stylesheet and import it for its bundler
 * side effect. Under `moduleResolution: "bundler"`, TypeScript still needs a
 * declaration for the non-TypeScript module even though the import carries no
 * runtime bindings.
 */
declare module '*.css';
