# Home Banner 40-Second Script

> Detailed frame-by-frame script for the priority marketing video.

---

## Video Specifications

| Property | Value |
|----------|-------|
| **Dimensions** | 1920x540 |
| **Duration** | 40 seconds |
| **FPS** | 30 |
| **Total Frames** | 1,200 |
| **Format** | MP4 (H.264) + WebM |
| **Target Size** | < 10MB |

---

## Stage 1: The Problem (0-10s / Frames 0-300)

### Visual Description
Multiple SaaS company logos floating chaotically in 3D space against pure black background.

### Frame Breakdown

| Time | Frames | Visual | Text |
|------|--------|--------|------|
| 0:00-0:02 | 0-60 | Black screen, subtle particles appear | - |
| 0:02-0:04 | 60-120 | First 3 logos fade in (Auth0, Vanta, LaunchDarkly style) | - |
| 0:04-0:06 | 120-180 | 4 more logos appear, start gentle floating motion | "10 SaaS." |
| 0:06-0:08 | 180-240 | Logos multiply (x2), movement becomes more chaotic | "10 SDKs." |
| 0:08-0:10 | 240-300 | Full chaos - 10+ overlapping logos, visual overwhelm | "10 invoices." |

### Animation Notes
- Logos are generic tech shapes (rounded squares, circles)
- Colors: Neon blue (#3b82f6), purple (#c792ea), green (#22c55e)
- Each logo has subtle glow matching its color
- Movement: Gentle float transitioning to chaotic overlap
- Camera: Slow zoom out to reveal complexity

### Audio
- Subtle electronic ambient bed
- Building tension with added layers

---

## Stage 2: The Solution (10-20s / Frames 300-600)

### Visual Description
All logos collapse and converge into the Rottay bull logo.

### Frame Breakdown

| Time | Frames | Visual | Text |
|------|--------|--------|------|
| 0:10-0:12 | 300-360 | Logos pause, then start moving toward center | "Sound familiar?" |
| 0:12-0:14 | 360-420 | Logos accelerate inward, begin dissolving into particles | - |
| 0:14-0:16 | 420-480 | Bright white light at center, particle vortex | "What if there was one platform?" |
| 0:16-0:18 | 480-540 | Light fades, bull head silhouette emerges | - |
| 0:18-0:20 | 540-600 | Bull logo fully formed with pixel sunglasses, subtle glow | "1,000+ use cases. 15+ modules." |

### Animation Notes
- Collapse effect: Each logo breaks into particles before merging
- Central light: Pure white (#FFFFFF) with soft glow
- Bull reveal: Fade in from light, sunglasses visible immediately
- Final position: Bull logo centered, copper glow aura

### Audio
- Impact sound at collapse moment (0:12)
- Resolving chord as logo forms
- Tension releases into calm

---

## Stage 3: The Proof (20-32s / Frames 600-960)

### Visual Description
Terminal/code editor showing real Rottay imports with typewriter effect.

### Frame Breakdown

| Time | Frames | Visual | Text |
|------|--------|--------|------|
| 0:20-0:22 | 600-660 | Terminal window appears, cursor blinking | - |
| 0:22-0:24 | 660-720 | Types: `import { makeLoginUseCase } from '@rottay/auth'` | - |
| 0:24-0:26 | 720-780 | Types: `import { makeGrantConsentUseCase } from '@rottay/compliance'` | - |
| 0:26-0:28 | 780-840 | Types: `import { makeCreateTenantUseCase } from '@rottay/tenancy'` | - |
| 0:28-0:30 | 840-900 | Pause, then comment types: `// 200+ use cases. Three imports.` | - |
| 0:30-0:32 | 900-960 | Code highlights, badge appears: "Auth. Compliance. Tenancy. One SDK." | Badge text |

### Terminal Styling
```css
background: #0a0a0a;
border: 1px solid #262626;
font-family: 'Geist Mono', 'JetBrains Mono', monospace;
font-size: 18px;

/* Syntax Highlighting */
keyword: #c792ea;   /* import, from */
string: #c3e88d;    /* '@rottay/auth' */
function: #82aaff;  /* makeLoginUseCase */
comment: #737373;   /* // 225 use cases */
```

### Code Content
```typescript
import { makeLoginUseCase } from '@rottay/auth'
import { makeGrantConsentUseCase } from '@rottay/compliance'
import { makeCreateTenantUseCase } from '@rottay/tenancy'

// 80+ auth. 90+ compliance. 50+ tenancy. Three imports.
```

### Animation Notes
- Typewriter speed: 50ms per character
- Line delay: 300ms between lines
- Cursor: Blinking at 530ms interval
- Comment types slower for emphasis

### Audio
- Subtle keyboard typing sounds (optional)
- Soft "completion" sound when comment finishes

---

## Stage 4: The CTA (32-40s / Frames 960-1200)

### Visual Description
Bull logo with breathing glow, brand name, and tagline.

### Frame Breakdown

| Time | Frames | Visual | Text |
|------|--------|--------|------|
| 0:32-0:34 | 960-1020 | Terminal fades out, bull logo centers | - |
| 0:34-0:36 | 1020-1080 | "Rottay" text fades in below logo | "Rottay" |
| 0:36-0:38 | 1080-1140 | Tagline fades in below | "Infrastructure solved." |
| 0:38-0:40 | 1140-1200 | URL appears, subtle glow intensifies | "rottay.com" |

### Layout (1920x540)
```
+--------------------------------------------------+
|                                                  |
|                   [BULL LOGO]                    |
|                     200x200                      |
|                                                  |
|                     Rottay                       |
|              Infrastructure solved.              |
|                   rottay.com                     |
|                                                  |
+--------------------------------------------------+
```

### Typography
```css
/* Logo */
.logo {
  width: 200px;
  height: 200px;
  filter: drop-shadow(0 0 40px rgba(255, 255, 255, 0.2));
}

/* Brand Name */
.brand {
  font-family: 'Geist', sans-serif;
  font-size: 48px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
}

/* Tagline */
.tagline {
  font-family: 'Geist', sans-serif;
  font-size: 24px;
  font-weight: 400;
  color: #a3a3a3;
}

/* URL */
.url {
  font-family: 'Geist Mono', monospace;
  font-size: 18px;
  color: #737373;
}
```

### Animation Notes
- Breathing glow: 3 second cycle, 10% scale variation
- Glow color: White with subtle copper tint
- Text fade in: 500ms each, staggered by 300ms
- Final frame: Hold for 2 seconds

### Audio
- Resolving ambient pad
- Subtle brand sound signature (optional)
- Fade out over last 2 seconds

---

## Technical Implementation (Remotion)

### File Structure
```
ui-remotion/src/videos/
  HomeBanner40s/
    index.tsx           # Main composition
    Stage1Problem.tsx   # 0-10s
    Stage2Solution.tsx  # 10-20s
    Stage3Proof.tsx     # 20-32s
    Stage4CTA.tsx       # 32-40s
    styles.ts           # Shared styles
```

### Main Composition
```typescript
import { Composition } from 'remotion';

export const HomeBanner40s: React.FC = () => {
  return (
    <Composition
      id="HomeBanner40s"
      component={HomeBannerVideo}
      durationInFrames={1200}
      fps={30}
      width={1920}
      height={540}
    />
  );
};
```

### Stage Sequence
```typescript
import { Sequence } from 'remotion';

export const HomeBannerVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Stage 1: The Problem (0-300 frames) */}
      <Sequence from={0} durationInFrames={300}>
        <Stage1Problem />
      </Sequence>

      {/* Stage 2: The Solution (300-600 frames) */}
      <Sequence from={300} durationInFrames={300}>
        <Stage2Solution />
      </Sequence>

      {/* Stage 3: The Proof (600-960 frames) */}
      <Sequence from={600} durationInFrames={360}>
        <Stage3Proof />
      </Sequence>

      {/* Stage 4: The CTA (960-1200 frames) */}
      <Sequence from={960} durationInFrames={240}>
        <Stage4CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
```

---

## Export Settings

### MP4 (H.264)
```bash
npx remotion render HomeBanner40s out/home-banner.mp4 \
  --codec=h264 \
  --crf=18 \
  --pixel-format=yuv420p
```

### WebM
```bash
npx remotion render HomeBanner40s out/home-banner.webm \
  --codec=vp8 \
  --crf=15
```

### GIF (Preview)
```bash
npx remotion render HomeBanner40s out/home-banner.gif \
  --frames=0-120 \
  --scale=0.5
```

---

## Checklist

- [ ] Stage 1: SaaS logos animated and readable
- [ ] Stage 2: Collapse effect smooth, logo clearly visible
- [ ] Stage 3: Code syntax highlighting correct, typing speed comfortable
- [ ] Stage 4: All text legible, breathing glow subtle
- [ ] Audio: Synced to visual beats
- [ ] Export: Both MP4 and WebM under 10MB
- [ ] Accessibility: Contrast ratios meet WCAG AA
