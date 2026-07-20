'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Megaphone, Bell,
  Settings, HelpCircle, Zap, X, Menu, LogOut, ChevronDown, Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/audience', icon: Users, label: 'Audience Reach' },
  { href: '/content', icon: FileText, label: 'Content Quality' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/reminders', icon: Bell, label: 'Reminders' },
];

const secondaryItems = [
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/help', icon: HelpCircle, label: 'Help & Support' },
  { href: '/privacy', icon: Shield, label: 'Privacy Policy' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  // Don't render sidebar on login page
  if (pathname === '/login') return null;

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile hamburger */}
      <button
        className="hamburger-btn"
        style={{ position: 'fixed', top: 12, left: 12, zIndex: 150 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap size={20} color="white" fill="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Social94</span>
            <span className="sidebar-logo-subtitle">Marketing AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main Menu</span>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className="sidebar-link-icon" />
                {label}
              </Link>
            );
          })}

          <span className="sidebar-section-label" style={{ marginTop: '8px' }}>General</span>
          {secondaryItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} className="sidebar-link-icon" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Banner */}
        <div style={{ padding: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>✨ Powered by Gemini AI</div>
            <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '12px' }}>Unlock unlimited AI analysis</div>
            <button style={{
              background: 'white', color: '#7C3AED', border: 'none',
              borderRadius: '8px', padding: '7px 14px', fontSize: '12px',
              fontWeight: 700, cursor: 'pointer', width: '100%',
            }}>
              Upgrade Pro
            </button>
          </div>
        </div>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div className="sidebar-avatar">{initials}</div>
              )}
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.displayName || 'User'}</div>
                <div className="sidebar-user-role">{user?.email || ''}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '6px',
                borderRadius: 'var(--radius-sm)', flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-rose)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-rose-light)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.background = 'none'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
