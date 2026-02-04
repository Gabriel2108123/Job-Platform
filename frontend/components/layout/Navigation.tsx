'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isLoggedIn, getUser } from '@/lib/auth';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/Button';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { ROLE_NAVIGATION, getRoleDisplayName, getRoleColor } from '@/lib/roles';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, loading, displayName } = useUserRole();
  const [loggedIn, setLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [pathname]);

  const handleLogout = () => {
    authApi.logout();
    // Use hard reload to ensure all React state and forms are completely cleared
    window.location.href = '/login';
  };

  const publicLinks = [
    { href: '/', label: 'Home', icon: 'home' },
    { href: '/jobs', label: 'Jobs', icon: 'briefcase' },
    { href: '/waitlist', label: 'Join Waitlist', icon: 'inbox' },
  ];

  // Get role-specific navigation from role system
  const navLinks = loggedIn && role && ROLE_NAVIGATION[role] ? ROLE_NAVIGATION[role] : publicLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="text-xl font-bold text-[var(--brand-navy)] group-hover:text-[var(--brand-primary)] transition-colors">
                YokeConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${pathname === link.href
                  ? 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                  : 'text-gray-700 hover:text-[var(--brand-primary)] hover:bg-gray-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Info & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!loggedIn ? (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {!loading && role && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md text-sm">
                    <span className="text-gray-600">{displayName}</span>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-[var(--brand-primary)] p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === link.href
                  ? 'text-[var(--brand-primary)] bg-[var(--brand-primary)]/10'
                  : 'text-gray-700 hover:text-[var(--brand-primary)] hover:bg-gray-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 mt-4">
              {!loggedIn ? (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full mb-2">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
