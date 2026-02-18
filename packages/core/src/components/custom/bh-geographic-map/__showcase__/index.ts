/**
 * bh-geographic-map - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { GeoRegion } from '../core';

export const MOCK_REGIONS: GeoRegion[] = [
  { id: 'r-1', name: 'San Francisco', candidateCount: 342, latitude: 37.7749, longitude: -122.4194 },
  { id: 'r-2', name: 'New York', candidateCount: 287, latitude: 40.7128, longitude: -74.006 },
  { id: 'r-3', name: 'London', candidateCount: 198, latitude: 51.5074, longitude: -0.1278 },
  { id: 'r-4', name: 'Berlin', candidateCount: 156, latitude: 52.52, longitude: 13.405 },
  { id: 'r-5', name: 'Tokyo', candidateCount: 134, latitude: 35.6762, longitude: 139.6503 },
  { id: 'r-6', name: 'Sydney', candidateCount: 89, latitude: -33.8688, longitude: 151.2093 },
  { id: 'r-7', name: 'Toronto', candidateCount: 112, latitude: 43.6532, longitude: -79.3832 },
  { id: 'r-8', name: 'Singapore', candidateCount: 78, latitude: 1.3521, longitude: 103.8198 },
  { id: 'r-9', name: 'Sao Paulo', candidateCount: 67, latitude: -23.5505, longitude: -46.6333 },
  { id: 'r-10', name: 'Bangalore', candidateCount: 203, latitude: 12.9716, longitude: 77.5946 },
];
