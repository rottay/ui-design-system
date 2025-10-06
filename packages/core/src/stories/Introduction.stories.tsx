import type { Meta, StoryObj } from '@storybook/react';

const Overview = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Design System</h1>
      <p>Bienvenido al <strong>Design System</strong> multi-template basado en Ant Design.</p>

      <h2>🎨 Características</h2>
      <ul>
        <li><strong>8 Templates Profesionales</strong>: Base, Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel</li>
        <li><strong>71+ Componentes</strong>: Totalmente documentados y accesibles</li>
        <li><strong>TypeScript</strong>: Type-safe con tipado completo</li>
        <li><strong>Accesibilidad</strong>: Cumple estándares WCAG 2.0/2.1</li>
        <li><strong>Responsive</strong>: Optimizado para mobile, tablet y desktop</li>
      </ul>

      <h2>📦 Componentes Disponibles</h2>

      <h3>General</h3>
      <ul>
        <li><strong>Button</strong> - Botones para acciones y eventos</li>
      </ul>

      <h3>Inputs</h3>
      <ul>
        <li><strong>Input</strong> - Campo de entrada de texto</li>
        <li><strong>Select</strong> - Selector de opciones</li>
        <li><strong>Form</strong> - Formularios completos</li>
        <li><strong>Checkbox</strong> - Casillas de verificación</li>
        <li><strong>Radio</strong> - Botones de radio</li>
        <li><strong>Switch</strong> - Interruptor on/off</li>
        <li><strong>DatePicker</strong> - Selector de fechas</li>
        <li><strong>TimePicker</strong> - Selector de hora</li>
        <li><strong>Upload</strong> - Carga de archivos</li>
        <li><strong>Slider</strong> - Control deslizante</li>
        <li><strong>Transfer</strong> - Transferencia de elementos</li>
        <li><strong>Cascader</strong> - Selector en cascada</li>
        <li><strong>TreeSelect</strong> - Selector de árbol</li>
        <li><strong>AutoComplete</strong> - Autocompletado</li>
        <li><strong>ColorPicker</strong> - Selector de color</li>
        <li><strong>InputNumber</strong> - Entrada numérica</li>
        <li><strong>Mentions</strong> - Menciones</li>
      </ul>

      <h3>Display</h3>
      <ul>
        <li><strong>Badge</strong> - Insignias y contadores</li>
        <li><strong>Tag</strong> - Etiquetas</li>
        <li><strong>Avatar</strong> - Avatares de usuario</li>
        <li><strong>Calendar</strong> - Calendario</li>
        <li><strong>Card</strong> - Tarjetas de contenido</li>
        <li><strong>Carousel</strong> - Carrusel de imágenes</li>
        <li><strong>Collapse</strong> - Paneles colapsables</li>
        <li><strong>Descriptions</strong> - Lista de descripciones</li>
        <li><strong>Empty</strong> - Estado vacío</li>
        <li><strong>Image</strong> - Visor de imágenes</li>
        <li><strong>List</strong> - Listas de datos</li>
        <li><strong>QRCode</strong> - Códigos QR</li>
        <li><strong>Statistic</strong> - Estadísticas</li>
        <li><strong>Table</strong> - Tablas de datos</li>
        <li><strong>Timeline</strong> - Línea de tiempo</li>
        <li><strong>Tree</strong> - Estructura de árbol</li>
        <li><strong>Typography</strong> - Tipografía</li>
      </ul>

      <h3>Feedback</h3>
      <ul>
        <li><strong>Alert</strong> - Mensajes de alerta</li>
        <li><strong>Modal</strong> - Ventanas modales</li>
        <li><strong>Message</strong> - Mensajes globales</li>
        <li><strong>Notification</strong> - Notificaciones</li>
        <li><strong>Progress</strong> - Barras de progreso</li>
        <li><strong>Rate</strong> - Calificaciones</li>
        <li><strong>Result</strong> - Páginas de resultado</li>
        <li><strong>Skeleton</strong> - Placeholders de carga</li>
        <li><strong>Spin</strong> - Indicadores de carga</li>
      </ul>

      <h3>Navigation</h3>
      <ul>
        <li><strong>Menu</strong> - Menús de navegación</li>
        <li><strong>Tabs</strong> - Pestañas</li>
        <li><strong>Breadcrumb</strong> - Migas de pan</li>
        <li><strong>Pagination</strong> - Paginación</li>
        <li><strong>Steps</strong> - Pasos de proceso</li>
        <li><strong>Affix</strong> - Elementos fijos</li>
        <li><strong>Anchor</strong> - Anclas de navegación</li>
        <li><strong>BackTop</strong> - Botón volver arriba</li>
        <li><strong>FloatButton</strong> - Botón flotante</li>
        <li><strong>Segmented</strong> - Controles segmentados</li>
      </ul>

      <h3>Overlay</h3>
      <ul>
        <li><strong>Tooltip</strong> - Información contextual</li>
        <li><strong>Popover</strong> - Ventanas emergentes</li>
        <li><strong>Popconfirm</strong> - Confirmación emergente</li>
        <li><strong>Drawer</strong> - Paneles laterales</li>
        <li><strong>Dropdown</strong> - Menús desplegables</li>
        <li><strong>Tour</strong> - Tours guiados</li>
        <li><strong>Watermark</strong> - Marcas de agua</li>
      </ul>

      <h2>🚀 Cómo Usar</h2>

      <h3>Instalación</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        <code>yarn add @designsystem/core</code>
      </pre>

      <h3>Uso Básico</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        <code>{`import { Button, Input, Card } from '@designsystem/core';
import { ThemeProvider } from '@designsystem/core';

function App() {
  return (
    <ThemeProvider defaultTemplate="base">
      <Card title="Mi Aplicación">
        <Input placeholder="Ingresa tu nombre" />
        <Button type="primary">Enviar</Button>
      </Card>
    </ThemeProvider>
  );
}`}</code>
      </pre>

      <h3>Cambiar Template</h3>
      <p>Usa el selector de <strong>Theme</strong> en la toolbar superior de Storybook para probar diferentes templates.</p>

      <h2>📚 Documentación</h2>
      <p>Cada componente incluye:</p>
      <ul>
        <li>✅ Ejemplos interactivos</li>
        <li>✅ Props y API completa</li>
        <li>✅ Links a documentación de Ant Design</li>
        <li>✅ Análisis de accesibilidad</li>
      </ul>

      <h2>🎯 Herramientas de Storybook</h2>
      <ul>
        <li><strong>Controls</strong>: Edita props en tiempo real</li>
        <li><strong>Actions</strong>: Ve eventos disparados</li>
        <li><strong>Viewport</strong>: Prueba responsive</li>
        <li><strong>Backgrounds</strong>: Cambia fondos</li>
        <li><strong>Accessibility</strong>: Análisis WCAG</li>
        <li><strong>Theme Switcher</strong>: Cambia entre templates</li>
      </ul>

      <hr style={{ margin: '40px 0' }} />
      <p style={{ textAlign: 'center', color: '#666' }}>
        Explora los componentes en el menú lateral para ver ejemplos y documentación detallada.
      </p>
    </div>
  );
};

