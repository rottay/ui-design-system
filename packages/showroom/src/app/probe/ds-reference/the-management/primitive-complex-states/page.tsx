import { PrimitiveComplexStateScene, type PrimitiveComplexStateCase } from '../../sections/primitive-complex-states';
import { JudgeOverlay } from '../../judge';

const CASES: PrimitiveComplexStateCase[] = [
  'timeline-track-collapse',
  'calendar-controlled-panel',
  'descriptions-responsive-columns',
  'list-loading-continuity',
  'switch-busy-tab-stop',
  'contextmenu-submenu-focus',
  'popconfirm-disclosure-toggle',
  'affix-container-edge',
  'anchor-confined-jump',
  'breadcrumb-trail-parking',
  'modal-describedby-merge',
  'treeselect-cleared-placeholder',
  'inputnumber-typing-draft',
  'passwordinput-filled-state',
  'dropdown-stacked-escape',
  'backtop-duration',
  'floatbutton-disclosure',
  'stepper-content-panels',
  'steps-status-name',
];

export default async function PrimitiveComplexStatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '')
    ? (raw as PrimitiveComplexStateCase)
    : 'timeline-track-collapse';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <PrimitiveComplexStateScene only={only} />
    </>
  );
}
