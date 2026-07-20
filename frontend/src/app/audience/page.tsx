'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, Eye, ArrowUpRight, Zap, Save, Edit3, X, Link, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { getUserStats, updateUserStats, type UserStats, defaultStats } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', emoji: '📸', color: '#E1306C', bgLight: '#FFF0F5', borderColor: '#F48FB1', textColor: '#880E4F', mutedColor: '#AD1457', placeholder: 'https://instagram.com/nasa or @nasa', apiRoute: '/api/instagram-scrape', apiKey: 'url' },
  { key: 'facebook', name: 'Facebook', emoji: '👥', color: '#1877F2', bgLight: '#EBF3FF', borderColor: '#90CAF9', textColor: '#0D3B8E', mutedColor: '#1565C0', placeholder: 'https://facebook.com/nasa or nasa', apiRoute: '/api/social-scrape', apiKey: 'url' },
  { key: 'tiktok', name: 'TikTok', emoji: '🎵', color: '#010101', bgLight: '#F3F3F3', borderColor: '#B0B0B0', textColor: '#111', mutedColor: '#333', placeholder: 'https://tiktok.com/@nasa or @nasa', apiRoute: '/api/social-scrape', apiKey: 'url' },
  { key: 'youtube', name: 'YouTube', emoji: '▶️', color: '#FF0000', bgLight: '#FFF3F3', borderColor: '#FFCDD2', textColor: '#B71C1C', mutedColor: '#C62828', placeholder: 'https://youtube.com/@NASA or @NASA', apiRoute: '/api/social-scrape', apiKey: 'url' },
] as const;

type PlatformKey = typeof PLATFORMS[number]['key'];

const pieColors: Record<PlatformKey, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  tiktok: '#2DD4BF',
  youtube: '#FF0000',
};

// ─── Scrape state per platform ────────────────────────────────────────────────

type ScrapeState = {
  show: boolean;
  url: string;
  loading: boolean;
  error: string;
  success: string;
};

const initScrape = (): ScrapeState => ({ show: false, url: '', loading: false, error: '', success: '' });

// ─── Component ────────────────────────────────────────────────────────────────

