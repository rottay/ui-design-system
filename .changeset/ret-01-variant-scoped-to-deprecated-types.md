---
"@rottay/design-system": patch
---

WO-RET-01 (the kernel `Variant` no longer underlies two live contracts). `ButtonVariant` and `ToastVariant` state their members as literals instead of extending the deprecated kernel `Variant`. The resolved unions are identical, so no value a consumer passes changes: `ButtonVariant` is still `'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient' | 'outline' | 'info' | 'text' | 'link' | 'ghost' | 'dashed' | 'danger' | 'ai'` and `ToastVariant` is still `'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient' | 'info'`. Two new type tests assert each union equals its former `Variant`-based definition.

`Variant` itself is unchanged and stays deprecated. It is now the union behind the deprecated `BadgeVariant`, `TagVariant` and `AvatarVariant` (and `AvatarProps.variant`) only, and leaves with them; none of those three changes here.

Census (2026-10-03, TypeScript-parser search over `packages/core/src`, `packages/showroom/src` and the `src` roots of the three apps): no application and no showroom file imports `Variant` by name. The application imports of the `BadgeVariant` type are untouched.

```contract-diff
signature .#ButtonVariant — states its seven former `Variant` members as literals instead of extending the deprecated kernel `Variant`; the resolved union is identical (RET-01)
signature .#ToastVariant — states its seven former `Variant` members as literals instead of extending the deprecated kernel `Variant`; the resolved union is identical (RET-01)
```
