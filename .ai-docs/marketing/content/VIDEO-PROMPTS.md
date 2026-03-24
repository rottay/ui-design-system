# Rottay Video Generation Prompts

> AI prompts for Remotion, Nano Banana, Runway, Pika, and other video generation tools.

---

## Remotion Components (In-House)

### Terminal Typing Effect
```typescript
// Use with Remotion's interpolate and useCurrentFrame
// Location: ui-remotion/src/components/Terminal.tsx

<Terminal
  lines={[
    { type: 'command', text: 'npm install @rottay/auth @rottay/compliance' },
    { type: 'output', text: 'added 3 packages in 2.1s' },
    { type: 'command', text: 'import { makeLoginUseCase } from "@rottay/auth"' },
    { type: 'output', text: '// 83 use cases ready' },
  ]}
  typingSpeed={50}
  cursorBlink={true}
/>
```

### Code Block Animation
```typescript
// Syntax highlighted code with line-by-line reveal
<CodeBlock
  language="typescript"
  code={`import { makeLoginUseCase } from '@rottay/auth';
import { makeGrantConsentUseCase } from '@rottay/compliance';

// 175 use cases. Two imports.`}
  revealMode="line-by-line"
  highlightLines={[1, 2]}
/>
```

### Logo Animation
```typescript
// Bull logo with breathing glow
<RottayLogo
  variant="head"
  animation="breathe"
  glowColor="rgba(184, 115, 51, 0.4)"
  size={200}
