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
        <img src="/icons/facebook.png" alt="Facebook" width={s} height={s} style={{ borderRadius: 6, objectFit: 'cover' }} />
      );

    case 'Instagram':
      return (
        <img src="/icons/instagram.png" alt="Instagram" width={s} height={s} style={{ borderRadius: 6, objectFit: 'cover' }} />
      );

    case 'TikTok':
      return (
        <img src="/icons/tiktok.png" alt="TikTok" width={s} height={s} style={{ borderRadius: 6, objectFit: 'cover' }} />
      );

    case 'YouTube':
      return (
        <img src="/icons/youtube.png" alt="YouTube" width={s} height={s} style={{ borderRadius: 6, objectFit: 'cover' }} />
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
