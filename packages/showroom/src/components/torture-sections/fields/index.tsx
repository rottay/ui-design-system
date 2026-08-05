'use client';

import {
  Box,
  Stack,
  Text,
  Button,
  Input,
  Slider,
  InputNumber,
  PasswordInput,
  Radio,
  TagInput,
  Checkbox,
  Form,
  Toggle,
  Switch,
  OTPInput,
  Textarea,
  FormField,
  VoiceInputButton,
} from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

// WO-SKIN-02 checkpoint A field-family data-part probe (the 15 input
// components). Every instance below is deterministic -- controlled or
// defaultValue-seeded, never randomly toggling -- so the grid renders
// identically on every load. Rendered only behind `?fields=1` so no
// flagship capture sees it. This section is what `fields-batch.spec.ts`
// photographs and reads computed styles from.
export function FieldsStates() {
  return (
    <Box
      data-testid="probe-fields"
      style={{
        borderRadius: 16,
        border: '1px solid var(--ds-color-border)',
        background: 'var(--ds-color-bg-elevated)',
        padding: 16,
      }}
    >
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-fields-input">
          <Text size="xs" color="secondary">
            Input
          </Text>
          <Input placeholder="Plain" />
          <Input prefix="$" suffix="USD" clearable defaultValue="120" />
          <Input error errorMessage="This field is required" defaultValue="bad value" />
          <Input disabled defaultValue="Disabled" />
          <Input.Group compact>
            <Input.Addon position="before">https://</Input.Addon>
            <Input placeholder="domain" />
            <Input.Addon position="after">.com</Input.Addon>
          </Input.Group>
          <Input.Password placeholder="Password" defaultValue="secret123" />
          <Input.Search placeholder="Search…" onSearch={() => undefined} />
          <Input.TextArea placeholder="Multi-line" showCount maxLength={80} defaultValue="Some text" />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-slider">
          <Text size="xs" color="secondary">
            Slider
          </Text>
          <Slider defaultValue={40} />
          <Slider range defaultValue={[20, 70]} marks={{ 0: 'Min', 100: 'Max' }} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-inputnumber">
          <Text size="xs" color="secondary">
            InputNumber
          </Text>
          <InputNumber defaultValue={12} />
          <InputNumber prefix="$" suffix="USD" addonBefore="Qty" addonAfter="ea" defaultValue={5} />
          <InputNumber status="error" defaultValue={-1} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-passwordinput">
          <Text size="xs" color="secondary">
            PasswordInput
          </Text>
          <PasswordInput defaultValue="hunter2" />
          <PasswordInput error errorMessage="Too short" defaultValue="a" />
          <PasswordInput strengthIndicator strengthLevel="good" defaultValue="Abcd1234" />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-radio">
          <Text size="xs" color="secondary">
            Radio
          </Text>
          <Radio name="probe-radio" label="Unchecked" />
          <Radio name="probe-radio" label="Checked" checked onChange={() => undefined} />
          <Radio name="probe-radio" label="Disabled" disabled />
          <Radio.Group
            options={[
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B' },
            ]}
            value="a"
            buttonStyle="solid"
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-taginput">
          <Text size="xs" color="secondary">
            TagInput
          </Text>
          <TagInput value={['design', 'system']} onChange={() => undefined} />
          <TagInput value={[]} error errorMessage="At least one tag required" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-checkbox">
          <Text size="xs" color="secondary">
            Checkbox
          </Text>
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" checked onChange={() => undefined} />
          <Checkbox label="Indeterminate" indeterminate onChange={() => undefined} />
          <Checkbox label="Disabled" disabled />
          <Checkbox.Group
            options={[
              { value: 'x', label: 'X' },
              { value: 'y', label: 'Y' },
            ]}
            value={['x']}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-form">
          <Text size="xs" color="secondary">
            Form
          </Text>
          <Form>
            <Form.Item label="Email" required help="We never share it">
              <Input placeholder="you@example.com" />
            </Form.Item>
            <Form.Item label="Name" validateStatus="error" help="Name is required" hasFeedback>
              <Input />
            </Form.Item>
          </Form>
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-toggle">
          <Text size="xs" color="secondary">
            Toggle
          </Text>
          <Toggle label="Off" checked={false} onChange={() => undefined} />
          <Toggle label="On" checked onChange={() => undefined} />
          <Toggle label="Error" error checked={false} onChange={() => undefined} />
          <Toggle label="Disabled" disabled />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-switch">
          <Text size="xs" color="secondary">
            Switch
          </Text>
          <Switch checked={false} onChange={() => undefined} checkedChildren="On" unCheckedChildren="Off" />
          <Switch checked onChange={() => undefined} checkedChildren="On" unCheckedChildren="Off" />
          <Switch disabled />
          <Switch loading checked onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-otpinput">
          <Text size="xs" color="secondary">
            OTPInput
          </Text>
          <OTPInput length={6} value="12" onChange={() => undefined} />
          <OTPInput length={6} value="" error errorMessage="Invalid code" onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-textarea">
          <Text size="xs" color="secondary">
            Textarea
          </Text>
          <Textarea placeholder="Comment" rows={3} />
          <Textarea status="error" defaultValue="Bad value" rows={3} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-button-icon">
          <Text size="xs" color="secondary">
            Button.Icon
          </Text>
          <Button.Icon icon={<Icon name="action.add" decorative />} aria-label="Add" />
          <Button.Icon icon={<Icon name="action.add" decorative />} aria-label="Add (disabled)" disabled />
          <Button.Icon icon={<Icon name="action.add" decorative />} aria-label="Add (loading)" loading />
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-formfield">
          <Text size="xs" color="secondary">
            FormField
          </Text>
          <FormField label="Username" name="probe-username" required help="3-20 characters">
            <Input />
          </FormField>
          <FormField label="Bio" name="probe-bio" error="Bio is too long">
            <Input />
          </FormField>
        </Stack>

        <Stack spacing="xs" data-testid="probe-fields-voiceinputbutton">
          <Text size="xs" color="secondary">
            VoiceInputButton
          </Text>
          <VoiceInputButton lang="en-US" onTranscript={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}
