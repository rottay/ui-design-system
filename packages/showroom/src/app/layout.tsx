import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import '@rottay/design-system/styles.css';
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="showroom-site-body">{children}</body>
    </html>
  );
}
