---
"@rottay/design-system": patch
---

The generated root-alias table, the three vertical facade artifacts and the
four vertical CSS bundles are produced again from freshly extracted cascade
edges. The committed table had been rendered from a superseded edges artifact
over moved CSS, so aliases whose declaration lines had shifted carried another
declaration's text, some of them raw CSS fragments, and a tenant scope that
states their operands restated those wrong texts. The official producers now
run in order: the cascade edges are extracted first, the table is rendered
from them, the vertical facade artifacts are built from that table, and the
table is rendered last against those artifacts; the four bundles carry the
same facade text. The generators are unchanged.

In the table, 14 command-home aliases get their own root text back, three that
were missing (`--ds-command-home-card-bg`, `--ds-command-home-meter-bg`,
`--ds-command-home-meter-fill`) return, and the DS root's mode texts are
tabled again for 193 names. The verticals no longer list command-home aliases
as stated outright on their own element when they are not, so a tenant scope
restates them with the root text. `--ds-command-home-panel-bg-strong`, whose
emission was already retired, is the one row that leaves the table, so a tenant
theme artifact that restated it now restates one alias fewer.
