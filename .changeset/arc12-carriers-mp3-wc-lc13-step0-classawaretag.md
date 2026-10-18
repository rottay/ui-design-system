---
"@rottay/design-system": patch
---

The `axis-difference` theme check hardens its `classAwareTag` reader: a door is
now admitted only at a real JSX attribute boundary. Self-closing tags, spaces
inside a JSX expression value and spaces inside a string attribute value throw
at module load instead of being silently re-anchored (ARC-12 M-P3, Wave C lot
LC13 step 0; carries the f9b F1 review finding). The gates the reader builds
for conforming tags are byte-unchanged; seven tests pin the three rejected
forms, the two admitted exploit shapes and the canonical door.
