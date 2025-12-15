import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-muted sm:flex shadow-sm">
      <div className="flex items-center justify-center h-16"> {/* This will be the AI Study Buddy area */}
        <Link href="/" className="flex items-center space-x-2 font-semibold">
          <span className="text-xl font-bold">AI Study Buddy</span>
        </Link>
      </div>
      <nav className="flex flex-col p-4 flex-1 h-full"> {/* Nav starts below the logo area, removed top padding as logo div has its own padding */}
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
