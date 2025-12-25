import { useContext } from 'react';
import { ThemeContext } from '../providers/ThemeProvider';

/**
 * Hook para acceder y cambiar el template activo
 *
 * @example
 * ```tsx
 * function ThemeSwitcher() {
 *   const { template, setTemplate } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTemplate('spotify')}>
 *       Template actual: {template}
 *     </button>
 *   );
 * }
 * ```
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme debe ser usado dentro de un ThemeProvider. ' +
      'Asegúrate de envolver tu app con <ThemeProvider>.'
    );
  }

  return context;
};
