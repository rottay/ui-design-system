import React from 'react';
import { createRoot } from 'react-dom/client';
import { Splitter, Panel } from '@/components/primitives/layout/splitter/engines/modern';

function App() {
  return (
    <div style={{ width: 600, height: 240 }}>
      <Splitter layout="horizontal" style={{ width: '100%', height: '100%' }}>
        <Panel defaultSize={50}><div data-testid="p1">Left</div></Panel>
        <Panel defaultSize={50}><div data-testid="p2">Right</div></Panel>
      </Splitter>
      <div style={{ width: 600, height: 160, marginTop: 24 }} data-locked>
        <Splitter layout="horizontal" style={{ width: '100%', height: '100%' }}>
          <Panel defaultSize={50} resizable={false}><div>Locked left</div></Panel>
          <Panel defaultSize={50}><div>Right</div></Panel>
        </Splitter>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
