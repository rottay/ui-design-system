/**
 * Ref-counted scroll lock across two overlay families (WO-CAN-05, F-21 probe).
 *
 * The reported defect: Drawer and Modal each snapshotted and restored
 * `document.body.style.overflow` privately while AlertDialog used the shared
 * refcount, so closing an alert-dialog stacked over an OPEN drawer restored
 * the overflow value the dialog had captured and the page behind the drawer
 * became scrollable again. Both families now take the kernel's lock, so the
 * count -- not the last closer -- decides.
 */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernDrawer from '../../../../feedback/drawer/engines/modern';
import ModernAlertDialog from '../../../../overlay/alert-dialog/engines/modern';
import { getScrollLockCount } from '../../layer-stack';

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

function Stack({ drawer, dialog }: { drawer: boolean; dialog: boolean }): React.ReactElement {
  return (
    <>
      <ModernDrawer open={drawer} onClose={() => {}} title="Drawer">
        drawer body
      </ModernDrawer>
      <ModernAlertDialog
        open={dialog}
        onOpenChange={() => {}}
        title="Confirm"
        description="Are you sure?"
      />
    </>
  );
}

describe('overlay kernel scroll lock', () => {
  it('keeps the page locked while a lower drawer is still open', () => {
    const { rerender } = render(<Stack drawer={false} dialog={false} />);
    expect(getScrollLockCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');

    rerender(<Stack drawer dialog={false} />);
    expect(getScrollLockCount()).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');

    // An alert-dialog stacks on top of the open drawer.
    rerender(<Stack drawer dialog />);
    expect(getScrollLockCount()).toBe(2);
    expect(document.body.style.overflow).toBe('hidden');

    // Closing ONLY the dialog must not hand the page back: this is the exact
    // regression F-21 reproduced.
    rerender(<Stack drawer dialog={false} />);
    expect(getScrollLockCount()).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');

    // The last holder releases it.
    rerender(<Stack drawer={false} dialog={false} />);
    expect(getScrollLockCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });

  it('restores the page after the whole stack unmounts', () => {
    const { unmount } = render(<Stack drawer dialog />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(getScrollLockCount()).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });
});
