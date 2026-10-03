---
"@rottay/design-system": minor
---

DataTable's inline cell editing is operable from the keyboard, and an editor
that closes hands focus back to its row.

Editing a cell could only be started with the pointer (`editTrigger`: click or
double-click), and when the editor closed its control was removed while it held
focus, so focus fell to `<body>` and the row kept a stale focus stamp. Modern
engine only; no prop, contract or public type changes.

Keys, on a focused body row:

| key | before | after |
| --- | --- | --- |
| `F2` | nothing | opens the editor of the row's first editable cell (the first one `canEdit` allows) and focuses its control; ignored when the row has no editable cell or when the key comes from a control inside the row |
| `Enter` | `onRowClick`, when one is set | unchanged; it never starts an edit |
| `ArrowUp` / `ArrowDown` / `Home` / `End` | move the active row | unchanged |

Keys, inside the open editor (unchanged behaviour, new focus outcome):

| key | behaviour | where focus goes when the editor closes |
| --- | --- | --- |
| `Enter` | validates and commits | the row |
| `Escape` | cancels | the row |
| `Tab` / `Shift+Tab` | commits, then opens the next / previous editable cell of the row (`tabNavigation`, default on) | the next editor; past the last or before the first editable cell, the row |

Focus rule: the row takes focus back only when the editor closed while focus
was still inside its cell, however the edit ended (commit, cancel, discard, a
controlled `editingCell` set to `null`). An edit that ends after focus already
moved elsewhere, by pointer or by keyboard, does not pull focus back. After a
keyboard exit the row is the focused element again and shows its focus overlay.

Classic and Rustic do not implement inline cell editing and are unchanged.
Verified in Chromium on the real engine: row focused, `F2`, the editor's
indicator alone, `Escape`, the row's indicator back; also in forced colors.
