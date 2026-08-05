import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { TableStates } from '@/components/torture-sections/table-states';
import { FilterPanelStates } from '@/components/torture-sections/filter-panel';
import { RailStates } from '@/components/torture-sections/rail';
import { DetailPanelStates } from '@/components/torture-sections/detail-panel';
import { DataTableStates } from '@/components/torture-sections/data-table';
import { HeadersFbStates } from '@/components/torture-sections/headers';
import { HeadersPatternsFbStates } from '@/components/torture-sections/headers-patterns';

export default async function DataScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <TableStates />
        <FilterPanelStates />
        <RailStates />
        <DetailPanelStates />
        <DataTableStates />
        <HeadersFbStates />
        <HeadersPatternsFbStates />
      </TortureFrame>
    </>
  );
}
