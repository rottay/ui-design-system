'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { QRCode as AntQRCode } from 'antd';

import {
  PROVIDER_PAINT_ATTRIBUTE_FILTER,
  resolveCssColor,
} from '@/infrastructure/runtime/dom/runtime/css-color-resolution';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import type { QRCodeProps } from '../../contracts';

const QR_FOREGROUND_FALLBACK = '#000000';
const QR_BACKGROUND_FALLBACK = '#ffffff';

interface ResolvedQRCodeColors {
  foreground: string;
  background: string;
}

function initialColor(value: string, fallback: string): string {
  return value.includes('var(') ? fallback : value;
}

/**
 * Resolve QR paint against the actual provider-owned host. Canvas does not
 * reliably accept unresolved custom-property expressions as fillStyle, and a
 * document-global lookup would make colocated tenants bleed into each other.
 */
function useResolvedQRCodeColors(
  ownerRef: React.RefObject<HTMLElement | null>,
  color: string,
  bgColor: string,
): ResolvedQRCodeColors {
  const [resolved, setResolved] = useState<ResolvedQRCodeColors>(() => ({
    foreground: initialColor(color, QR_FOREGROUND_FALLBACK),
    background: initialColor(bgColor, QR_BACKGROUND_FALLBACK),
  }));

  const refresh = useCallback(() => {
    const owner = ownerRef.current;
    const next = {
      foreground: resolveCssColor(color, owner, QR_FOREGROUND_FALLBACK),
      background: resolveCssColor(bgColor, owner, QR_BACKGROUND_FALLBACK),
    };

    setResolved((current) => (
      current.foreground === next.foreground && current.background === next.background
        ? current
        : next
    ));
  }, [bgColor, color, ownerRef]);

  useEffect(() => {
    refresh();

    const owner = ownerRef.current;
    if (!owner || typeof MutationObserver === 'undefined') return undefined;

    const observer = new MutationObserver(refresh);
    let current: Element | null = owner;
    while (current) {
      observer.observe(current, {
        attributes: true,
        attributeFilter: [...PROVIDER_PAINT_ATTRIBUTE_FILTER],
      });
      current = current.parentElement;
    }

    return () => observer.disconnect();
  }, [ownerRef, refresh]);

  return resolved;
}

export interface EncodedQRCodeSymbolProps {
  ownerRef: React.RefObject<HTMLElement | null>;
  value: string;
  type: NonNullable<QRCodeProps['type']>;
  size: number;
  color: string;
  bgColor: string;
  errorLevel: NonNullable<QRCodeProps['errorLevel']>;
  icon?: string;
  iconSize: number;
}

/**
 * Supplier-contained QR encoder shared by the modern and rustic skins.
 * Ant Design delegates to its standards-compliant QR matrix encoder; the
 * surrounding engines remain responsible only for DS chrome and statuses.
 */
export function EncodedQRCodeSymbol({
  ownerRef,
  value,
  type,
  size,
  color,
  bgColor,
  errorLevel,
  icon,
  iconSize,
}: EncodedQRCodeSymbolProps): React.ReactElement {
  const resolved = useResolvedQRCodeColors(ownerRef, color, bgColor);
  const accessibleValue = value || 'empty value';

  // Accessible name: translated when an I18nProvider is mounted, with the
  // documented English fallback otherwise (a missing catalog key echoes the
  // raw key back, which the endsWith guard detects — K4-C wires the channel
  // ahead of the locale JSONs). Shared by every engine that renders this
  // symbol, so the channel lands once for all of them.
  const i18n = useOptionalTranslation('components');
  const containsKey = 'qrcode.contains';
  const containsFallback = `QR code containing: ${accessibleValue}`;
  const containsTranslated = i18n?.t(containsKey, { value: accessibleValue });
  const accessibleName =
    containsTranslated && !containsTranslated.endsWith(containsKey)
      ? containsTranslated
      : containsFallback;

  return (
    <AntQRCode
      value={value || ' '}
      type={type}
      size={size}
      color={resolved.foreground}
      bgColor={resolved.background}
      errorLevel={errorLevel}
      // The encoder excavates the center modules and embeds the image in its
      // Canvas/SVG output. The skin overlays the same asset only to retain the
      // existing supplier-free DS chrome around that functional image.
      icon={icon}
      iconSize={iconSize}
      status="active"
      bordered={false}
      aria-label={accessibleName}
      data-part="canvas"
      data-qr-encoder="standards"
      data-qr-error-level={errorLevel}
      data-qr-render-type={type}
      style={{
        width: size,
        height: size,
        padding: 0,
        backgroundColor: resolved.background,
      }}
    />
  );
}
