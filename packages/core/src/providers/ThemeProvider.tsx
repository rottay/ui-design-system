import React, { createContext, useState, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { templates } from '../themes';
import type { TemplateName } from '../themes/types';

/**
 * Key para almacenar el tema en localStorage
 */
const STORAGE_KEY = 'designsystem-theme';

/**
 * Context type (exportado para useTheme)
 */
export interface ThemeContextType {
  template: TemplateName;
  setTemplate: (template: TemplateName) => void;
}

/**
 * Context para compartir el template activo
 */
export const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Props del ThemeProvider
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTemplate?: TemplateName;
}

/**
 * ThemeProvider - Gestiona el template activo y aplica estilos
 * Con persistencia automática en localStorage
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTemplate = 'base',
}) => {
  // Inicializar desde localStorage o usar defaultTemplate
  const [template, setTemplate] = useState<TemplateName>(() => {
    // Solo en el cliente (evita errores en SSR)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        // Validar que el tema guardado sea válido
        if (saved && templates[saved as TemplateName]) {
          return saved as TemplateName;
        }
      } catch (error) {
        console.warn('Error reading theme from localStorage:', error);
      }
    }
    return defaultTemplate;
  });

  // Guardar en localStorage cuando cambia el tema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, template);
      } catch (error) {
        console.warn('Error saving theme to localStorage:', error);
      }
    }
  }, [template]);

  const themeConfig = templates[template];

  const contextValue = {
    template,
    setTemplate,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

ThemeProvider.displayName = 'ThemeProvider';
