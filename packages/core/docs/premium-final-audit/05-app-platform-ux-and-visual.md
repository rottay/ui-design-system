# App-Platform UX And Visual Audit

Score: `5.4/10`

## Main judgment

`app-platform` looks more deliberate than before, but it still reads as:

- “serious dark internal tool”

more than:

- “premium, unforgettable, system-level product”

## Why the screenshots still feel weak

### 1. Too many similarly weighted dark surfaces

The dashboard hero, intel cards, ops panels, filter bars, and widget areas all sit in nearly the same material family.

Result:

- texture exists
- composition does not

The eye does not get a clear primary scene.

### 2. Repetition replaced hierarchy

There are too many recurring combinations of:

- dark card
- subtle border
- subtle glow
- subtle grid
- subtle gradient

That creates atmosphere, but not direction.

### 3. Workspace has too many shallow control layers

On the users surface, the stack of:

- header
- search band
- chip band
- filter band
- action band
- table
- preview rail

creates busy correctness, not premium clarity.

### 4. Actions are under-expressed

Small pills and tiny circular row actions make the product feel careful but cheap.

Premium data products usually need:

- clearer primary actions
- stronger selected/focus states
- bolder affordances

## Evidence areas

Dashboard:

- `src/surfaces/dashboard/builder/index.tsx`
- `src/surfaces/dashboard/builder/components/section-panel/index.tsx`
- `src/surfaces/dashboard/builder/components/intel-card/index.tsx`
- `src/surfaces/dashboard/builder/styles.css`

Workspace:

- `src/components/_shared/tables/entity-table-workspace/index.tsx`

Shell feel:

- `src/components/_shared/layouts/app-layout/sidebar/index.tsx`
- `src/components/_shared/layouts/app-layout/topbar/index.tsx`
- `src/components/_shared/global-search/index.tsx`

## Strongest visible area

The widget system is the closest thing to a premium product grammar.

It has:

- a clear modular surface
- credible inspector/focus potential
- better control-room energy than the rest of the app

Key files:

- `src/surfaces/dashboard/widget-grid/index.tsx`
- `src/surfaces/dashboard/widget-shell/index.tsx`

## Premium reset needed

### Dashboard

- define one real focal scene
- reduce simultaneous competing panels
- cut repeated “dark framed card” moves
- create a true importance ladder

### Workspace

- collapse the control stack
- remove local micro-DS button/pill language
- make the identity column and active row states much stronger
- make actions feel deliberate, not hidden

### Shell

- turn search/topbar/sidebar rhythm into a calmer, sharper DS-owned structure
- reduce dev-console/plain-admin vibes

## Visual conclusion

The product is no longer visually careless.

But it is still not premium enough to create the “galactic” impression you are aiming for.

The blocker is mostly:

- hierarchy
- composition
- systemization

not raw effort.

