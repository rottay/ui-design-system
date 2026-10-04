import { Button, type ButtonProps } from '@rottay/design-system';
import { Button as AntButton } from 'antd';

const shared: ButtonProps = { variant: 'primary' };

export function Actions({ saving, label }: { saving: boolean; label: string }) {
  return (
    <>
      <Button loading>Save</Button>
      <Button
        variant="primary"
        loading={saving}
        loadingText={label}
      >
        Save
      </Button>
      <Button loading={saving} pending>Save</Button>
      <Button loadingText="Saving" pendingLabel={label} pending={saving}>Save</Button>
      <Button {...shared} disabled={saving}>Save</Button>
      <Button.Icon icon={<span />} aria-label="Add" loading={saving} />
      <AntButton loading={saving}>Save</AntButton>
    </>
  );
}
