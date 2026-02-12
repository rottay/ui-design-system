'use client';

/**
 * MapView - Classic Engine (Ant Design)
 *
 * Placeholder map container with marker list.
 * Designed to be extended with Leaflet/Mapbox by consumers.
 */

import React from 'react';
import { Card, List, Typography, Tag, Empty, Spin, Space } from 'antd';
import type { MapViewProps, MapMarker } from '../../types';

const { Text, Title } = Typography;

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
    <div className={className} style={{ display: 'flex', gap: 16, ...style }}>
      {sidebar && (
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>{sidebar}</div>
      )}
      <div style={{ flex: 1 }}>
        {toolbar}
        <Spin spinning={loading}>
          {/* Placeholder map area */}
          <Card
            style={{ height, marginBottom: 16 }}
            styles={{ body: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f4fd' } }}
          >
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

          {/* Marker list */}
          {markers.length === 0 ? (
            <Empty description="No markers" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <List
              size="small"
              bordered
              dataSource={markers}
              renderItem={(marker) => {
                const isSelected = marker.id === selectedMarkerId;
                return (
                  <List.Item
                    onClick={() => onMarkerClick?.(marker)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#e6f4ff' : undefined,
                    }}
                  >
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
