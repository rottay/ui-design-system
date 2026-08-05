import { SurfacesLongTailFixture } from '@/components/surfaces-long-tail-fixture';
import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { readQueryValue } from '@/components/torture-tenant';
import { TortureFrame } from '@/components/torture-sections/frame';
import { TORTURE_SECTION_FLAGS } from '@/components/torture-sections/registry';
import { InteractiveCards } from '@/components/torture-sections/interactive';
import { TableStates } from '@/components/torture-sections/table-states';
import { FieldFiltersStates } from '@/components/torture-sections/field-filters';
import { FilterPanelStates } from '@/components/torture-sections/filter-panel';
import { RailStates } from '@/components/torture-sections/rail';
import { DetailPanelStates } from '@/components/torture-sections/detail-panel';
import { DataTableStates } from '@/components/torture-sections/data-table';
import { FieldsStates } from '@/components/torture-sections/fields';
import { DropdownsStates } from '@/components/torture-sections/dropdowns';
import { PickersStates } from '@/components/torture-sections/pickers';
import { StatusFbStates } from '@/components/torture-sections/status-feedback';
import { OverlayFbStates } from '@/components/torture-sections/overlay-feedback';
import { OverlayStates } from '@/components/torture-sections/overlay';
import { NavFbStates } from '@/components/torture-sections/nav';
import { Display1States } from '@/components/torture-sections/display-1';
import { Display2States } from '@/components/torture-sections/display-2';
import { LayoutStates } from '@/components/torture-sections/layout';
import { FormsFbStates } from '@/components/torture-sections/forms';
import { RecordFbStates } from '@/components/torture-sections/record';
import { HeadersFbStates } from '@/components/torture-sections/headers';
import { HeadersPatternsFbStates } from '@/components/torture-sections/headers-patterns';
import { NavigationPatternsFbStates } from '@/components/torture-sections/navigation-patterns';
import { DashboardWidgetsStates } from '@/components/torture-sections/dashboard';
import { CommunicationFbStates } from '@/components/torture-sections/communication';
import { WorkspaceChromeFbStates } from '@/components/torture-sections/workspace-chrome';
import { MiscH2FbStates } from '@/components/torture-sections/misc-h2';
import { CkH1States } from '@/components/torture-sections/ck-h1';
import { CkEStates } from '@/components/torture-sections/ck-e';

// ---------------------------------------------------------------------------
// Whitelabel torture probe (WO-GAT-03 hostile-tenant whitelabel proof)
//
// Chrome-free capture route so a screenshot is pure component evidence. One
// fixture per load -- tenant, theme, and text direction are all html-anchored
// (see components/torture-surface), so there is no side-by-side comparison,
// only repeat loads driven by query params:
//   ?fixture=torture-dark|torture-light|rottay|bithire|evnto|themanagementmiami
//                                                 which fixture owns the page (default torture-dark)
//   ?engine=modern|rustic|classic                which engine renders (default modern)
//   ?rtl=1                                       Arabic locale + RTL proof block
//   ?slug=button                                 capture a single flagship in isolation
//   ?w=360|768|1280                              fixed content width for the responsive law
//   ?longTail=1                                  CK-I surface long-tail evidence
//   ?tenantSource=canonical-db                   themanagementmiami from the published document
//
// torture-dark and torture-light compile their CSS at render via the dynamic
// tenant path and are never registered as product tenants or build artifacts.
// ?fixture=rottay is the REFERENCE load the differential probe compares
// against, and it stays structurally identical to the torture loads (same
// provider, same layout, same slugs) so any visual delta is attributable to
// the tenant alone. ?fixture=bithire and ?fixture=themanagementmiami render
// the bithire vertical's two real tenants for sighted side-by-side review
// (WO-ENG-20) using this same flagship set and capture width, not the
// differential violation count.
//
// The route reads its query on the SERVER. That is what makes the first
// painted frame the tenant's: `TortureFirstPaint` stamps the governed root
// attributes (and, on the compiled-DB path, embeds the artifact CSS) ahead of
// the ground element, and reading a dynamic request API is also what keeps the
// gallery out of the static-prerender bailout that served an empty body.
//
// Every section below is gated by its own flag and they compose freely, so one
// load can stack any subset. Scene routes under ./scenes render fixed subsets
// as their own build entries; this route stays the query-driven surface the
// e2e specs address.
// ---------------------------------------------------------------------------

export default async function WhitelabelTorturePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;
  const active = new Set(
    TORTURE_SECTION_FLAGS.filter((flag) => readQueryValue(query, flag) === '1'),
  );

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        {active.has('interactive') && <InteractiveCards />}
        {active.has('tablestates') && <TableStates />}
        {active.has('fieldfilters') && <FieldFiltersStates />}
        {active.has('filterpanel') && <FilterPanelStates />}
        {active.has('rail') && <RailStates />}
        {active.has('detailpanel') && <DetailPanelStates />}
        {active.has('datatable') && <DataTableStates />}
        {active.has('fields') && <FieldsStates />}
        {active.has('dropdowns') && <DropdownsStates />}
        {active.has('pickers') && <PickersStates />}
        {active.has('statusfb') && <StatusFbStates />}
        {active.has('overlayfb') && <OverlayFbStates />}
        {active.has('overlay') && <OverlayStates />}
        {active.has('nav') && <NavFbStates />}
        {active.has('display1') && <Display1States />}
        {active.has('display2') && <Display2States />}
        {active.has('layout') && <LayoutStates />}
        {active.has('forms') && <FormsFbStates />}
        {active.has('record') && <RecordFbStates />}
        {active.has('headers') && <HeadersFbStates />}
        {active.has('headers-patterns') && <HeadersPatternsFbStates />}
        {active.has('navigation') && <NavigationPatternsFbStates />}
        {active.has('dashboard') && <DashboardWidgetsStates />}
        {active.has('communication') && <CommunicationFbStates />}
        {active.has('workspace') && <WorkspaceChromeFbStates />}
        {active.has('miscH2') && <MiscH2FbStates />}
        {active.has('ckH1') && <CkH1States />}
        {active.has('ckE') && <CkEStates />}
        {active.has('longTail') && <SurfacesLongTailFixture />}
      </TortureFrame>
    </>
  );
}
