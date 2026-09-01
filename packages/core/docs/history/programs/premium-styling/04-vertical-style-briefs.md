# Vertical Style Briefs

Wave H4 deliverable. Implementation-grade briefs for each first-party
vertical theme. These describe mood, direction, and token implications —
not exact hex values (those belong in the authored source files).

## Cross-Brand Rules

The three brands are siblings inside one system:

- Same premium contract (see `03-premium-contract-parity.md`)
- Same token language (`--ds-*`)
- Same accessibility bar
- Different emotional signatures

Target split:

- **Rottay** = dark technical command center
- **BitHire** = trusted recruiting workspace
- **Evnto** = premium wallet experience

---

## Rottay

### Emotional Brief

AI software, security-adjacent, dark, sober, technical, premium.

### References

- Anthropic, OpenAI, CrowdStrike, Vercel

### Target Feel

- Black graphite environments
- Sharp hierarchy
- Disciplined motion
- High trust
- Controlled technical edge

### What Must Change

- Reduce purple/teal SaaS energy
- Reduce "generic startup gradient" feeling
- Strengthen shell and layout as part of identity
- Make controls feel more tool-like and less app-generic

### Palette Direction

- Primary canvas: near-black
- Secondary surfaces: graphite and steel
- Accents: restrained cobalt and icy cyan
- Text: crisp off-white
- Status tones: serious and muted, not candy-bright

### Typography Direction

- Strong sans + mono pairing
- Denser headings
- Mono used in data, system states, audit surfaces, operational chrome

### Motion Direction

- Expressive but controlled
- Spring is acceptable if it feels disciplined
- No playful bounce
- Reveals should feel deliberate and high-confidence

### Chrome Direction

- Sidebar as command surface
- Header as translucent graphite slab
- Shell/grid subtle and infrastructural
- Cards low-gloss, serious, premium

### Controls Direction

- Slightly sharper corners than the other brands
- High contrast
- Decisive hover/focus states
- Premium but austere

### Gap Closure (from H3)

- Add semantic colors (success/warning/error/info) — serious, muted tones
- Add surfaces (borderRadius, shadows) — sharp and restrained
- Add surfaces philosophy: glass=none, gradients=none, overlays=subtle
- Add input treatment
- Author dark-mode chrome (rottay IS dark-first)
- Author state semantics

---

## BitHire

### Emotional Brief

Recruiting, trustworthy, polished, professional, human-centered.

### References

- LinkedIn brand (adjacent, not clone), Greenhouse, Ashby

LinkedIn explicitly discourages imitation. BitHire should be
LinkedIn-adjacent in trust and professionalism, not a visual clone.

### Target Feel

- LinkedIn-adjacent trust
- Cleaner and softer than classic enterprise software
- Data-dense without looking harsh

### What Must Change

- Deepen the premium layer without cloning LinkedIn
- Soften the current corporate stiffness
- Give sidebar, table, cards, and forms more authored personality

### Palette Direction

- Keep a blue family close to `#0A66C2`
- Support with deeper blue and structured neutrals
- Restrained green for success/hiring momentum

### Typography Direction

- Clean sans
- Efficient hierarchy
- Less unnecessary uppercase
- Stronger readability for long lists and tables

### Motion Direction

- Low amplitude
- Fast fades and short slides
- Almost no bounce
- Motion should communicate reliability

### Chrome Direction

- Softer radii than classic enterprise
- Crisp, trustworthy tables
- Subtle but premium card elevation
- Sidebar with better rhythm and sectioning

### Controls Direction

- Refined, not flashy
- Focus and states should feel polished and mature
- Forms should feel calm and data-friendly

### Gap Closure (from H3)

- Add surfaces (borderRadius, shadows) — soft and structured
- Add surfaces philosophy: glass=none, gradients=none, overlays=subtle
- Add layout chrome (6 fields) — clean, structured header/sider
- Add shell chrome (3 fields) — minimal or intentional "none"
- Add buttonDefault, buttonGhost, buttonPrimary.border/shadow
- Author dark-mode chrome
- Author state semantics

---

## Evnto

### Emotional Brief

Virtual wallet / money movement / premium fintech.

### References

- Cash App, PayPal Digital Wallet, Brex, Apple Wallet

### Target Feel

- White-first
- Black-first text
- Rounded
- Fluid
- Safe
- Modern

### What Must Change

- Move away from the current beige/editorial warmth
- Become more clearly wallet/fintech
- Strengthen card/object feeling
- Improve motion polish

### Palette Direction

- White and cool grays for base
- Deep charcoal for text and core actions
- Restrained financial accent, likely green
- Optional subtle tech accent used sparingly

### Typography Direction

- Clean sans
- Excellent numeric typography
- More breathing room than BitHire

### Motion Direction

- Smooth, reassuring transitions
- Soft but premium spring
- Polished loading and settlement behavior

### Chrome Direction

- Largest radii of the three brands
- Lighter shell and navigation feel
- More card-stack logic
- Softer shadows and more tactile containers

### Controls Direction

- High clarity
- Soft curves
- Excellent money-state feedback
- More consumer-fintech than enterprise-admin

### Gap Closure (from H3)

- Add semantic colors — financial-appropriate (green success, warm error)
- Add surfaces (shadows) — soft and tactile
- Add surfaces philosophy: glass=subtle, gradients=none, overlays=soft
- Add layout chrome (6 fields) — light, breathing, minimal
- Add shell chrome (3 fields) — minimal or intentional "none"
- Add buttonDefault, buttonGhost, buttonPrimary.border/shadow
- Add table metadata (headerColor, headerFontWeight, headerFontSize)
- Author dark-mode chrome
- Author state semantics
