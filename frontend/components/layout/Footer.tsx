'use client';

import { useState, useEffect } from 'react';
import { getUser, isLoggedIn } from '@/lib/auth';
import { UserRole } from '@/lib/types/auth';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const user = getUser();
    setLoggedIn(isLoggedIn());
    setUserRole(user?.role || null);
  }, []);

  // Determine what to show based on user state
  const isCandidate = userRole === UserRole.Candidate;
  const isBusiness = userRole === UserRole.BusinessOwner || userRole === UserRole.Staff;
  const isVisitor = !loggedIn;

  // For visitors, redirect to register page
  const getLink = (originalPath: string) => {
    return isVisitor ? '/register' : originalPath;
  };

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

          {/* For Job Seekers - shown to visitors and candidates, hidden from business users */}
          {(isVisitor || isCandidate) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                For Job Seekers
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href={getLink('/jobs')} className="text-gray-600 hover:text-gray-900">
                    Browse Jobs
                  </a>
                </li>
                <li>
                  <a href={getLink('/profile')} className="text-gray-600 hover:text-gray-900">
                    Create Profile
                  </a>
                </li>
                <li>
                  <a href={getLink('/dashboard/cv-builder')} className="text-gray-600 hover:text-gray-900">
                    CV Builder
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* For Employers - shown to visitors and business users, hidden from candidates */}
          {(isVisitor || isBusiness) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                For Employers
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href={getLink('/business/jobs/new')} className="text-gray-600 hover:text-gray-900">
                    Post a Job
                  </a>
                </li>
                <li>
                  <a href={getLink('/billing/plans')} className="text-gray-600 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href={getLink('/business')} className="text-gray-600 hover:text-gray-900">
                    Business Dashboard
                  </a>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="/support" className="text-gray-600 hover:text-gray-900">
                  Support
                </a>
              </li>
              <li>
                <a href="/support/tickets" className="text-gray-600 hover:text-gray-900">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Legal
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2">
              <a href="/legal/terms" className="text-gray-600 hover:text-gray-900">
                Terms & Conditions
              </a>
              <a href="/legal/privacy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="/legal/cookies" className="text-gray-600 hover:text-gray-900">
                Cookie Policy
              </a>
              <a href="/legal/subscription" className="text-gray-600 hover:text-gray-900">
                Subscription Contract
              </a>
              <a href="/legal/acceptable-use" className="text-gray-600 hover:text-gray-900">
                Acceptable Use Policy
              </a>
              <a href="/legal/dpa" className="text-gray-600 hover:text-gray-900">
                Data Processing Agreement
              </a>
              <a href="/legal/dispute" className="text-gray-600 hover:text-gray-900">
                Dispute Resolution
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} YokeConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
