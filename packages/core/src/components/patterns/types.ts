// Compatibility shim. The real source lives in `_internal/types.ts` after the
// 2026-04-08 audit moved support material out of the patterns/ root. Removing
// this shim would require updating ~90 internal imports — left as a follow-up.
export * from './_internal/types';
