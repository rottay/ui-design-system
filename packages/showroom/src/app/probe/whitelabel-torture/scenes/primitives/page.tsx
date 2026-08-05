import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { InteractiveCards } from '@/components/torture-sections/interactive';
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

export default async function PrimitivesScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <InteractiveCards />
        <FieldsStates />
        <DropdownsStates />
        <PickersStates />
        <StatusFbStates />
        <OverlayFbStates />
        <OverlayStates />
        <NavFbStates />
        <Display1States />
        <Display2States />
        <LayoutStates />
      </TortureFrame>
    </>
  );
}
