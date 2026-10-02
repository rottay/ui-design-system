import {
  AppShell,
  ListSurface,
  surfacePosturesToShellAdapt,
  type EntityAdapter,
  type ListSurfaceConfig,
  type SurfacePostures,
} from "@rottay/design-system";

export const POSTURE_LIST_POSTURES: SurfacePostures = {
  phone: {
    regions: { "column-menu": "hide", "preview-rail": "hide" },
    density: "spacious",
    primaryAction: "bottom-bar",
  },
  tablet: {
    regions: { "preview-rail": "collapse" },
    density: "comfortable",
    primaryAction: "floating",
  },
  desktop: { density: "compact", primaryAction: "app-bar" },
};

type PostureListRow = { id: string; label: string };

const adapter: EntityAdapter<PostureListRow, PostureListRow> = {
  entity: "role",
  version: "1",
  map: (row) => row,
  fields: [{ key: "label", fieldId: "role.label" }],
};

export interface PostureListPageProps {
  rows: readonly PostureListRow[];
  postures?: SurfacePostures;
  onCreate?: () => void;
  actionDisabled?: boolean;
}

export default function PostureListPage({
  rows,
  postures = POSTURE_LIST_POSTURES,
  onCreate,
  actionDisabled,
}: PostureListPageProps) {
  const config: ListSurfaceConfig<PostureListRow> = {
    visual: { allowViewSwitch: false },
    presentation: {
      chrome: { title: "Open roles" },
      toolbarStart: (
        <details>
          <summary>Column menu</summary>
          <p>All columns · Sort · Group</p>
        </details>
      ),
      previewRail: <p>Preview rail body</p>,
    },
    behavior: {
      rowKey: "id",
      columns: [{ key: "label", fieldId: "role.label", header: "Role" }],
      primaryAction: {
        id: "create-role",
        label: "New role",
        onClick: onCreate,
        disabled: actionDisabled,
      },
    },
  };

  return (
    <AppShell
      adapt={surfacePosturesToShellAdapt(postures, "app-shell")}
      sidebar={{
        navigationLabel: "Primary navigation",
        nav: <a href="/roles">Roles</a>,
      }}
    >
      <ListSurface
        data={[...rows]}
        adapter={adapter}
        config={config}
        postures={postures}
      />
    </AppShell>
  );
}
