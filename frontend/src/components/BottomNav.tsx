'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Megaphone, Bell } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/audience', icon: Users, label: 'Audience' },
  { href: '/content', icon: FileText, label: 'Content' },
  { href: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { href: '/reminders', icon: Bell, label: 'Reminders' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
