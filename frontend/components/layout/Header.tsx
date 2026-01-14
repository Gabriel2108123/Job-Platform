'use client';

import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { isBusinessUser } from '@/lib/auth-helpers';
import { useRouter } from 'next/navigation';

export default function Header() {
  const user = getUser();
  const router = useRouter();
  const isBusiness = isBusinessUser();

  const handleLogout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('organizationId');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[var(--brand-navy)]">
              UK Hospitality Platform
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link 
              href="/jobs" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Jobs
            </Link>
            
            {user && !isBusiness && (
              <Link 
                href="/applications" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Applications
              </Link>
            )}

            {user && isBusiness && (
              <>
                <Link 
                  href="/business" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/business/jobs" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Jobs
                </Link>
              </>
            )}
            
            <Link 
              href="/employers" 
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              For Employers
            </Link>
            
            {user && (
              <Link 
                href="/billing/subscription" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Billing
              </Link>
            )}
            
            {!user ? (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-hover)] px-4 py-2 rounded-md text-sm font-medium"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
