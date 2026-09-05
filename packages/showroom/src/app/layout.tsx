import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { mountTenantTheme, staticThemeIntent } from '@rottay/design-system/server';
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

/**
 * The showroom is a Rottay-vertical consumer, and it mounts its identity the
 * way the consumer contract says an application does: ONE call, whose result is
 * the only source of the root scope and of any style element in the document.
 *
 * `styleElements` is empty for a code-owned vertical -- the compiled artifact
 * ships inside `@rottay/design-system/styles.css`, imported above -- but the
 * layout still renders whatever the call returns rather than assuming that,
 * because assuming it is how a second, hand-rolled mount path grows back.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { rootAttributes, styleElements } = await mountTenantTheme(
    staticThemeIntent('rottay'),
  );
  // `lang`/`dir` are pulled out of the SAME projection rather than spread, so
  // `jsx-a11y/html-has-lang` can prove the language is set.
  const { lang, dir, ...rootScope } = rootAttributes;

  return (
    // Probe routes stamp the tenant's governed root attributes from a
    // first-in-body script, so `<html>` legitimately differs from this element
    // by the time React hydrates. `suppressHydrationWarning` is a React-only
    // prop and is never serialized, so the served HTML is unchanged.
    <html
      lang={lang}
      dir={dir}
      {...rootScope}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {styleElements.map((element) => (
          <style
            key={element.id}
            {...element.attributes}
            dangerouslySetInnerHTML={{ __html: element.css }}
          />
        ))}
      </head>
      <body className="showroom-site-body">{children}</body>
    </html>
  );
}
