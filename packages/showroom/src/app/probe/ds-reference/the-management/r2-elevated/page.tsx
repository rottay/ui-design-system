import { R2ElevatedScene, type R2ElevatedCase } from '../../sections/r2-elevated';
import { JudgeOverlay } from '../../judge';

const CASES: R2ElevatedCase[] = [
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

export default async function R2ElevatedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '')
    ? (raw as R2ElevatedCase)
    : 'timeline-track-collapse';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <R2ElevatedScene only={only} />
    </>
  );
}
