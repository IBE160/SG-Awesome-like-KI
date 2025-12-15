import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-white sm:flex shadow-sm top-16">
      <nav className="flex flex-col p-4 flex-1 h-full">
        <div className="flex flex-col gap-1">
          <Button variant="default" asChild className="justify-start shadow-sm hover:bg-primary/90">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
          <Button variant="default" asChild className="justify-start shadow-sm hover:bg-primary/90">
            <Link href="/classes">
              Classes
            </Link>
          </Button>
          <Button variant="default" asChild className="justify-start shadow-sm hover:bg-primary/90">
            <Link href="/upload">
              Upload
            </Link>
          </Button>
          <Button variant="default" asChild className="justify-start shadow-sm hover:bg-primary/90">
            <Link href="/unorganized">
              Unorganized Content
            </Link>
          </Button>
          <Button variant="default" asChild className="justify-start shadow-sm hover:bg-primary/90">
            <Link href="/profile">
              Profile
            </Link>
          </Button>
        </div>

        <form action="/auth/sign-out" method="post" className="mt-auto pb-4">
          <Button
            className="w-full justify-start cursor-pointer text-red-600"
            variant="ghost"
            type="submit"
          >
            Log out
          </Button>
        </form>
      </nav>
    </aside>
  );
}
