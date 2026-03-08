'use client';

import { useEffect, useState } from 'react';

export function EnvironmentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // In dev/staging, verification might be turned off based on backend config
    fetch('/api/system/config')
      .then(async (res) => {
        if (!res.ok) throw new Error('System config route unavailable');
        return res.json();
      })
      .then((data) => {
        if (data?.featureFlags?.RequireEmailVerification === false) {
          setShowBanner(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load system config for EnvironmentBanner', err);
      });
  }, []);

  if (!showBanner) return null;

  return (
    <div className="bg-yellow-500 text-black font-semibold text-center text-sm py-2 w-full fixed top-0 left-0 z-50">
      Testing mode: Email verification is bypassed
    </div>
  );
}
