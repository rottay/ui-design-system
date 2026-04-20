'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Text, Flex } from '@rottay/design-system';
import { useShowroom } from '@/components/showroom-context';

export function StateToast() {
  const { engine, tenantSlug } = useShowroom();
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const isInitialMount = useRef(true);
  const prevEngine = useRef(engine);
  const prevTenant = useRef(tenantSlug);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const parts: string[] = [];
    if (engine !== prevEngine.current) {
      parts.push(`Engine: ${engine}`);
    }
    if (tenantSlug !== prevTenant.current) {
      parts.push(`Theme: ${tenantSlug}`);
    }
    prevEngine.current = engine;
    prevTenant.current = tenantSlug;

    if (parts.length === 0) return;

    setMessage(parts.join(' | '));
    setVisible(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [engine, tenantSlug]);

  if (!visible && !message) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        padding: '8px 16px',
        borderRadius: 8,
        background: 'var(--ds-color-bg-elevated, var(--ds-color-white))',
        border: '1px solid var(--ds-color-border, var(--ds-color-neutral-200))',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        zIndex: 1000,
        transition: 'opacity 200ms ease, transform 200ms ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        pointerEvents: 'none',
      }}
    >
      <Flex align="center" gap={8}>
        <Box
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--ds-color-success, #22c55e)',
            flexShrink: 0,
          }}
        />
        <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
          {message}
        </Text>
      </Flex>
    </Box>
  );
}
