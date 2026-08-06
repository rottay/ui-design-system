import { R2BehaviorScene, type R2BehaviorCase } from '../../sections/r2-behavior';
import { JudgeOverlay } from '../../judge';

const CASES: R2BehaviorCase[] = [
  'datepicker',
  'timepicker',
  'tabs',
  'stepper',
  'upload',
  'splitter',
  'textarea',
  'radio',
  'checkbox',
  'toggle',
  'inputnumber',
  'passwordinput',
  'mentions',
  'otpinput',
  'collapse',
  'backtop',
  'floatbutton',
  'switch',
  'scrollarea',
  'breadcrumb',
  'anchor',
  'formfield',
  'layout',
  'rate',
  'affix',
  'result',
  'link',
  'segmented',
  'popover',
  'drawer',
  'skeleton',
  'form',
  'watermark',
  'alert',
  'input',
  'grid',
  'dropdown',
  'button',
  'divider',
  'space',
  'stack',
  'empty',
  'container',
  'flex',
  'box',
  'aspectratio',
  'semanticsurface',
  'responsiveslot',
  'showhide',
  'iconframe',
  'treeselect',
  'resizehandle',
  'loadingindicator',
  'voiceinput',
  'meter',
  'visuallyhidden',
];

export default async function R2BehaviorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.only) ? params.only[0] : params.only;
  const only = (CASES as string[]).includes(raw ?? '') ? (raw as R2BehaviorCase) : 'tabs';
  return (
    <>
      <JudgeOverlay searchParams={searchParams} />
      <R2BehaviorScene only={only} />
    </>
  );
}
