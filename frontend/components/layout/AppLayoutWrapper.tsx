'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import Footer from './Footer';

/**
 * Wrapper to conditionally render the top navigation and footer.
 * Only pages outside of the authenticated AppShell get the top Nav + Footer.
 */
export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';

    // Determine if this is an app route based on the URL prefix
    const isAppRoute = /^\/(candidate|business|admin|support)/.test(pathname);

    if (isAppRoute) {
        return <main className="flex-1 flex flex-col">{children}</main>;
    }

    return (
        <>
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
        </>
    );
}
