import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InstagramProfileData {
  username: string;
  followers: number;
  following: number;
  posts: number;
  bio: string;
  fullName: string;
  isVerified: boolean;
  profilePic: string | null;
  engagementEstimate: number | null; // rough estimate: null if unavailable
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extract a username from common Instagram URL formats or bare username.
 * Accepts:
 *   https://www.instagram.com/nasa/
 *   instagram.com/nasa
 *   @nasa
 *   nasa
 */
function parseUsername(input: string): string | null {
  const trimmed = input.trim().replace(/\/$/, '');

  // Full URL
  const urlMatch = trimmed.match(/(?:instagram\.com\/)([A-Za-z0-9._]+)/i);
  if (urlMatch) return urlMatch[1].toLowerCase();

  // @handle
  const atMatch = trimmed.match(/^@([A-Za-z0-9._]+)$/);
  if (atMatch) return atMatch[1].toLowerCase();

  // Bare username (letters, numbers, periods, underscores)
  const bareMatch = trimmed.match(/^[A-Za-z0-9._]{1,30}$/);
  if (bareMatch) return trimmed.toLowerCase();

  return null;
}

/** Parse a count string like "42.5M", "1,200", "999K" into a number. */
function parseCount(raw: string): number {
  if (!raw) return 0;
  const clean = raw.replace(/,/g, '').trim();
  if (/M$/i.test(clean)) return Math.round(parseFloat(clean) * 1_000_000);
  if (/K$/i.test(clean)) return Math.round(parseFloat(clean) * 1_000);
  return parseInt(clean, 10) || 0;
}

/**
 * Parse Instagram's og:description which typically looks like:
 *   "42.5M Followers, 100 Following, 5,342 Posts - See Instagram photos and videos from NASA (@nasa)"
 *   "1,234 Followers, 567 Following, 89 Posts – ..."
 */
function parseOgDescription(desc: string): { followers: number; following: number; posts: number } {
  const norm = desc.replace(/\u2013|\u2014/g, '-'); // normalise em/en dashes
  const m = norm.match(
    /([\d,.]+[KkMm]?)\s*Followers?,\s*([\d,.]+[KkMm]?)\s*Following,\s*([\d,.]+[KkMm]?)\s*Posts?/i,
  );
  if (!m) return { followers: 0, following: 0, posts: 0 };
  return {
    followers: parseCount(m[1]),
    following: parseCount(m[2]),
    posts: parseCount(m[3]),
  };
}

/** Extract meta content by property or name. */
function extractMeta(html: string, key: string): string {
  const patterns = [
    new RegExp(`<meta\\s+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'),
  ];
  for (const pat of patterns) {
    const m = html.match(pat);
    if (m?.[1]) return m[1].replace(/&#039;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  }
  return '';
}

/** Try to parse Person JSON-LD schema which sometimes includes interactionStatistic. */
function parseJsonLd(html: string): Partial<InstagramProfileData> {
  const scriptMatch = html.match(/<script type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (!scriptMatch) return {};
  for (const block of scriptMatch) {
    try {
      const json = JSON.parse(block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim());
      const obj = Array.isArray(json) ? json[0] : json;
      if (!obj || obj['@type'] !== 'Person') continue;

      const result: Partial<InstagramProfileData> = {};
      if (obj.name) result.fullName = obj.name;
      if (obj.description) result.bio = obj.description;
      if (obj.image) result.profilePic = typeof obj.image === 'string' ? obj.image : (obj.image?.url ?? null);

      const interactions: { '@type': string; userInteractionCount?: number }[] =
        obj.interactionStatistic ?? [];
      for (const stat of interactions) {
        if (stat['@type'] === 'FollowAction' || stat.userInteractionCount !== undefined) {
          if (stat['@type'] === 'FollowAction') {
            result.followers = stat.userInteractionCount ?? 0;
          }
        }
      }
      return result;
    } catch {
      // Malformed JSON — skip
    }
  }
  return {};
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input: string = body.url ?? body.username ?? '';

    if (!input.trim()) {
      return NextResponse.json({ success: false, error: 'URL or username is required' }, { status: 400 });
    }

    const username = parseUsername(input);
    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Could not parse a valid Instagram username from the provided input.' },
        { status: 400 },
      );
    }

    const profileUrl = `https://www.instagram.com/${username}/`;

    // Fetch with browser-like headers to avoid immediate 403
    const response = await fetch(profileUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
      // 10 second timeout via AbortController
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: `Instagram profile "@${username}" not found. Please check the username.` },
          { status: 200 },
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Instagram rate-limited this request. Please wait a moment and try again, or enter your follower count manually.',
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Instagram returned HTTP ${response.status}. The profile may be private or Instagram is blocking automated requests. Please enter your follower count manually.`,
        },
        { status: 200 },
      );
    }

    const html = await response.text();

    // Check if Instagram redirected to login (common when blocked)
    if (html.includes('id="loginForm"') || html.includes('"loginPage"') || html.includes('/accounts/login/')) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Instagram requires a login to view this profile. Please enter your follower count manually.',
        },
        { status: 200 },
      );
    }

    // ── Parse Open Graph meta tags ─────────────────────────────────────────
    const ogDescription = extractMeta(html, 'og:description');
    const ogTitle = extractMeta(html, 'og:title'); // e.g. "NASA (@nasa) • Instagram photos and videos"
    const ogImage = extractMeta(html, 'og:image');

    const { followers, following, posts } = parseOgDescription(ogDescription);

    // ── Parse JSON-LD (supplemental) ───────────────────────────────────────
    const ldData = parseJsonLd(html);

    // ── Derive fullName from og:title ──────────────────────────────────────
    let fullName = ldData.fullName ?? '';
    if (!fullName && ogTitle) {
      // "NASA (@nasa) • Instagram photos and videos" → "NASA"
      const titleMatch = ogTitle.match(/^([^(]+?)\s*\(/);
      if (titleMatch) fullName = titleMatch[1].trim();
    }

    // ── Verified badge ─────────────────────────────────────────────────────
    const isVerified =
      html.includes('"is_verified":true') ||
      html.includes("'is_verified':true") ||
      html.includes('"verified":true');

    if (followers === 0 && !ldData.followers) {
      // We got HTML but couldn't parse followers — Instagram is rendering JS-only
      return NextResponse.json(
        {
          success: false,
          error:
            "Couldn't extract follower data from Instagram's page (it may be rendered client-side). Try a different profile or enter the count manually.",
        },
        { status: 200 },
      );
    }

    const finalFollowers = ldData.followers ?? followers;

    // ── Rough engagement estimate ──────────────────────────────────────────
    // Industry average for Instagram: ~1-3% for large accounts, ~5-10% for small
    // We can't get actual engagement without the API, so we estimate by follower tier
    let engagementEstimate: number | null = null;
    if (finalFollowers > 0) {
      if (finalFollowers < 10_000) engagementEstimate = 7.2;
      else if (finalFollowers < 100_000) engagementEstimate = 3.8;
      else if (finalFollowers < 1_000_000) engagementEstimate = 2.4;
      else engagementEstimate = 1.1;
    }

    const data: InstagramProfileData = {
      username,
      followers: finalFollowers,
      following,
      posts,
      bio: ldData.bio ?? '',
      fullName,
      isVerified,
      profilePic: ldData.profilePic ?? ogImage ?? null,
      engagementEstimate,
    };

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';

    if (msg.includes('TimeoutError') || msg.includes('AbortError') || msg.includes('timeout')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request to Instagram timed out. Please try again or enter your follower count manually.',
        },
        { status: 200 },
      );
    }

    console.error('[instagram-scrape] Error:', msg);
    return NextResponse.json(
      {
        success: false,
        error: 'Could not fetch Instagram profile. Please enter your follower count manually.',
      },
      { status: 200 },
    );
  }
}
