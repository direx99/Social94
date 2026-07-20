'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Zap, TrendingUp, Users, Megaphone, Bell } from 'lucide-react';

const features = [
  { icon: Users, label: 'Audience Reach', desc: 'Track followers & demographics across all platforms' },
  { icon: TrendingUp, label: 'Content Quality', desc: 'AI-powered post scoring & hashtag suggestions' },
  { icon: Megaphone, label: 'Campaigns', desc: 'Manage & automate social media campaigns' },
  { icon: Bell, label: 'Reminders', desc: 'Never miss a post with smart automated reminders' },
];

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch {
      setError('Sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg-base)',
    }}>
      {/* Left — Brand Panel */}
      <div style={{
        background: 'linear-gradient(145deg, #5B21B6 0%, #7C3AED 40%, #06B6D4 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', top: '50%', right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
          <div style={{
            width: 48, height: 48,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Social94</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Marketing AI</div>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '40px', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-1px' }}>
          Automate Your<br />Social Media<br />Marketing
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '48px', maxWidth: '360px' }}>
          AI-powered platform to analyze content, reach more people, run campaigns, and never miss a post.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, backdropFilter: 'blur(4px)',
              }}>
                <Icon size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Powered by */}
        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={13} />
            Powered by Gemini 2.0 Flash AI
          </div>
        </div>
      </div>

      {/* Right — Login Panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 56px',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '30px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.5px' }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Sign in to your Social94 dashboard and start managing your social media smarter.
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '14px 24px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                (e.currentTarget as HTMLElement).style.borderColor = '#7C3AED';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
          >
            {loading ? (
              <div className="spinner spinner-sm" />
            ) : (
              /* Google logo SVG */
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'var(--accent-rose-light)',
              color: 'var(--accent-rose)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>By continuing, you agree to our</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
          </p>

          {/* Stats row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '48px',
            padding: '20px',
            background: 'var(--bg-base)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}>
            {[
              { value: '10K+', label: 'Marketers' },
              { value: '2M+', label: 'Posts Analyzed' },
              { value: '98%', label: 'Satisfaction' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="padding: 60px 56px"][style*="background: linear-gradient"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
