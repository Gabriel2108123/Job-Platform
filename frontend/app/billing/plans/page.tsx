'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PlansComponent from '@/components/billing/PlansComponent';
import { User } from '@/lib/types/auth';

export default function PlansPage() {
  const [user, setUser] = useState<User | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user from localStorage (in production, this would come from a context/session)
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
      setOrganizationId(userData.organizationId || '');
      setLoading(false);
    } catch {
      router.push('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <PlansComponent user={user} organizationId={organizationId} />;
}
