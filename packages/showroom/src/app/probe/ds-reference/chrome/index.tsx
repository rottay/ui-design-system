/**
 * Lab furniture. TENANT-BLIND BY CONSTRUCTION.
 *
 * The furniture must never name the tenant on canvas. R1 requires proving
 * three-second tenant RECOGNITION in grayscale and with the primary hue
 * neutralized; a caption reading "BitHire" hands the judge the answer and
 * silently destroys that test. The older probe's heading literally read
 * "Whitelabel torture — bithire", which is why its captures cannot serve as
 * recognition evidence.
 *
 * Tenant identity lives in the URL and in the capture receipt. Nothing here
 * accepts a tenant prop, so the rule is enforced by the type signature rather
 * than by reviewer vigilance.
 *
 * The furniture is also deliberately UNSTYLED beyond neutral layout: it must
 * not contribute visual character that could be mistaken for the tenant's.
 */

import type { ReactNode } from 'react';

export function SceneFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main
      data-testid="lab-scene"
      style={{
        minHeight: '100dvh',
        background: 'var(--ds-color-bg-primary)',
        color: 'var(--ds-color-text-primary)',
        padding: 'clamp(12px, 3vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(20px, 4vw, 40px)',
      }}
    >
      <h1
        style={{
          font: 'inherit',
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.45,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {children}
    </main>
  );
}

/** One judged band inside a scene. The caption names the AXIS, never the tenant. */
export function SpecimenRow({ axis, children }: { axis: string; children: ReactNode }) {
  return (
    <section data-testid="lab-specimen-row" data-axis={axis} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AxisCaption>{axis}</AxisCaption>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'clamp(8px, 1.5vw, 16px)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function AxisCaption({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        font: 'inherit',
        fontSize: '0.625rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        opacity: 0.35,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

/**
 * The composition vignette wrapper. Premium is judged in rhythm, not in
 * specimen rows, so every scene ends with the group doing real work in
 * realistic neutral content.
 */
export function Vignette({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section data-testid="lab-vignette" data-vignette={label} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AxisCaption>composition — {label}</AxisCaption>
      {children}
    </section>
  );
}

/**
 * Content torture. The strings are the objective, not decoration: R1 requires
 * proving no overlap, no clipping, no per-character wrap and no accidental
 * desktop compression. Arabic exercises RTL; the unbroken token is the
 * per-character-wrap trap.
 */
export const TORTURE_CONTENT = {
  longLabel: 'Review and approve the outstanding submissions for this quarter',
  spanish: 'Revisar y aprobar las solicitudes pendientes del trimestre en curso',
  arabic: 'مراجعة واعتماد الطلبات المعلقة لهذا الربع من السنة المالية الحالية',
  unbroken: 'Reconciliation_2026Q3_FINAL_v4_approved_by_committee_long_token',
} as const;
