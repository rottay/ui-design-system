# Table ownership

`Table` and `PatternDataTable` are not interchangeable APIs.

## `Table` primitive

Use `Table` for a self-contained tabular document inside a component: a report,
comparison matrix, summary, or embedded read/edit grid. It owns table semantics
and local cell mechanics. It must not grow product toolbar, bulk workflow,
mobile-card, cross-route filter, or collection-workspace responsibilities.

## `PatternDataTable`

Use `PatternDataTable` for an operational collection surface. It owns:

- product toolbar and canonical `FilterPanel` composition;
- controlled selection and bulk workflow;
- responsive column priority and mobile-card projection;
- operational empty, loading, error, pagination and row-action postures;
- finite information recipes (`minimal`, `ruled`, `grid`, `zebra`,
  `editorial`);
- grouped, virtualized and inline-edit orchestration.

The pattern may reuse primitive contracts, but applications must not compose a
primitive `Table` plus route CSS to reconstruct the pattern. Conversely, the
primitive must not import `PatternDataTable` or its workflow slots.

## Styling authority

Applications choose data, columns, slots and a bounded recipe. Design-system
semantic materials, typography, density and motion own chrome. Tenant anatomy
tokens remain authoritative over local recipe paint, which lets the same
markup become sober, editorial, dense or soft without app selectors.
