import React from 'react';
import Link from 'next/link';

interface HeaderProps {
  pathname: string;
}

export function Header({ pathname }: HeaderProps) {
  const getPageTitle = (path: string) => {
    if (path === '/') return 'DASHBOARD';
    const pathSegments = path.split('/').filter(segment => segment !== '');
    if (pathSegments.length > 0) {
      return pathSegments[pathSegments.length - 1].toUpperCase();
    }
    return '';
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background px-4 py-3 flex items-center shadow-sm">
      {/* Right section for the page title, centered within its available space */}
      <div className="flex-1 flex justify-center items-center">
        {pageTitle && <h1 className="text-xl font-bold">{pageTitle}</h1>}
      </div>

      <nav>
      </nav>
    </header>
  );
}
