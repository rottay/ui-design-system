'use client';

import {
  useState,
  type ReactNode,
} from 'react';
import {
  AutoComplete,
  Box,
  Button,
  Cascader,
  Checkbox,
  ColorPicker,
  DatePicker,
  Flex,
  Form,
  FormField,
  Input,
  InputNumber,
  Mentions,
  OTPInput,
  PasswordInput,
  Radio,
  Select,
  Slider,
  Stack,
  TagInput,
  Text,
  Textarea,
  TimePicker,
  Toggle,
  Transfer,
  TreeSelect,
  Upload,
  VoiceInputButton,
} from '@rottay/design-system';

// ---------------------------------------------------------------------------
// Real DS-backed preview components
// ---------------------------------------------------------------------------

function FormPreview() {
  return (
    <Form
      layout="vertical"
      initialValues={{
        tenant: 'Northwind',
        owner: 'daniel@rottay.com',
      }}
      style={{ width: 320 }}
    >
      <Form.Item
        name="tenant"
        label="Tenant name"
        rules={[{ required: true, message: 'Tenant name is required' }]}
      >
        <Input placeholder="Northwind" />
      </Form.Item>
      <Form.Item name="owner" label="Workspace owner">
        <Input placeholder="daniel@rottay.com" />
      </Form.Item>
      <Form.Item name="tier" label="Plan tier">
        <Select
          options={[
            { value: 'starter', label: 'Starter' },
            { value: 'growth', label: 'Growth' },
            { value: 'enterprise', label: 'Enterprise' },
          ]}
          placeholder="Choose a plan"
        />
      </Form.Item>
    </Form>
  );
}

function FormFieldPreview() {
  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <FormField
        label="Email"
        name="email"
        required
        help="We use this for workspace access alerts."
      >
        <Input placeholder="ops@northwind.co" />
      </FormField>
      <FormField
        label="Status"
        name="status"
        error="Pick an approval status before continuing."
      >
        <Select
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'In review' },
            { value: 'approved', label: 'Approved' },
          ]}
          placeholder="Select a status"
        />
      </FormField>
    </Stack>
  );
}

function TagInputPreview() {
  const [tags, setTags] = useState(['billing', 'priority']);

  return (
    <Stack spacing="sm" style={{ width: 320 }}>
      <TagInput
        value={tags}
        onChange={setTags}
        placeholder="Add route labels"
        maxTags={6}
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Tags stay controlled in preview so you can test add and remove behavior.
      </Text>
    </Stack>
  );
}

function VoiceInputButtonPreview() {
  const [transcript, setTranscript] = useState('');

  return (
    <Stack spacing="sm" style={{ maxWidth: 320 }}>
      <Flex align="center" gap={10}>
        <Input
          value={transcript}
          readOnly
          placeholder="Speech transcript appears here when supported"
          style={{ width: 250 }}
        />
        <VoiceInputButton
          onTranscript={setTranscript}
          ariaLabel="Capture voice query"
        />
      </Flex>
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        This uses the real DS voice primitive. It only renders the mic button
        when the browser exposes speech recognition and microphone access is
        available.
      </Text>
    </Stack>
  );
}

export const INPUT_PREVIEWS: Record<string, ReactNode> = {
  // -- Inputs --
  'auto-complete': (
    <AutoComplete
      options={[
        { value: 'React' },
        { value: 'Vue' },
        { value: 'Angular' },
      ]}
      placeholder="Search framework..."
      style={{ width: 220 }}
    />
  ),
  'button': (
    <Flex gap={8} wrap="wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="default">Default</Button>
      <Button variant="ghost">Ghost</Button>
    </Flex>
  ),
  'cascader': (
    <Cascader
      options={[
        {
          value: 'frontend',
          label: 'Frontend',
          children: [
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' },
          ],
        },
        {
          value: 'backend',
          label: 'Backend',
          children: [{ value: 'node', label: 'Node.js' }],
        },
      ]}
      placeholder="Select category..."
      style={{ width: 240 }}
    />
  ),
  'checkbox': (
    <Flex gap={16}>
      <Checkbox>Accept terms</Checkbox>
      <Checkbox defaultChecked>Checked</Checkbox>
    </Flex>
  ),
  'color-picker': <ColorPicker defaultValue="#0f766e" />,
  'date-picker': (
    <DatePicker placeholder="Select date" style={{ width: 200 }} />
  ),
  'form': <FormPreview />,
  'form-field': <FormFieldPreview />,
  'input': (
    <Input placeholder="Type something..." style={{ maxWidth: 280 }} />
  ),
  'input-number': (
    <InputNumber min={0} max={100} defaultValue={42} style={{ width: 140 }} />
  ),
  'mentions': (
    <Mentions
      options={[
        { value: 'daniel', label: 'Daniel' },
        { value: 'maria', label: 'Maria' },
        { value: 'carlos', label: 'Carlos' },
      ]}
      placeholder="Type @ to mention..."
      style={{ width: 280 }}
    />
  ),
  'otp-input': <OTPInput length={6} />,
  'password-input': (
    <Stack spacing="sm" style={{ width: 320 }}>
      <PasswordInput
        placeholder="Create a password"
        strengthIndicator
        strengthLevel="good"
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Real DS password field with toggle and strength treatment.
      </Text>
    </Stack>
  ),
  'radio': (
    <Flex gap={16}>
      <Radio value="a">Option A</Radio>
      <Radio value="b">Option B</Radio>
    </Flex>
  ),
  'select': (
    <Select
      options={[
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' },
      ]}
      placeholder="Select..."
      style={{ minWidth: 200 }}
    />
  ),
  'slider': (
    <Box style={{ width: 260 }}>
      <Slider defaultValue={50} />
    </Box>
  ),
  'tag-input': <TagInputPreview />,
  'textarea': (
    <Textarea
      placeholder="Enter description..."
      rows={3}
      style={{ maxWidth: 320 }}
    />
  ),
  'time-picker': (
    <Stack spacing="sm" style={{ width: 240 }}>
      <TimePicker
        defaultValue="09:30:00"
        format="HH:mm"
        showSecond={false}
        placeholder="Pick a time"
      />
      <Text size="xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
        Time options come from the DS picker runtime.
      </Text>
    </Stack>
  ),
  'toggle': (
    <Toggle
      defaultChecked
      color="success"
      label="Auto-assign approvals"
      checkedLabel="ON"
      uncheckedLabel="OFF"
      description="Keep incoming reviews moving."
    />
  ),
  'transfer': (
    <Transfer
      dataSource={[
        { key: '1', title: 'Item 1' },
        { key: '2', title: 'Item 2' },
        { key: '3', title: 'Item 3' },
        { key: '4', title: 'Item 4' },
      ]}
      targetKeys={['2']}
      titles={['Source', 'Target']}
    />
  ),
  'tree-select': (
    <TreeSelect
      treeData={[
        {
          title: 'Platform',
          value: 'platform',
          children: [
            { title: 'Admin', value: 'admin' },
            { title: 'Operations', value: 'operations' },
          ],
        },
        {
          title: 'Experience',
          value: 'experience',
          children: [
            { title: 'Mobile', value: 'mobile' },
            { title: 'Desktop', value: 'desktop' },
          ],
        },
      ]}
      defaultValue="operations"
      placeholder="Choose a workspace"
      style={{ width: 260 }}
    />
  ),
  'upload': (
    <Upload action="">
      <Button>Upload file</Button>
    </Upload>
  ),
  'voice-input-button': <VoiceInputButtonPreview />,
};
