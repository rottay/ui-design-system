import { PrimitiveStateRepairScene, type PrimitiveStateRepairCase } from '../../sections/primitive-state-repairs';
import { JudgeOverlay } from '../../judge';

const CASES: PrimitiveStateRepairCase[] = [
  'image-fallback',
  'toast-live-region',
  'tour-dialog-name',
  'notification-nested-controls',
  'callout-dismiss-focus',
  'card-cover-error',
  'codeblock-copy',
  'pagination-reveal',
  'taginput-paste',
  'colorpicker-hover',
  'slider-value-semantics',
  'upload-drop-constraints',
  'autocomplete-disabled-rows',
  'cascader-controlled-reset',
  'mentions-active-option',
  'select-id-forwarding',
  'form-touched',
];

export default async function PrimitiveStateRepairsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as PrimitiveStateRepairCase) : 'image-fallback';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <PrimitiveStateRepairScene only={only} />
    </>
  );
}
