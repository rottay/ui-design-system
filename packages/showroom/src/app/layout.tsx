import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@rottay/design-system/styles.css';
// Optional, code-owned font pack used by customer Appearance artifacts. The
// tenant DB may select only its stable CSS-variable handle; it never owns a
// font URL or @font-face declaration.
import '@rottay/design-system/fonts/editorial-display.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Rottay Design System Docs',
    template: '%s · Rottay Design System Docs',
  },
  description:
    'Documentation and reference hub for the Rottay Design System: multi-engine rendering, tenant-aware theming, and a four-tier architecture from primitives to surfaces.',
  applicationName: 'Rottay Design System',
  keywords: [
    'design system',
    'component docs',
    'multi-engine UI',
    'tenant theming',
    'component library',
    'documentation',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Probe routes stamp the tenant's governed root attributes from a
    // first-in-body script, so `<html>` legitimately differs from this static
    // element by the time React hydrates. `suppressHydrationWarning` is a
    // React-only prop and is never serialized, so the served HTML is unchanged.
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="showroom-site-body">{children}</body>
    </html>
  );
}
