import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { ComponentDemo } from './pages/ComponentDemo';
import IconsPage from './pages/IconsPage';
import { AuthLayoutDemo, DataTableDemo, EmptyStateDemo } from './pages/composite';
import { AllComposites } from './pages/AllComposites';
import { NewComposites } from './pages/NewComposites';

function App() {
  return (
    <BrowserRouter>
      <Layout sidebar={<Sidebar />}>
        <Routes>
          {/* General */}
          <Route path="/" element={<Overview />} />

          {/* Icons Gallery */}
          <Route path="/icons" element={<IconsPage />} />

          {/* Composite Components */}
          <Route path="/composite/all" element={<AllComposites />} />
          <Route path="/composite/new" element={<NewComposites />} />
          <Route path="/composite/auth-layout" element={<AuthLayoutDemo />} />
          <Route path="/composite/data-table" element={<DataTableDemo />} />
          <Route path="/composite/empty-state" element={<EmptyStateDemo />} />

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
