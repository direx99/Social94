'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Zap } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  // Loading screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        gap: '16px',
      }}>
        <div style={{
          width: 56,
          height: 56,
          background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
        }}>
          <Zap size={28} color="white" fill="white" />
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
          Social94
        </div>
        <div className="spinner" />
      </div>
    );
  }

  // On login page, always render
  if (pathname === '/login') return <>{children}</>;

  // Authenticated
  if (user) return <>{children}</>;

  // Redirecting — render nothing
  return null;
}
