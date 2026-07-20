import React from 'react';

export type SupportedPlatform = 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'All Platforms';

interface PlatformIconProps {
  platform: SupportedPlatform | string;
  size?: number;
}

export const PLATFORM_CONFIG: Record<string, { color: string; bg: string; gradient?: string }> = {
  Facebook: {
    color: '#1877F2',
    bg: '#E7F0FD',
  },
  Instagram: {
    color: '#E1306C',
    bg: '#FFF0F6',
    gradient: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)',
  },
  TikTok: {
    color: '#010101',
    bg: '#F0F0F0',
  },
  YouTube: {
    color: '#FF0000',
    bg: '#FFE9E9',
  },
  'All Platforms': {
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
};

export const SUPPORTED_PLATFORMS: SupportedPlatform[] = [
  'Facebook',
  'Instagram',
  'TikTok',
  'YouTube',
];

// Real SVG brand logos
export function PlatformIcon({ platform, size = 24 }: PlatformIconProps) {
  const s = size;

  switch (platform) {
    case 'Facebook':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#1877F2" />
          <path
            d="M16.5 12H13.5V10.5C13.5 9.672 13.672 9 14.5 9H16V6.5H13.5C11.567 6.5 10 8.067 10 10V12H8V14.5H10V22H13.5V14.5H15.5L16.5 12Z"
            fill="white"
          />
        </svg>
      );

    case 'Instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F58529" />
              <stop offset="30%" stopColor="#DD2A7B" />
              <stop offset="65%" stopColor="#8134AF" />
              <stop offset="100%" stopColor="#515BD4" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig-gradient)" />
          <rect x="6.5" y="6.5" width="11" height="11" rx="3.5" stroke="white" strokeWidth="1.8" fill="none" />
          <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.8" fill="none" />
          <circle cx="16.2" cy="7.8" r="1" fill="white" />
        </svg>
      );

    case 'TikTok':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#010101" />
          <path
            d="M16.5 5h-2.2v9.4a2.3 2.3 0 01-2.3 2 2.3 2.3 0 01-2.3-2.3 2.3 2.3 0 012.3-2.3c.22 0 .43.03.63.08V9.56a4.6 4.6 0 00-.63-.04 4.5 4.5 0 00-4.5 4.5 4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5V9.2a6.34 6.34 0 003.5 1.06V8.1a4.14 4.14 0 01-3.5-3.1z"
            fill="white"
          />
          <path
            d="M16.8 5h-2.5v9.4a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2c.2 0 .38.03.56.07V10.1a4.8 4.8 0 00-.56-.03 4.8 4.8 0 00-4.8 4.8 4.8 4.8 0 004.8 4.8 4.8 4.8 0 004.8-4.8V9.5a6.6 6.6 0 003.4.95V8.05a4.4 4.4 0 01-3.7-3.05z"
            fill="#69C9D0"
            opacity="0.8"
          />
        </svg>
      );

    case 'YouTube':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#FF0000" />
          <path
            d="M19.8 8.2a2 2 0 00-1.4-1.4C17.1 6.5 12 6.5 12 6.5s-5.1 0-6.4.3a2 2 0 00-1.4 1.4C4 9.5 4 12 4 12s0 2.5.2 3.8a2 2 0 001.4 1.4c1.3.3 6.4.3 6.4.3s5.1 0 6.4-.3a2 2 0 001.4-1.4C20 14.5 20 12 20 12s0-2.5-.2-3.8z"
            fill="white"
          />
          <path d="M10.2 14.5l4.3-2.5-4.3-2.5v5z" fill="#FF0000" />
        </svg>
      );

    case 'All Platforms':
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#7C3AED" />
          <circle cx="8" cy="8" r="2.5" fill="white" opacity="0.9" />
          <circle cx="16" cy="8" r="2.5" fill="white" opacity="0.9" />
          <circle cx="8" cy="16" r="2.5" fill="white" opacity="0.9" />
          <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.9" />
        </svg>
      );

    default:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#94A3B8" />
          <circle cx="12" cy="12" r="4" fill="white" />
        </svg>
      );
  }
}

// Pill badge with platform icon + name
export function PlatformBadge({ platform, size = 'md' }: { platform: string; size?: 'sm' | 'md' }) {
  const cfg = PLATFORM_CONFIG[platform] ?? PLATFORM_CONFIG['All Platforms'];
  const iconSize = size === 'sm' ? 14 : 18;
  const padding = size === 'sm' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'sm' ? '11px' : '13px';
  const gap = size === 'sm' ? '5px' : '7px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap,
      padding,
      borderRadius: '9999px',
      background: cfg.bg,
      color: cfg.color,
      fontSize,
      fontWeight: 600,
      border: `1px solid ${cfg.color}22`,
    }}>
      <PlatformIcon platform={platform} size={iconSize} />
      {platform}
    </span>
  );
}
