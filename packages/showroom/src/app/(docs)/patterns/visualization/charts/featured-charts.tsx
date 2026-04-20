'use client';

import { Box, Stack, Text, Card } from '@rottay/design-system';
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  ScatterChart,
} from '@rottay/design-system';

export function FeaturedCharts() {
  return (
    <Stack spacing={16}>
      <Text as={"h2" as any} size="xl" weight="bold">
        Featured Charts
      </Text>
      <Text size="sm" style={{ color: 'var(--ds-color-text-secondary)', marginTop: -8 }}>
        Live previews that respond to the active engine and theme.
      </Text>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}
      >
        <Card style={{ padding: 16 }}>
          <Text size="sm" weight="semibold" style={{ marginBottom: 8 }}>
            Bar Chart
          </Text>
          <BarChart
            data={[
              { label: 'Engineering', value: 45 },
              { label: 'Sales', value: 32 },
              { label: 'Marketing', value: 28 },
              { label: 'Design', value: 19 },
              { label: 'Support', value: 15 },
            ]}
            height={200}
            animate
          />
        </Card>

        <Card style={{ padding: 16 }}>
          <Text size="sm" weight="semibold" style={{ marginBottom: 8 }}>
            Line Chart
          </Text>
          <LineChart
            series={[
              {
                name: 'Users',
                data: [
                  { x: 'Jan', y: 120 },
                  { x: 'Feb', y: 180 },
                  { x: 'Mar', y: 250 },
                  { x: 'Apr', y: 310 },
                  { x: 'May', y: 420 },
                  { x: 'Jun', y: 380 },
                ],
              },
            ]}
            height={200}
            curved
            showDots
            animate
          />
        </Card>

        <Card style={{ padding: 16 }}>
          <Text size="sm" weight="semibold" style={{ marginBottom: 8 }}>
            Pie Chart (Donut)
          </Text>
          <PieChart
            data={[
              { label: 'Desktop', value: 55 },
              { label: 'Mobile', value: 30 },
              { label: 'Tablet', value: 15 },
            ]}
            height={200}
            donut
            showPercentage
            animate
          />
        </Card>

        <Card style={{ padding: 16 }}>
          <Text size="sm" weight="semibold" style={{ marginBottom: 8 }}>
            Area Chart
          </Text>
          <AreaChart
            series={[
              {
                name: 'Revenue',
                data: [
                  { x: 'Q1', y: 45000 },
                  { x: 'Q2', y: 52000 },
                  { x: 'Q3', y: 61000 },
                  { x: 'Q4', y: 73000 },
                ],
              },
            ]}
            height={200}
            animate
          />
        </Card>

        <Card style={{ padding: 16, gridColumn: 'span 2' }}>
          <Text size="sm" weight="semibold" style={{ marginBottom: 8 }}>
            Scatter Chart (Bubble)
          </Text>
          <ScatterChart
            data={[
              { x: 10, y: 20, label: 'A', size: 40 },
              { x: 25, y: 35, label: 'B', size: 80 },
              { x: 40, y: 15, label: 'C', size: 120 },
              { x: 55, y: 45, label: 'D', size: 60 },
              { x: 70, y: 30, label: 'E', size: 100 },
              { x: 30, y: 50, label: 'F', size: 50 },
            ]}
            xLabel="Revenue ($K)"
            yLabel="Growth (%)"
            bubble
            trendLine
            height={200}
            animate
          />
        </Card>
      </Box>
    </Stack>
  );
}
