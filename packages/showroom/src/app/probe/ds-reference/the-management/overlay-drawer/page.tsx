import { OverlayScene } from '../../sections/overlay';
import { JudgeOverlay } from '../../judge';

/**
 * Drawer-only chamber. The combined 'overlay-blocking' route opens the Modal
 * and the Drawer together, but the modal's <dialog> root spans the full
 * viewport at every captured width, so the drawer sits entirely behind it and
 * that capture cannot serve as evidence for the drawer's own material. This
 * route opens the Drawer alone so it is genuinely unoccluded in the image.
 */
export default async function OverlayDrawerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <OverlayScene layer="drawer-only" />
    </>
  );
}