export default function AudiencePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [activeChart, setActiveChart] = useState<'reach' | 'engagement'>('reach');
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Per-platform scrape state
  const [scrape, setScrape] = useState<Record<PlatformKey, ScrapeState>>({
    instagram: initScrape(),
    facebook: initScrape(),
    tiktok: initScrape(),
    youtube: initScrape(),
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    instagram: 0, facebook: 0, tiktok: 0, youtube: 0,
    engagementRate: 0, newFollowers: 0, avgReachPerPost: 0,
    age1824: 0, age2534: 0, age3544: 0, age4554: 0, age55: 0,
  });

  useEffect(() => {
    if (!user) return;
    getUserStats(user.uid).then((s) => {
      setStats(s);
      const plat = s.platformStats ?? [];
      setEditForm({
        instagram: plat.find((p) => p.name === 'Instagram')?.followers ?? 0,
        facebook: plat.find((p) => p.name === 'Facebook')?.followers ?? 0,
        tiktok: plat.find((p) => p.name === 'TikTok')?.followers ?? 0,
        youtube: plat.find((p) => p.name === 'YouTube')?.followers ?? 0,
        engagementRate: s.engagementRate ?? 0,
        newFollowers: s.newFollowers ?? 0,
        avgReachPerPost: s.avgReachPerPost ?? 0,
        age1824: s.ageData?.[0]?.percentage ?? 0,
        age2534: s.ageData?.[1]?.percentage ?? 0,
        age3544: s.ageData?.[2]?.percentage ?? 0,
        age4554: s.ageData?.[3]?.percentage ?? 0,
        age55: s.ageData?.[4]?.percentage ?? 0,
      });
      setLoading(false);
    });
  }, [user]);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSaveStats = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const totalFollowers = editForm.instagram + editForm.facebook + editForm.tiktok + editForm.youtube;
      const platformStats = [
        { name: 'Instagram', followers: editForm.instagram, growth: '+0%' },
        { name: 'Facebook', followers: editForm.facebook, growth: '+0%' },
        { name: 'TikTok', followers: editForm.tiktok, growth: '+0%' },
        { name: 'YouTube', followers: editForm.youtube, growth: '+0%' },
      ];
      const ageData = [
        { age: '18–24', percentage: editForm.age1824 },
        { age: '25–34', percentage: editForm.age2534 },
        { age: '35–44', percentage: editForm.age3544 },
        { age: '45–54', percentage: editForm.age4554 },
        { age: '55+', percentage: editForm.age55 },
      ];
      const now = new Date();
      const monthName = now.toLocaleString('default', { month: 'short' });
      const newPoint = {
        month: monthName,
        instagram: editForm.instagram,
        facebook: editForm.facebook,
        tiktok: editForm.tiktok,
        youtube: editForm.youtube,
      };
      const existing = stats.reachOverTime ?? [];
      const updated = existing.some((p) => p.month === monthName)
        ? existing.map((p) => (p.month === monthName ? newPoint : p))
        : [...existing, newPoint].slice(-7);

      const newStats: Partial<UserStats> = {
        totalReach: totalFollowers,
        engagementRate: editForm.engagementRate,
        newFollowers: editForm.newFollowers,
        avgReachPerPost: editForm.avgReachPerPost,
        platformStats,
        ageData,
        reachOverTime: updated,
      };
      await updateUserStats(user.uid, newStats);
      setStats((prev) => ({ ...prev, ...newStats }));
      showToast('Stats updated!', 'success');
      setShowEditModal(false);
    } catch {
      showToast('Failed to save stats', 'error');
    }
    setSaving(false);
  };

  // ── Per-platform auto-fill ───────────────────────────────────────────────────

  const updateScrape = (key: PlatformKey, patch: Partial<ScrapeState>) =>
    setScrape((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const fetchPlatformData = async (platKey: PlatformKey) => {
    const plat = PLATFORMS.find((p) => p.key === platKey)!;
    const url = scrape[platKey].url.trim();
    if (!url) return;

    updateScrape(platKey, { loading: true, error: '', success: '' });
    try {
      const body: Record<string, string> = { [plat.apiKey]: url };
      if (plat.apiRoute === '/api/social-scrape') body.platform = platKey;

      const res = await fetch(plat.apiRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const { followers, engagementEstimate, username } = data.data;
        setEditForm((prev) => ({
          ...prev,
          [platKey]: followers,
          ...(engagementEstimate !== null && prev.engagementRate === 0
            ? { engagementRate: engagementEstimate }
            : {}),
        }));
        const kStr = followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : String(followers);
        updateScrape(platKey, {
          loading: false,
          show: false,
          url: '',
          success: `✅ Fetched @${username}: ${kStr} followers${engagementEstimate ? ` • ~${engagementEstimate}% est. engagement` : ''}`,
        });
      } else {
        updateScrape(platKey, { loading: false, error: data.error ?? 'Could not fetch data.' });
      }
    } catch {
      updateScrape(platKey, { loading: false, error: 'Network error — please try again or enter manually.' });
    }
  };

  // ── AI Insight ───────────────────────────────────────────────────────────────

  const fetchInsight = async () => {
    setLoadingInsight(true);
    try {
      const res = await fetch('/api/gemini/audience-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audienceData: { totalFollowers: stats.totalReach, platformStats: stats.platformStats, engagementRate: stats.engagementRate, ageData: stats.ageData } }),
      });
      const data = await res.json();
      if (data.success) setInsight(data.insight);
      else showToast('Could not generate insight', 'error');
    } catch { showToast('AI service error', 'error'); }
    setLoadingInsight(false);
  };

  // ── Derived chart data ───────────────────────────────────────────────────────

  const pieData = (stats.platformStats ?? [])
    .filter((p) => p.followers > 0)
    .map((p) => ({
      name: p.name,
      value: p.followers,
      color: pieColors[(p.name.toLowerCase() as PlatformKey)] ?? '#7C3AED',
    }));

  const totalFollowers = (stats.platformStats ?? []).reduce((s, p) => s + p.followers, 0);

  const summaryStats = [
    { label: 'Total Followers', value: totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers.toString(), icon: Users, color: 'purple' },
    { label: 'Avg Reach/Post', value: stats.avgReachPerPost >= 1000 ? `${(stats.avgReachPerPost / 1000).toFixed(1)}K` : stats.avgReachPerPost.toString(), icon: Eye, color: 'cyan' },
    { label: 'Engagement Rate', value: `${stats.engagementRate}%`, icon: TrendingUp, color: 'emerald' },
    { label: 'New Followers', value: stats.newFollowers >= 1000 ? `${(stats.newFollowers / 1000).toFixed(1)}K` : stats.newFollowers.toString(), icon: ArrowUpRight, color: 'amber' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Audience Reach</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Track your audience growth &amp; demographics</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}>
            <Edit3 size={14} /> Update Stats
          </button>
          <button className="btn btn-primary btn-sm" onClick={fetchInsight} disabled={loadingInsight}>
            {loadingInsight ? <span className="spinner spinner-sm" /> : <Zap size={15} />}
            {loadingInsight ? 'Analyzing...' : 'AI Insight'}
          </button>
        </div>
      </div>

      <div className="page-wrapper">
        {/* AI Insight */}
        {insight && (
          <div style={{ background: 'linear-gradient(135deg, #EDE9FE, #CFFAFE)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-lg)', padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="ai-badge" style={{ marginBottom: '8px' }}><span className="ai-dot" />Gemini AI Insight</div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{insight}</p>
            </div>
            <button onClick={() => setInsight('')} style={{ marginLeft: 'auto', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
          </div>
        )}

        {/* No data state */}
        {totalFollowers === 0 && !loading && (
          <div style={{ background: 'var(--accent-amber-light)', border: '1px solid #FDE68A', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>No audience data yet</div>
              <div style={{ fontSize: '13px', color: '#B45309' }}>Click &ldquo;Update Stats&rdquo; to enter your real follower counts from each platform.</div>
            </div>
            <button className="btn btn-sm" style={{ background: '#F59E0B', color: 'white', border: 'none' }} onClick={() => setShowEditModal(true)}>
              <Edit3 size={13} /> Add Data
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="stat-cards-grid" style={{ marginBottom: '28px' }}>
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="stat-card-header">
                  <div className={`stat-card-icon ${s.color}`}><Icon size={22} /></div>
                </div>
                <div className="stat-card-value">{loading ? '—' : s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Reach Chart */}
        {(stats.reachOverTime ?? []).length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <span className="card-title">📈 Reach Over Time</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['reach', 'engagement'] as const).map((t) => (
                  <button key={t} className={`btn btn-sm ${activeChart === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveChart(t)}>
                    {t === 'reach' ? 'Followers' : 'Engagement'}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-body">
              <div className="chart-wrapper" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.reachOverTime}>
                    <defs>
                      {(['instagram', 'facebook', 'tiktok', 'youtube'] as PlatformKey[]).map((k) => (
                        <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={pieColors[k]} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={pieColors[k]} stopOpacity={0.01} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                    <Tooltip formatter={(v) => [(v as number) >= 1000 ? `${((v as number) / 1000).toFixed(1)}K` : v, '']} contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="instagram" stroke={pieColors.instagram} fill="url(#grad-instagram)" strokeWidth={2} name="Instagram" />
                    <Area type="monotone" dataKey="facebook" stroke={pieColors.facebook} fill="url(#grad-facebook)" strokeWidth={2} name="Facebook" />
                    <Area type="monotone" dataKey="tiktok" stroke={pieColors.tiktok} fill="url(#grad-tiktok)" strokeWidth={2} name="TikTok" />
                    <Area type="monotone" dataKey="youtube" stroke={pieColors.youtube} fill="url(#grad-youtube)" strokeWidth={2} name="YouTube" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Demographics Row */}
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Platform Breakdown */}
          <div className="card">
            <div className="card-header"><span className="card-title">🌐 Platform Breakdown</span></div>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              {pieData.length === 0 ? (
                <div style={{ textAlign: 'center', flex: 1, color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>No data — add your stats above</div>
              ) : (
                <>
                  <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [(v as number) >= 1000 ? `${((v as number) / 1000).toFixed(1)}K` : v, '']} contentStyle={{ borderRadius: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    {pieData.map((p) => (
                      <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', flex: 1 }}>{p.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: p.color }}>
                          {p.value >= 1000 ? `${(p.value / 1000).toFixed(1)}K` : p.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Age Demographics */}
          <div className="card">
            <div className="card-header"><span className="card-title">👥 Age Demographics</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(stats.ageData ?? []).every((a) => a.percentage === 0) ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>Update stats to add age data</div>
              ) : (
                (stats.ageData ?? []).map((a) => (
                  <div key={a.age}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{a.age}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{a.percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${a.percentage}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Stats Modal ─────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}>
          <div className="modal" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h2 className="modal-title">📊 Update Your Stats</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', padding: '10px 14px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
                💡 Enter your real follower counts or use <strong>Auto-fill</strong> to fetch data from public profiles.
              </div>

              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', color: 'var(--text-primary)' }}>Followers by Platform</div>

              {/* Render each platform with auto-fill */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '22px' }}>
                {PLATFORMS.map((plat) => {
                  const ps = scrape[plat.key];
                  return (
                    <div key={plat.key} className="form-group" style={{ margin: 0 }}>
                      {/* Label row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label className="form-label" style={{ margin: 0 }}>{plat.emoji} {plat.name}</label>
                        <button
                          type="button"
                          onClick={() => {
                            updateScrape(plat.key, { show: !ps.show, error: '', success: '' });
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                            borderRadius: '20px', border: `1px solid ${plat.color}`,
                            background: ps.show ? plat.color : 'transparent',
                            color: ps.show ? 'white' : plat.color,
                            cursor: 'pointer', transition: 'all 0.2s',
                          }}
                        >
                          <Link size={11} />
                          {ps.show ? 'Cancel' : 'Auto-fill'}
                        </button>
                      </div>

                      {/* Inline URL panel */}
                      {ps.show && (
                        <div style={{
                          background: plat.bgLight,
                          border: `1px solid ${plat.borderColor}`,
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginBottom: '8px',
                        }}>
                          <div style={{ fontSize: '12px', color: plat.textColor, marginBottom: '8px', fontWeight: 500 }}>
                            🔗 Enter your {plat.name} profile URL or username
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder={plat.placeholder}
                              value={ps.url}
                              onChange={(e) => updateScrape(plat.key, { url: e.target.value, error: '' })}
                              onKeyDown={(e) => e.key === 'Enter' && !ps.loading && fetchPlatformData(plat.key)}
                              style={{ flex: 1, fontSize: '13px' }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => fetchPlatformData(plat.key)}
                              disabled={ps.loading || !ps.url.trim()}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '0 14px', borderRadius: '8px',
                                background: plat.color, color: 'white', border: 'none',
                                fontWeight: 700, fontSize: '13px',
                                cursor: ps.loading ? 'not-allowed' : 'pointer',
                                opacity: ps.loading || !ps.url.trim() ? 0.6 : 1,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {ps.loading ? <><span className="spinner spinner-sm" />Fetching...</> : <><RefreshCw size={13} />Fetch</>}
                            </button>
                          </div>
                          {ps.error && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#C62828' }}>
                              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                              <span>{ps.error}</span>
                            </div>
                          )}
                          <div style={{ fontSize: '11px', color: plat.mutedColor, marginTop: '8px', opacity: 0.8 }}>
                            ℹ️ Works for public profiles. {plat.name} may block automated requests — manual entry always available.
                          </div>
                        </div>
                      )}

                      {/* Success badge */}
                      {ps.success && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '12px', color: '#2E7D32', fontWeight: 500,
                          background: '#F1F8E9', border: '1px solid #A5D6A7',
                          borderRadius: '8px', padding: '6px 10px', marginBottom: '6px',
                        }}>
                          <CheckCircle size={13} />
                          {ps.success}
                        </div>
                      )}

                      {/* Number input */}
                      <input
                        type="number"
                        className="form-input"
                        min={0}
                        placeholder="0"
                        value={editForm[plat.key] || ''}
                        onChange={(e) => {
                          setEditForm((prev) => ({ ...prev, [plat.key]: Number(e.target.value) }));
                          updateScrape(plat.key, { success: '' });
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Performance Metrics */}
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Performance Metrics</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Engagement Rate (%)</label>
                  <input type="number" className="form-input" min={0} max={100} step={0.1} placeholder="0.0"
                    value={editForm.engagementRate || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, engagementRate: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Followers</label>
                  <input type="number" className="form-input" min={0} placeholder="0"
                    value={editForm.newFollowers || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, newFollowers: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Avg Reach / Post</label>
                  <input type="number" className="form-input" min={0} placeholder="0"
                    value={editForm.avgReachPerPost || ''}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, avgReachPerPost: Number(e.target.value) }))} />
                </div>
              </div>

              {/* Age Demographics */}
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', color: 'var(--text-primary)' }}>Age Demographics (%)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {[
                  { key: 'age1824', label: '18–24' }, { key: 'age2534', label: '25–34' },
                  { key: 'age3544', label: '35–44' }, { key: 'age4554', label: '45–54' },
                  { key: 'age55', label: '55+' },
                ].map(({ key, label }) => (
                  <div className="form-group" key={key}>
                    <label className="form-label" style={{ fontSize: '11px' }}>{label}</label>
                    <input type="number" className="form-input" min={0} max={100} placeholder="0"
                      value={editForm[key as keyof typeof editForm] || ''}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveStats} disabled={saving}>
                {saving ? <><span className="spinner spinner-sm" />Saving...</> : <><Save size={15} />Save Stats</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
