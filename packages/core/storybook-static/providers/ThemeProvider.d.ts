import { default as React } from '../../../../node_modules/react';
import { TemplateName } from '../themes/types';

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
export declare const ThemeContext: React.Context<ThemeContextType | null>;
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
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
//# sourceMappingURL=ThemeProvider.d.ts.map