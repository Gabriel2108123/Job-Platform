'use client';

import { useState, useEffect, useCallback } from 'react';
import { setCurrentUser, clearCurrentUser } from '@/lib/auth-helpers';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface TestUser {
  label: string;
  email: string;
  password: string;
  role: 'Admin' | 'BusinessOwner' | 'Candidate';
  color: string;
  icon: string;
  description: string;
}

// ─── Test Accounts ────────────────────────────────────────────────────────────
// Sourced from DataSeedingService.cs (auto-seeded at backend startup).
// Add new entries here — they appear in the dropdown automatically.
const TEST_USERS: TestUser[] = [
  // ── Admin ──
  {
    label: 'Admin — Test',
    email: 'admin@test.com',
    password: 'Test1234!',
    role: 'Admin',
    color: '#8b5cf6',
    icon: '🛡️',
    description: 'admin@test.com  ·  Full platform admin',
  },
  // ── Business Owners ──
  {
    label: 'Business — Test Hotel & Spa',
    email: 'business@test.com',
    password: 'Test1234!',
    role: 'BusinessOwner',
    color: '#f59e0b',
    icon: '�',
    description: 'business@test.com  ·  Seeded org account',
  },
  {
    label: 'Business — The Grand Hotel',
    email: 'employer@test.com',
    password: 'Test1234!',
    role: 'BusinessOwner',
    color: '#fb923c',
    icon: '�',
    description: 'employer@test.com  ·  Dev session account',
  },
  // ── Candidates ──
  {
    label: 'Candidate — Test User',
    email: 'candidate@test.com',
    password: 'Test1234!',
    role: 'Candidate',
    color: '#10b981',
    icon: '🧑‍💼',
    description: 'candidate@test.com  ·  Seeded with work history',
  },
];


const REDIRECT_FOR_ROLE: Record<string, string> = {
  Admin: '/admin',
  BusinessOwner: '/business',
  Candidate: '/dashboard',
};

export default function DevTools() {
  const [open, setOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string>(TEST_USERS[0].email);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [currentUser, setLocalUser] = useState<any>(null);
  const router = useRouter();

  const refreshUser = useCallback(() => {
    if (typeof window !== 'undefined') {
      const uStr = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      if (uStr) {
        try {
          const u = JSON.parse(uStr);
          setLocalUser({ ...u, role });
        } catch {
          setLocalUser(null);
        }
      } else {
        setLocalUser(null);
      }
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const selectedUser = TEST_USERS.find((u) => u.email === selectedEmail) ?? TEST_USERS[0];

  const handleLogin = async () => {
    const user = selectedUser;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ type: 'error', msg: data.error || 'Login failed' });
        return;
      }

      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        emailVerified: data.user.emailVerified ?? true,
        name: [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || data.user.email,
        role: data.user.role,
        organizationId: data.user.organizationId,
      }, data.token);

      refreshUser();
      setStatus({ type: 'success', msg: `Logged in as ${user.label}` });

      const redirect = REDIRECT_FOR_ROLE[user.role] ?? '/dashboard';
      router.push(redirect);
      router.refresh();
    } catch {
      setStatus({ type: 'error', msg: 'Network error — is the backend running?' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearCurrentUser();
    refreshUser();
    setStatus({ type: 'success', msg: 'Logged out' });
    router.push('/');
    router.refresh();
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        id="dev-tools-toggle"
        onClick={() => setOpen((o) => !o)}
        title="Dev Tools"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          border: '2px solid rgba(99,102,241,0.6)',
          color: '#fff',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        aria-label="Toggle Dev Tools"
      >
        {open ? '✕' : '⚙'}
      </button>

      {/* Panel */}
      {open && (
        <div
          id="dev-tools-panel"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 9998,
            width: '320px',
            background: 'linear-gradient(160deg, #0f0c29 0%, #1a1040 50%, #0f0c29 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px 12px',
              background: 'rgba(99,102,241,0.15)',
              borderBottom: '1px solid rgba(99,102,241,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '16px' }}>🔧</span>
            <span style={{ color: '#c7d2fe', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>
              DEV TOOLS
            </span>
            <span
              style={{
                background: 'rgba(99,102,241,0.3)',
                color: '#a5b4fc',
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              DEV ONLY
            </span>
          </div>

          {/* Current user */}
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#a5b4fc', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Logged in as
                  </div>
                  <div style={{ color: '#e0e7ff', fontSize: '12px', fontWeight: 500, marginTop: '2px' }}>
                    {currentUser.name || currentUser.email}
                  </div>
                  <div style={{ color: '#6366f1', fontSize: '11px' }}>{currentUser.role}</div>
                </div>
                <button
                  id="dev-tools-logout"
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5',
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic' }}>Not logged in</div>
            )}
          </div>

          {/* Quick Login */}
          <div style={{ padding: '14px 16px' }}>
            <div
              style={{
                color: '#6b7280',
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '10px',
              }}
            >
              Quick Login
            </div>

            {/* Account selector */}
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <select
                id="dev-tools-account-select"
                value={selectedEmail}
                onChange={(e) => {
                  setSelectedEmail(e.target.value);
                  setStatus(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 36px 10px 14px',
                  background: `linear-gradient(135deg, ${selectedUser.color}18 0%, ${selectedUser.color}08 100%)`,
                  border: `1px solid ${selectedUser.color}50`,
                  borderRadius: '10px',
                  color: '#e0e7ff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  outline: 'none',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {TEST_USERS.map((u) => (
                  <option key={u.email} value={u.email} style={{ background: '#1a1040', color: '#e0e7ff' }}>
                    {u.icon}  {u.label}
                  </option>
                ))}
              </select>
              {/* Custom chevron */}
              <div
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#6b7280',
                  fontSize: '12px',
                }}
              >
                ▾
              </div>
            </div>

            {/* Selected account preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                marginBottom: '10px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: selectedUser.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#9ca3af', fontSize: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedUser.description}
                </div>
                <div style={{ color: selectedUser.color, fontSize: '10px', fontWeight: 600 }}>
                  {selectedUser.role}
                </div>
              </div>
            </div>

            {/* Login button */}
            <button
              id="dev-tools-login-btn"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: loading
                  ? 'rgba(99,102,241,0.2)'
                  : `linear-gradient(135deg, ${selectedUser.color}cc 0%, ${selectedUser.color}99 100%)`,
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                boxShadow: loading ? 'none' : `0 4px 14px ${selectedUser.color}40`,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: '13px',
                      height: '13px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Logging in…
                </>
              ) : (
                <>
                  {selectedUser.icon} Login as {selectedUser.label.split(' — ')[0].split(' ').slice(0, 2).join(' ')}
                </>
              )}
            </button>
          </div>

          {/* Status */}
          {status && (
            <div
              style={{
                margin: '0 16px 14px',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                background: status.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${status.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: status.type === 'success' ? '#6ee7b7' : '#fca5a5',
              }}
            >
              {status.type === 'success' ? '✅' : '❌'} {status.msg}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(0,0,0,0.3)',
              color: '#374151',
              fontSize: '10px',
              textAlign: 'center',
            }}
          >
            Only visible in development mode · {TEST_USERS.length} accounts
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        #dev-tools-login-btn:hover:not(:disabled) { filter: brightness(1.15); transform: translateY(-1px); }
        #dev-tools-account-select:focus { box-shadow: 0 0 0 2px rgba(99,102,241,0.4); }
      `}</style>
    </>
  );
}
