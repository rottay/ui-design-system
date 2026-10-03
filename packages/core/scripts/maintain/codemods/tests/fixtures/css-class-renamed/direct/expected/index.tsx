import { AppShell } from '@rottay/design-system';

// .rottay-app-shell__main in a comment is not a string.
export const selector = '.rottay-app-shell[data-part="root"]';
export const template = `${'x'} .rottay-action-dock__actions`;

export function Shell() {
  return (
    <AppShell className="rottay-app-shell__main tall">
      <div className="rottay-app-shell__content">content</div>
    </AppShell>
  );
}
