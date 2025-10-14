import { useContext } from 'react';
import { ToastContext } from './ToastProvider';

/**
 * Hook to access toast functionality
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast();
 *
 *   return (
 *     <div>
 *       <button onClick={() => toast.success('Success!')}>
 *         Show Success Toast
 *       </button>
 *
 *       <button onClick={() => toast.error('Error occurred', {
 *         description: 'Something went wrong',
 *         duration: 10000,
 *       })}>
 *         Show Error Toast
 *       </button>
 *
 *       <button onClick={() => {
 *         const id = toast.loading('Processing...');
 *         // Do async work...
 *         setTimeout(() => {
 *           toast.dismiss(id);
 *           toast.success('Done!');
 *         }, 2000);
 *       }}>
 *         Show Loading Toast
 *       </button>
 *
 *       <button onClick={() => toast.info('Info message', {
 *         action: {
 *           label: 'Undo',
 *           onClick: () => console.log('Undo clicked'),
 *         },
 *       })}>
 *         Show Toast with Action
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used within ToastProvider. ' +
      'Make sure to wrap your app with <ToastProvider>.'
    );
  }

  return context;
};
