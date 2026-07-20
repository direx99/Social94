import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SocialProfileData {
  platform: 'facebook' | 'tiktok' | 'youtube';
  username: string;
  followers: number;   // subscribers for YouTube
  following?: number;
  posts?: number;
  fullName: string;
  bio: string;
  engagementEstimate: number | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseCount(raw: string): number {
  if (!raw) return 0;
  const clean = raw.replace(/,/g, '').trim();
  if (/B$/i.test(clean)) return Math.round(parseFloat(clean) * 1_000_000_000);
  if (/M$/i.test(clean)) return Math.round(parseFloat(clean) * 1_000_000);
  if (/K$/i.test(clean)) return Math.round(parseFloat(clean) * 1_000);
  return parseInt(clean, 10) || 0;
}

function extractMeta(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta\\s+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }
  return '';
}

function engagementByFollowers(count: number): number {
  if (count < 10_000) return 5.8;
  if (count < 100_000) return 3.2;
  if (count < 1_000_000) return 1.9;
  return 0.8;
}

// ─── Facebook scraper ─────────────────────────────────────────────────────────

async function scrapeFacebook(input: string): Promise<SocialProfileData> {
  // Parse username / page slug from input
  const trimmed = input.trim().replace(/\/$/, '');
  let slug = trimmed;
  const urlMatch = trimmed.match(/facebook\.com\/([^/?#\s]+)/i);
  if (urlMatch) slug = urlMatch[1];
  else if (trimmed.startsWith('@')) slug = trimmed.slice(1);

  const profileUrl = `https://www.facebook.com/${slug}`;

  const res = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `Facebook page "@${slug}" not found.`
        : `Facebook returned HTTP ${res.status}. Please enter manually.`,
    );
  }

  const html = await res.text();

  // og:description often: "X followers · Y likes · ..."  or "X people follow this"
  const desc = extractMeta(html, 'og:description');
  const ogTitle = extractMeta(html, 'og:title');

  let followers = 0;

  // "123,456 followers" / "1.2M followers"
  const followerMatch = desc.match(/([\d,.]+[KkMmBb]?)\s*(?:followers|people follow)/i);
  if (followerMatch) followers = parseCount(followerMatch[1]);

  // Also try from page source — "follower_count":12345
  const fcMatch = html.match(/"follower_count"\s*:\s*(\d+)/);
  if (fcMatch && followers === 0) followers = parseInt(fcMatch[1], 10);

  // Likes count as fallback
  if (followers === 0) {
    const likesMatch = desc.match(/([\d,.]+[KkMmBb]?)\s*(?:likes|like this)/i);
    if (likesMatch) followers = parseCount(likesMatch[1]);
  }

  if (followers === 0) {
    throw new Error("Couldn't extract follower data from Facebook. The page may be private or Facebook is blocking automated requests.");
  }

  return {
    platform: 'facebook',
    username: slug,
    followers,
    fullName: ogTitle.replace(/\s*[|\-–].*$/, '').trim(),
    bio: desc,
    engagementEstimate: engagementByFollowers(followers),
  };
}

// ─── TikTok scraper ───────────────────────────────────────────────────────────

async function scrapeTikTok(input: string): Promise<SocialProfileData> {
  const trimmed = input.trim().replace(/\/$/, '');
  let username = trimmed;
  const urlMatch = trimmed.match(/tiktok\.com\/@([^/?#\s]+)/i);
  if (urlMatch) username = urlMatch[1];
  else if (trimmed.startsWith('@')) username = trimmed.slice(1);
  else {
    const plain = trimmed.match(/^[A-Za-z0-9._]+$/);
    if (plain) username = trimmed;
  }

  const profileUrl = `https://www.tiktok.com/@${username}`;

  const res = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://www.tiktok.com/',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `TikTok profile "@${username}" not found.`
        : `TikTok returned HTTP ${res.status}. Please enter manually.`,
    );
  }

  const html = await res.text();

  // og:description: "X Followers, Y Following, Z Likes | Watch the latest..."
  const desc = extractMeta(html, 'og:description');
  const ogTitle = extractMeta(html, 'og:title');

  let followers = 0;

  const followerMatch = desc.match(/([\d,.]+[KkMmBb]?)\s*Followers?/i);
  if (followerMatch) followers = parseCount(followerMatch[1]);

  // Try __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON blob
  if (followers === 0) {
    const jsonMatch = html.match(/"followerCount"\s*:\s*(\d+)/);
    if (jsonMatch) followers = parseInt(jsonMatch[1], 10);
  }

  // Try stats from script tags: "stats":{"followerCount":123}
  if (followers === 0) {
    const statsMatch = html.match(/"stats"\s*:\s*\{[^}]*"followerCount"\s*:\s*(\d+)/);
    if (statsMatch) followers = parseInt(statsMatch[1], 10);
  }

  if (followers === 0) {
    throw new Error("Couldn't extract follower data from TikTok. The profile may be private or TikTok is blocking automated requests.");
  }

  let likes = 0;
  const likesMatch = desc.match(/([\d,.]+[KkMmBb]?)\s*Likes?/i);
  if (likesMatch) likes = parseCount(likesMatch[1]);

  // Rough engagement: likes/followers * some multiplier
  const engagementEstimate = followers > 0 && likes > 0
    ? Math.min(Math.round((likes / followers) * 10) / 10, 25)
    : engagementByFollowers(followers);

  return {
    platform: 'tiktok',
    username,
    followers,
    fullName: ogTitle.replace(/\s*[|\-–].*$/, '').replace(/^@/, '').trim(),
    bio: desc,
    engagementEstimate,
  };
}

// ─── YouTube scraper ──────────────────────────────────────────────────────────

async function scrapeYouTube(input: string): Promise<SocialProfileData> {
  const trimmed = input.trim().replace(/\/$/, '');
  let channelPath = trimmed;

  // Normalize URL formats: /@handle, /channel/ID, /c/name, /user/name
  const urlMatch = trimmed.match(/youtube\.com\/((?:@|channel\/|c\/|user\/)[^/?#\s]+)/i);
  if (urlMatch) {
    channelPath = urlMatch[1];
  } else if (trimmed.startsWith('@')) {
    channelPath = trimmed; // keep @handle
  } else if (!trimmed.includes('/')) {
    channelPath = `@${trimmed}`; // treat as handle
  }

  const profileUrl = `https://www.youtube.com/${channelPath}`;

  const res = await fetch(profileUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `YouTube channel "${channelPath}" not found.`
        : `YouTube returned HTTP ${res.status}. Please enter manually.`,
    );
  }

  const html = await res.text();

  const ogTitle = extractMeta(html, 'og:title');
  const desc = extractMeta(html, 'og:description');

  let subscribers = 0;

  // subscriberCountText in ytInitialData: "12.5M subscribers"
  const subMatch = html.match(/"subscriberCountText"\s*:\s*\{[^}]*"simpleText"\s*:\s*"([^"]+)"/);
  if (subMatch) {
    const subText = subMatch[1]; // e.g. "12.5M subscribers"
    const countMatch = subText.match(/([\d,.]+[KkMmBb]?)/i);
    if (countMatch) subscribers = parseCount(countMatch[1]);
  }

  // Fallback: "subscribers":12345 (older format)
  if (subscribers === 0) {
    const fallback = html.match(/"subscriberCount"\s*:\s*"?([\d,.]+[KkMmBb]?)"/i);
    if (fallback) subscribers = parseCount(fallback[1]);
  }

  // Fallback: meta description sometimes contains "Xsubscribers"
  if (subscribers === 0) {
    const metaMatch = desc.match(/([\d,.]+[KkMmBb]?)\s*subscribers?/i);
    if (metaMatch) subscribers = parseCount(metaMatch[1]);
  }

  if (subscribers === 0) {
    throw new Error("Couldn't extract subscriber data from YouTube. The channel may be private or YouTube is blocking automated requests.");
  }

  // YouTube engagement estimate (views per video / subscribers is hard to get without API)
  const engagementEstimate = engagementByFollowers(subscribers);

  return {
    platform: 'youtube',
    username: channelPath,
    followers: subscribers,
    fullName: ogTitle.replace(/\s*-\s*YouTube$/, '').trim(),
    bio: desc,
    engagementEstimate,
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: string = body.url ?? body.username ?? '';
    const platform: string = (body.platform ?? '').toLowerCase();

    if (!input.trim()) {
      return NextResponse.json({ success: false, error: 'URL or username is required' }, { status: 400 });
    }
    if (!['facebook', 'tiktok', 'youtube'].includes(platform)) {
      return NextResponse.json({ success: false, error: 'platform must be facebook, tiktok, or youtube' }, { status: 400 });
    }

    let data: SocialProfileData;

    if (platform === 'facebook') data = await scrapeFacebook(input);
    else if (platform === 'tiktok') data = await scrapeTikTok(input);
    else data = await scrapeYouTube(input);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';

    if (msg.includes('TimeoutError') || msg.includes('AbortError') || msg.includes('timeout')) {
      return NextResponse.json(
        { success: false, error: 'Request timed out. Please try again or enter your follower count manually.' },
        { status: 200 },
      );
    }

    // Return friendly errors as success:false (not 500) so the client can display them
    return NextResponse.json({ success: false, error: msg }, { status: 200 });
  }
}
