'use client';

import { Box, Stack, Text, DatePicker, TimePicker, Upload, Transfer, ColorPicker } from '@rottay/design-system';

// Fixed fixtures for the WO-SKIN-02 checkpoint C pickers-and-movers data-part
// probe (DatePicker, TimePicker, Upload, Transfer, ColorPicker). Every
// instance below is deterministic -- controlled/defaultValue-seeded, never a
// live clock or a real file read -- so the grid renders identically on every
// load. Rendered only behind `?pickers=1` so no flagship capture sees it.
// This section is what `pickers-batch.spec.ts` photographs and reads
// computed styles from.
const PICKERS_UPLOAD_FILES = [
  {
    uid: 'file-done',
    name: 'quarterly-report.pdf',
    status: 'done' as const,
    percent: 100,
  },
  {
    uid: 'file-uploading',
    name: 'roadmap-deck.pptx',
    status: 'uploading' as const,
    percent: 42,
  },
  {
    uid: 'file-error',
    name: 'budget.xlsx',
    status: 'error' as const,
    percent: 0,
  },
];

const PICKERS_TRANSFER_ITEMS = [
  { key: 'design', title: 'Design' },
  { key: 'engineering', title: 'Engineering' },
  { key: 'marketing', title: 'Marketing' },
  { key: 'sales', title: 'Sales' },
];

const PICKERS_TRANSFER_TARGET_KEYS = ['engineering'];

const PICKERS_COLOR_PRESETS = [{ label: 'Brand', colors: ['#1677ff', '#52c41a', '#f5222d'] }];

export function PickersStates() {
  return (
    <Box
      data-testid="probe-pickers"
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        <Stack spacing="xs" data-testid="probe-pickers-datepicker">
          <Text size="xs" color="secondary">
            DatePicker
          </Text>
          <DatePicker placeholder="Choose a date" onChange={() => undefined} />
          <DatePicker defaultValue="2026-03-15" onChange={() => undefined} />
          <DatePicker disabled defaultValue="2026-01-01" onChange={() => undefined} />
          <DatePicker.RangePicker defaultValue={['2026-01-01', '2026-01-10']} onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-timepicker">
          <Text size="xs" color="secondary">
            TimePicker
          </Text>
          <TimePicker placeholder="Choose a time" onChange={() => undefined} />
          <TimePicker defaultValue="14:30" onChange={() => undefined} />
          <TimePicker disabled defaultValue="09:00" onChange={() => undefined} />
          <TimePicker.RangePicker defaultValue={['09:00', '17:00']} onChange={() => undefined} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-upload">
          <Text size="xs" color="secondary">
            Upload
          </Text>
          <Upload fileList={PICKERS_UPLOAD_FILES} onChange={() => undefined} />
          <Upload.Dragger fileList={PICKERS_UPLOAD_FILES} onChange={() => undefined} height={120} />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-transfer">
          <Text size="xs" color="secondary">
            Transfer
          </Text>
          <Transfer
            dataSource={PICKERS_TRANSFER_ITEMS}
            defaultTargetKeys={PICKERS_TRANSFER_TARGET_KEYS}
            showSearch
            onChange={() => undefined}
          />
        </Stack>

        <Stack spacing="xs" data-testid="probe-pickers-colorpicker">
          <Text size="xs" color="secondary">
            ColorPicker
          </Text>
          <ColorPicker defaultValue="#1677ff" showText presets={PICKERS_COLOR_PRESETS} onChange={() => undefined} />
          <ColorPicker disabled defaultValue="#52c41a" onChange={() => undefined} />
        </Stack>
      </Box>
    </Box>
  );
}
