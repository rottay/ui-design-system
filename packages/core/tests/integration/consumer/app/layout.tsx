/**
 * The root layout of an application on a code-owned vertical.
 *
 * This is the whole server-side theme integration after the WO-CON-02 codemod:
 * ONE call returns the root attributes to stamp and the style elements to
 * emit, and the layout stamps nothing of its own. There is no
 * `resolveDocumentRootAttributes`, no hand-written `data-tenant`/`data-digest`
 * pair, and no second `<style>`; those are the three files
 * (`runtime-tenant-theme/{ssr,contracts,artifact-resolution}`) this call
 * replaces.
 */
import type { ReactNode } from 'react';
import {
  buildThemePrepaintScript,
  mountTenantTheme,
  staticThemeIntent,
  type MountedTenantTheme,
} from '@rottay/design-system/server';

import Providers from './providers';

export interface RootLayoutProps {
  children: ReactNode;
  /** The viewer's declared mode; `auto` stays unresolved for the pre-paint script. */
  themeMode?: 'light' | 'dark' | 'auto';
}

export async function mountVertical(
  themeMode: RootLayoutProps['themeMode'] = 'light',
): Promise<MountedTenantTheme> {
  return mountTenantTheme(staticThemeIntent('bithire'), {
    themeMode,
    autoFallback: 'dark',
    locale: 'en',
  });
}

export default async function RootLayout({ children, themeMode }: RootLayoutProps) {
  const { rootAttributes, styleElements } = await mountVertical(themeMode);
  const { lang, dir, ...scopedRootAttributes } = rootAttributes;

  return (
    <html lang={lang} dir={dir} {...scopedRootAttributes} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: buildThemePrepaintScript() }} />
        {styleElements.map((element) => (
          <style
            key={element.id}
            id={element.id}
            {...element.attributes}
            dangerouslySetInnerHTML={{ __html: element.css }}
          />
        ))}
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
