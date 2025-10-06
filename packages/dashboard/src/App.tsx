import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { ComponentDemo } from './pages/ComponentDemo';

function App() {
  return (
    <BrowserRouter>
      <Layout sidebar={<Sidebar />}>
        <Routes>
          {/* General */}
          <Route path="/" element={<Overview />} />

          {/* Rutas dinámicas por categoría */}
          <Route path="/:category/:component" element={<ComponentDemo />} />

          {/* Fallback */}
          <Route path="*" element={
            <div style={{ padding: '48px' }}>
              <h1 style={{ fontSize: '36px' }}>404</h1>
              <p style={{ fontSize: '16px', marginTop: '8px' }}>
                Página no encontrada
              </p>
            </div>
          } />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
