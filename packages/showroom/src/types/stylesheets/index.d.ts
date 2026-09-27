// The design system's style subpaths (e.g. ./styles/frozen-engines) are side-effect CSS imports
// without a .css extension, so the ambient '*.css' module does not type them.
declare module '@rottay/design-system/styles/*';
