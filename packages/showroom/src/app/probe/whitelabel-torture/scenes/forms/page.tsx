import { TortureFirstPaint, type TortureRouteProps } from '@/components/torture-first-paint';
import { TortureFrame } from '@/components/torture-sections/frame';
import { FieldFiltersStates } from '@/components/torture-sections/field-filters';
import { FieldsStates } from '@/components/torture-sections/fields';
import { DropdownsStates } from '@/components/torture-sections/dropdowns';
import { PickersStates } from '@/components/torture-sections/pickers';
import { FormsFbStates } from '@/components/torture-sections/forms';

export default async function FormsScenePage({ searchParams }: TortureRouteProps) {
  const query = await searchParams;

  return (
    <>
      <TortureFirstPaint query={query} />
      <TortureFrame>
        <FieldFiltersStates />
        <FieldsStates />
        <DropdownsStates />
        <PickersStates />
        <FormsFbStates />
      </TortureFrame>
    </>
  );
}
