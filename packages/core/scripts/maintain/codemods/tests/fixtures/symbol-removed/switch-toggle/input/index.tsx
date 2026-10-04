import { Stack, Switch, type SwitchProps, type SwitchSize } from '@rottay/design-system';
import { Switch as AntSwitch } from 'antd';

const shared: SwitchProps = { checked: true };
export const step: SwitchSize = 'sm';

export function Preferences({ on, setOn, report }: { on: boolean; setOn: (next: boolean) => void; report: (next: boolean) => void }) {
  return (
    <Stack>
      <Switch checked={on} onChange={setOn} checkedChildren="On" unCheckedChildren="Off" />
      <Switch
        aria-label="Alerts"
        onClick={(checked) => report(checked)}
      />
      <Switch checked={on} onChange={setOn} onClick={(checked) => report(checked)} />
      <Switch size="middle" defaultChecked />
      <Switch size="small" defaultChecked />
      <Switch {...shared} />
      <AntSwitch checkedChildren="On" unCheckedChildren="Off" onClick={() => undefined} />
    </Stack>
  );
}
