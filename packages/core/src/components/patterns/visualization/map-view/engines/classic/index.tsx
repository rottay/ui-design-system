'use client';

/**
 * @fileoverview MapView -- Classic engine (Ant Design).
 * Renders a placeholder map area with a scrollable marker list below it.
 * The map region is intentionally a static placeholder so consumers can
 * swap in Leaflet, Mapbox, or Google Maps without changing the outer shell.
 * Ant Design's Card, List, and Spin provide the chrome.
 *
 * @example
 * <ClassicMapView
 *   markers={[{ id: '1', lat: 40.7128, lng: -74.006, label: 'NYC' }]}
 *   height={400}
 *   onMarkerClick={(m) => console.log(m.id)}
 * />
 */

import React from 'react';
import { Card, List, Typography, Tag, Empty, Spin, Space } from 'antd';
import type { MapViewProps, MapMarker } from '../../contracts';

const { Text, Title } = Typography;

/**
 * Classic (Ant Design) implementation of the MapView pattern.
 * Displays a placeholder map card with center/zoom metadata, an optional
 * sidebar, and a bordered marker list with selection highlighting.
 *
 * @param props - See {@link MapViewProps} for the full prop contract.
 * @returns The rendered map view with marker list.
 */
export default function ClassicMapView<T>(props: MapViewProps<T>) {
  const {
    markers,
    center,
    zoom,
    onMarkerClick,
    renderMarker,
    renderPopup,
    selectedMarkerId,
    toolbar,
    height = 500,
    sidebar,
    sidebarWidth = 300,
    className,
    style,
    loading = false,
  } = props;

  return (
    /* Flex row: optional sidebar on the left, main content on the right */
    <div className={className} style={{ display: 'flex', gap: 16, ...style }}>
      {/* Sidebar is fixed-width and does not shrink so the map area fills remaining space */}
      {sidebar && (
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>{sidebar}</div>
      )}
      <div style={{ flex: 1 }}>
        {toolbar}
        {/* Spin wraps both map placeholder and marker list to show a unified loading state */}
        <Spin spinning={loading}>
          {/* Placeholder map area -- replace inner content with a real map library */}
          <Card
            style={{ height, marginBottom: 16 }}
            styles={{ body: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ds-color-info-bg)' } }}
          >
            {/* Placeholder metadata -- shows center coords, zoom level, and marker count
                 so developers can verify their data pipeline before swapping in a real map */}
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Map placeholder
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {center
                  ? `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
                  : 'No center set'}
                {zoom != null ? ` | Zoom: ${zoom}` : ''}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {markers.length} marker{markers.length !== 1 ? 's' : ''}
              </Text>
            </div>
          </Card>

          {/* Marker list -- falls back to Ant Design Empty when no markers exist */}
          {markers.length === 0 ? (
            <Empty description="No markers" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              size="small"
              bordered
              dataSource={markers}
              renderItem={(marker) => {
                /* Highlight the selected marker row with the info background token */
                const isSelected = marker.id === selectedMarkerId;
                return (
                  <List.Item
                    onClick={() => onMarkerClick?.(marker)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--ds-color-info-bg)' : undefined,
                    }}
                  >
                    {/* Custom renderMarker takes priority; default shows icon + coords + color tag */}
                    {renderMarker ? (
                      renderMarker(marker)
                    ) : (
                      <Space>
                        {marker.icon}
                        <div>
                          <Text strong={isSelected}>{marker.label ?? marker.id}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                          </Text>
                        </div>
                        {marker.color && (
                          <Tag color={marker.color} style={{ marginLeft: 8 }}>{marker.color}</Tag>
                        )}
                      </Space>
                    )}
                    {/* Popup content only renders when this marker is selected */}
                    {isSelected && renderPopup && (
                      <div style={{ marginTop: 8 }}>{renderPopup(marker)}</div>
                    )}
                  </List.Item>
                );
              }}
            />
          )}
        </Spin>
      </div>
    </div>
  );
}
