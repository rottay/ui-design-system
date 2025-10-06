import React, { createContext, useState } from 'react';
import { ConfigProvider } from 'antd';
import { templates } from '../themes';
import type { TemplateName } from '../themes/types';

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
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTemplate = 'base',
}) => {
  const [template, setTemplate] = useState<TemplateName>(defaultTemplate);

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
