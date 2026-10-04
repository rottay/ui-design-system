import { Stack, Toggle, type ToggleProps, type ToggleSize } from '@rottay/design-system';
import { Switch as AntSwitch } from 'antd';

const shared: ToggleProps = { checked: true };
export const step: ToggleSize = 'sm';

export function Preferences({ on, setOn, report }: { on: boolean; setOn: (next: boolean) => void; report: (next: boolean) => void }) {
  return (
    <Stack>
      <Toggle checked={on} onChange={setOn} checkedLabel="On" uncheckedLabel="Off" />
      <Toggle
        aria-label="Alerts"
        onChange={(checked) => report(checked)}
      />
      <Toggle checked={on} onChange={setOn} onClick={(checked) => report(checked)} />
      <Toggle size="md" defaultChecked />
      <Toggle size="small" defaultChecked />
      <Toggle {...shared} />
      <AntSwitch checkedChildren="On" unCheckedChildren="Off" onClick={() => undefined} />
    </Stack>
  );
}
