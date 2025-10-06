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
export declare const useTheme: () => import('../providers/ThemeProvider').ThemeContextType;
//# sourceMappingURL=useTheme.d.ts.map