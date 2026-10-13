export function createThumbnail(label: string, color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
      <rect width="480" height="320" rx="24" fill="${color}" />
      <rect x="28" y="28" width="424" height="264" rx="20" fill="rgba(255,255,255,0.12)" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="36" font-weight="700" fill="white">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
