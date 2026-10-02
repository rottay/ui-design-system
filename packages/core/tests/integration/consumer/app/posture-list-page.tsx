/**
 * A list surface page that composes the surface posture contract the way an
 * app does: the page owns the per-device postures, the DS resolves them.
 *
 * The page renders inside the real AppShell, fed by the same posture
 * declaration through `surfacePosturesToShellAdapt`: the phone posture puts
 * app navigation on a persistent bottom bar, the desktop posture keeps the
 * sidebar track. The phone posture drops the column menu and the preview rail
 * and surfaces a bottom bar instead; the desktop paint keeps the full chrome.
 * Region disposition is resolved on the server from the request's viewport
 * hint, so the phone HTML ships without the hidden regions. The page stays on
 * plain semantics so the server paint does not depend on the engine runtime.
 */
import {
  AppShell,
  SurfaceRegion,
  surfacePosturesToShellAdapt,
  type SurfacePostures,
} from '@rottay/design-system';

export const POSTURE_LIST_POSTURES: SurfacePostures = {
  phone: {
    regions: {
      'column-menu': 'hide',
      'preview-rail': 'hide',
      'bottom-bar': 'render',
    },
    primaryAction: 'bottom-bar',
  },
  desktop: {
    regions: { 'bottom-bar': 'hide' },
    primaryAction: 'app-bar',
  },
};

export interface PostureListPageProps {
  rows: readonly { id: string; label: string }[];
}

export default function PostureListPage({ rows }: PostureListPageProps) {
  return (
    <AppShell
      adapt={surfacePosturesToShellAdapt(POSTURE_LIST_POSTURES, 'app-shell')}
      sidebar={{ navigationLabel: 'Primary navigation', nav: <a href="/roles">Roles</a> }}
    >
      <div data-testid="posture-list-page">
        <h1>Open roles</h1>

        <SurfaceRegion
          name="column-menu"
          postures={POSTURE_LIST_POSTURES}
          label="Column menu"
        >
          <p>All columns · Sort · Group</p>
        </SurfaceRegion>

        <SurfaceRegion name="results" postures={POSTURE_LIST_POSTURES} label="Results">
          <ul data-testid="posture-list-results">
            {rows.map((row) => (
              <li key={row.id}>{row.label}</li>
            ))}
          </ul>
        </SurfaceRegion>

        <SurfaceRegion
          name="preview-rail"
          postures={POSTURE_LIST_POSTURES}
          label="Preview rail"
        >
          <p>Preview rail body</p>
        </SurfaceRegion>

        <SurfaceRegion
          name="bottom-bar"
          postures={POSTURE_LIST_POSTURES}
          label="Record actions"
        >
          <p>New role</p>
        </SurfaceRegion>
      </div>
    </AppShell>
  );
}
