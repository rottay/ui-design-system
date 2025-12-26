'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const categories = [
  { name: 'Display', slug: 'display', components: ['Avatar', 'Badge', 'Card', 'Image', 'Tag', 'Tooltip', 'Typography'] },
  { name: 'Inputs', slug: 'inputs', components: ['Button', 'Input', 'Select', 'Checkbox', 'Radio', 'Switch'] },
  { name: 'Feedback', slug: 'feedback', components: ['Alert', 'Modal', 'Progress', 'Skeleton', 'Spinner'] },
  { name: 'Layout', slug: 'layout', components: ['Box', 'Stack', 'Grid', 'Flex', 'Container', 'Divider'] },
  { name: 'Navigation', slug: 'navigation', components: ['Tabs', 'Breadcrumb', 'Pagination', 'Menu', 'Steps'] },
  { name: 'Overlay', slug: 'overlay', components: ['Dropdown', 'Popover', 'Drawer', 'Tour'] },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen overflow-y-auto fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="font-bold text-lg">Rottay DS</span>
        </Link>
      </div>

      <nav className="px-4 pb-6">
        <Link
          href="/"
          className={`block px-3 py-2 rounded-lg mb-2 transition-colors ${
            pathname === '/'
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Overview
        </Link>

        {categories.map((category) => (
          <div key={category.slug} className="mb-4">
            <Link
              href={`/${category.slug}`}
              className={`block px-3 py-2 font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 ${
                pathname === `/${category.slug}` ? 'text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              {category.name}
            </Link>
            <ul className="ml-2 mt-1 space-y-1">
              {category.components.map((component) => (
                <li key={component}>
                  <Link
                    href={`/${category.slug}/${component.toLowerCase()}`}
                    className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                      pathname === `/${category.slug}/${component.toLowerCase()}`
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {component}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="ml-64 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
