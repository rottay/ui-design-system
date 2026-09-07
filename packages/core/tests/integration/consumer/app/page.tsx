/**
 * One page of the application, built only from the guaranteed surface.
 *
 * Every specifier here is `guaranteed` in the consumer contract §1.2: the root
 * barrel for components, `./icons` for the semantic facade. No per-component
 * subpath, no `./contracts/*` or `./runtime/*`, no product icon pack, no
 * published test fixture. Paint comes from the tenant's compiled artifact
 * through `var(--ds-*)`; the page declares no color of its own.
 */
import { Badge, Box, Button, Card, Flex, Heading, Stack, Text } from '@rottay/design-system';
import { Icon } from '@rottay/design-system/icons';

export interface ConsumerPageProps {
  title: string;
  rows: readonly { id: string; label: string; state: string }[];
}

export default function ConsumerPage({ title, rows }: ConsumerPageProps) {
  return (
    <Box data-testid="consumer-page">
      <Stack gap="lg">
        <Flex align="center" gap="md">
          <Icon name="action.search" decorative />
          <Heading level="h1">{title}</Heading>
        </Flex>
        {rows.map((row) => (
          <Card key={row.id}>
            <Flex align="center" justify="between" gap="md">
              <Text>{row.label}</Text>
              <Badge>{row.state}</Badge>
            </Flex>
          </Card>
        ))}
        <Button>Continue</Button>
      </Stack>
    </Box>
  );
}