/>
```

---

## Nano Banana Prompts

### Scene 1: The Problem (SaaS Chaos)
```
Create a dark tech animation with a 16:9 aspect ratio. Multiple generic tech
company logos (squares, circles, abstract shapes in neon blue, purple, green)
float in 3D space against a pure black background. The logos multiply and
overlap chaotically, creating visual overwhelm. Style: cyberpunk, digital
glitch aesthetic. Camera slowly zooms out revealing the complexity. Subtle
particle effects. Duration: 5 seconds. No text.
```

### Scene 2: The Collapse
```
Continue from previous scene. All floating tech logos begin collapsing toward
a center point. Particle dissolution effect as they merge into light. A bright
white light intensifies at center. From the light, a bull head silhouette
begins to emerge. Style: dramatic, cinematic, clean. The bull has curved horns
with striped texture. Pure black background. Duration: 5 seconds. No text.
```

### Scene 3: Logo Reveal
```
Bull mascot logo centered on pure black background. Clean white vector style
with 8-bit pixel-art sunglasses (the key signature element). The sunglasses
have a pixelated/retro gaming look. Subtle breathing glow animation around
the logo in white or warm copper tone. Lightning bolt decorations on the sides
of the head. Minimal, professional tech aesthetic. Duration: 5 seconds.
```

### Scene 4: Tagline
```
Continuation of bull logo scene. Below the logo, text fades in: "Rottay" in
clean sans-serif font. Then below: "Infrastructure solved." Small breathing
glow continues. Website URL appears: "rottay.com". Pure black background.
White text. Professional, minimal. Duration: 5 seconds.
```

---

## Runway ML Prompts

### Tech Abstract Background
```
Dark abstract technology background. Flowing data streams in white and subtle
copper/bronze tones on pure black. Gentle particle movement. Grid lines fading
into distance. No specific shapes or logos. Loopable. Subtle depth of field.
Cinematic 4K quality. Style: minimal, enterprise tech, sophisticated.
```

### Code Rain Effect
```
Matrix-style code rain but with TypeScript/JavaScript syntax instead of
Japanese characters. White text on black background. Varying opacity levels.
Some lines highlighted in warm copper color. Gentle blur on distant characters.
Professional tech aesthetic, not sci-fi. Loopable background.
```

### Logo Particles
```
White particles flowing and converging to form an abstract bull head shape.
Pure black background. Particles have subtle glow trails. Movement is smooth
and organic. Final shape suggests strength and technology. Copper-tinted
highlights. Duration: 8 seconds.
```

---

## Pika Labs Prompts

### Product Demo Style
```
Screen recording style animation. Dark IDE theme (VS Code style). Code being
typed in real-time. TypeScript syntax highlighting. Import statements from
@rottay packages. Cursor blinking. Professional developer workflow aesthetic.
Split screen showing terminal output. 4K resolution.
```

### Comparison Animation
```
Split screen animation. Left side: chaotic stack of 10 different colored
boxes/logos moving erratically. Right side: single white bull logo, calm and
stable. Visual metaphor for simplification. Pure black background. Clean,
minimal motion graphics style.
```

---

## Luma Dream Machine Prompts

### Abstract Infrastructure
```
3D abstract visualization of modular infrastructure. White geometric blocks
connecting with glowing copper/bronze connection lines on black background.
Blocks represent: Auth, Compliance, Tenancy, Permissions. Smooth camera orbit.
Depth of field. Enterprise technology aesthetic. Not futuristic sci-fi.
```

### Data Flow
```
Abstract visualization of data flowing through a unified system. White streams
converging from multiple sources into one central point (bull head silhouette).
Black background. Copper accent highlights. Smooth, organic movement.
Represents consolidation and simplification.
```

---

## Static Image Prompts (Midjourney, DALL-E, Stable Diffusion)

### Hero Banner Background
```
Dark abstract technology background, pure black (#000000) base, subtle white
grid lines fading to infinity, gentle copper/bronze (#B87333) glow accents,
minimal enterprise aesthetic, no text, no logos, clean and sophisticated,
8K resolution, suitable for website hero banner
```

### Social Media Card Background
```
Dark minimal tech background, pure black with subtle texture, abstract
geometric patterns in very dark gray (#171717), single copper accent line,
professional enterprise aesthetic, landscape 1200x630 for Open Graph
```

### Documentation Header
```
Ultra minimal dark header background, pure black, subtle horizontal lines in
dark gray, single subtle copper gradient on left edge, developer documentation
aesthetic, clean and professional, 1920x400
```

---

## Video Specifications

### Home Banner (Priority)
- **Dimensions:** 1920x540
- **Duration:** 40 seconds
- **FPS:** 30
- **Format:** MP4 (H.264) + WebM
- **File size target:** < 10MB

### Social Media
- **Twitter/X:** 1280x720, 15-30 seconds
- **LinkedIn:** 1920x1080, 30-60 seconds
- **Instagram:** 1080x1080, 15-30 seconds

### Product Demo
- **Dimensions:** 1920x1080
- **Duration:** 60-120 seconds
- **FPS:** 60
- **Format:** MP4 (H.264)

---

## Audio/Music Direction

### Style
- Minimal electronic
- Dark, sophisticated
- Subtle bass
- No vocals
- Professional tech vibe

### Reference Tracks
- Carbon Based Lifeforms (ambient)
- Tycho (electronic)
- Boards of Canada (minimal)

### Sound Effects
- Subtle UI clicks
- Soft whoosh transitions
- Terminal typing sounds (optional)
- No aggressive sounds

---

## Color Reference for All Prompts

| Color | Hex | Usage |
|-------|-----|-------|
| Background | #000000 | Primary background |
| Text | #FFFFFF | Primary text, logo |
| Copper | #B87333 | Accent, glow |
| Copper Light | #CD8B4A | Highlights |
| Copper Glow | rgba(184,115,51,0.4) | Glow effects |
| Gray | #171717 | Subtle textures |
| Gray Light | #262626 | Secondary elements |

---

## Logo Usage in Videos

### DO
- Always place on black or very dark background
- Maintain 20% clear space on all sides
- Use breathing glow for animation
- Preserve pixel sunglasses exactly
- Scale proportionally

### DON'T
- Place on light or colored backgrounds
- Animate the sunglasses separately
- Rotate or skew the logo
- Add effects that obscure the pixel sunglasses
- Use as a small corner watermark (use text "Rottay" instead)
