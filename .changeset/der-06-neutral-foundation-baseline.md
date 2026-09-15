---
"@rottay/design-system": patch
---

WO-DER-06 (D6-2a). The neutral foundation exists as a Theme:
`foundation/presets/neutral-theme` is a total, structural Theme with every
visual leaf undecided and no colour, typeface or shadow of its own. The compile
door can now resolve a first-party vertical over that foundation plus the
vertical's decision preset, admitted through the same document door every
tenant takes, instead of over the authored theme. The authored path stays the
default: nothing published compiles differently unless a caller names the new
baseline source.

```contract-diff
signature .#baselineFor — gains an optional third parameter, the baseline source ("brand-theme" by default, or "neutral-preset"); callers passing two arguments are unchanged
signature .#CompileThemeIntentOptions — gains an optional baselineSource; absent, the intent resolves over the authored theme as before
signature .#DraftPreviewThemeIntentInput — gains an optional carriedFrom Theme so a draft ledger can be read against a baseline other than the authored theme
export .#ResolveThemeOptions — added; resolveTheme's optional second argument, an explicit baseline the caller resolved
export .#THEME_BASELINE_SOURCES — added; the closed set of baseline sources
export .#ThemeBaselineSource — added; the union over that set
```