const meta: Meta<typeof Overview> = {
  title: 'Introduction',
  component: Overview,
  parameters: {
    docs: {
      description: {
        component: `
# Design System

Bienvenido al **Design System** multi-template basado en Ant Design.

## 🎨 Características

- **8 Templates Profesionales**: Base, Spotify, Stripe, Airbnb, Slack, Notion, Linear, Vercel
- **71+ Componentes**: Totalmente documentados y accesibles
- **TypeScript**: Type-safe con tipado completo
- **Accesibilidad**: Cumple estándares WCAG 2.0/2.1
- **Responsive**: Optimizado para mobile, tablet y desktop

## 📦 Componentes Disponibles

### General
- **Button** - Botones para acciones y eventos

### Inputs
- **Input** - Campo de entrada de texto
- **Select** - Selector de opciones
- **Form** - Formularios completos
- **Checkbox** - Casillas de verificación
- **Radio** - Botones de radio
- **Switch** - Interruptor on/off
- **DatePicker** - Selector de fechas
- **TimePicker** - Selector de hora
- **Upload** - Carga de archivos
- **Slider** - Control deslizante
- **Transfer** - Transferencia de elementos
- **Cascader** - Selector en cascada
- **TreeSelect** - Selector de árbol
- **AutoComplete** - Autocompletado
- **ColorPicker** - Selector de color
- **InputNumber** - Entrada numérica
- **Mentions** - Menciones

### Display
- **Badge** - Insignias y contadores
- **Tag** - Etiquetas
- **Avatar** - Avatares de usuario
- **Calendar** - Calendario
- **Card** - Tarjetas de contenido
- **Carousel** - Carrusel de imágenes
- **Collapse** - Paneles colapsables
- **Descriptions** - Lista de descripciones
- **Empty** - Estado vacío
- **Image** - Visor de imágenes
- **List** - Listas de datos
- **QRCode** - Códigos QR
- **Statistic** - Estadísticas
- **Table** - Tablas de datos
- **Timeline** - Línea de tiempo
- **Tree** - Estructura de árbol
- **Typography** - Tipografía

### Feedback
- **Alert** - Mensajes de alerta
- **Modal** - Ventanas modales
- **Message** - Mensajes globales
- **Notification** - Notificaciones
- **Progress** - Barras de progreso
- **Rate** - Calificaciones
- **Result** - Páginas de resultado
- **Skeleton** - Placeholders de carga
- **Spin** - Indicadores de carga

### Navigation
- **Menu** - Menús de navegación
- **Tabs** - Pestañas
- **Breadcrumb** - Migas de pan
- **Pagination** - Paginación
- **Steps** - Pasos de proceso
- **Affix** - Elementos fijos
- **Anchor** - Anclas de navegación
- **BackTop** - Botón volver arriba
- **FloatButton** - Botón flotante
- **Segmented** - Controles segmentados

### Overlay
- **Tooltip** - Información contextual
- **Popover** - Ventanas emergentes
- **Popconfirm** - Confirmación emergente
- **Drawer** - Paneles laterales
- **Dropdown** - Menús desplegables
- **Tour** - Tours guiados
- **Watermark** - Marcas de agua

## 🚀 Cómo Usar

### Instalación

\`\`\`bash
yarn add @designsystem/core
\`\`\`

### Uso Básico

\`\`\`tsx
import { Button, Input, Card } from '@designsystem/core';
import { ThemeProvider } from '@designsystem/core';

function App() {
  return (
    <ThemeProvider defaultTemplate="base">
      <Card title="Mi Aplicación">
        <Input placeholder="Ingresa tu nombre" />
        <Button type="primary">Enviar</Button>
      </Card>
    </ThemeProvider>
  );
}
\`\`\`

### Cambiar Template

Usa el selector de **Theme** en la toolbar superior de Storybook para probar diferentes templates.

\`\`\`tsx
<ThemeProvider defaultTemplate="spotify">
  {/* Tu aplicación */}
</ThemeProvider>
\`\`\`

## 📚 Documentación

Cada componente incluye:
- ✅ Ejemplos interactivos
- ✅ Props y API completa
- ✅ Links a documentación de Ant Design
- ✅ Análisis de accesibilidad

## 🎯 Herramientas de Storybook

- **Controls**: Edita props en tiempo real
- **Actions**: Ve eventos disparados
- **Viewport**: Prueba responsive
- **Backgrounds**: Cambia fondos
- **Accessibility**: Análisis WCAG
- **Theme Switcher**: Cambia entre templates

---

Explora los componentes en el menú lateral para ver ejemplos y documentación detallada.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Overview>;

export const Welcome: Story = {};
