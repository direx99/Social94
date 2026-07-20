'use client';

import { useState, useEffect } from 'react';
import { Users, TrendingUp, FileText, Megaphone, Bell, ArrowUpRight, Zap, Eye, Heart, Share2, ChevronRight, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserStats, subscribeToCampaigns, subscribeToReminders, type UserStats, type Campaign, type Reminder } from '@/lib/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [greeting, setGreeting] = useState('Good morning');
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting('Good afternoon');
    else if (h >= 17) setGreeting('Good evening');
  }, []);

  // Load stats
  useEffect(() => {
    if (!user) return;
    getUserStats(user.uid).then(setStats);
  }, [user]);

  // Real-time campaigns & reminders
  useEffect(() => {
    if (!user) return;
    const unsubCampaigns = subscribeToCampaigns(user.uid, setCampaigns);
    const unsubReminders = subscribeToReminders(user.uid, setReminders);
    return () => { unsubCampaigns(); unsubReminders(); };
  }, [user]);

  const fetchInsight = async () => {
    if (!stats) return;
    setLoadingInsight(true);
    try {
      const res = await fetch('/api/gemini/audience-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audienceData: { totalReach: stats.totalReach, engagementRate: stats.engagementRate, platforms: stats.platformStats, activeCampaigns: stats.activeCampaigns } }),
      });
      const data = await res.json();
      if (data.success) setAiInsight(data.insight);
    } catch { /* silent */ }
    setLoadingInsight(false);
  };

  // Derived metrics
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const pendingReminders = reminders.filter((r) => r.status === 'pending').length;

  const statCards = [
    { label: 'Total Reach', value: stats ? `${(stats.totalReach / 1000).toFixed(1)}K` : '—', change: `${stats?.engagementRate ?? 0}% rate`, icon: Users, color: 'purple' },
    { label: 'Engagement Rate', value: stats ? `${stats.engagementRate}%` : '—', change: 'this month', icon: TrendingUp, color: 'emerald' },
    { label: 'Active Campaigns', value: activeCampaigns.toString(), change: `${campaigns.length} total`, icon: Megaphone, color: 'amber' },
    { label: 'Pending Reminders', value: pendingReminders.toString(), change: `${reminders.length} total`, icon: Bell, color: 'cyan' },
  ];

  // Recent activity from campaigns + reminders combined
  const recentActivity = [
    ...campaigns.slice(0, 3).map((c) => ({
      icon: '📣', title: c.name, sub: `Campaign · ${c.status}`, status: c.status, time: 'Campaign',
    })),
    ...reminders.slice(0, 3).map((r) => ({
      icon: '🔔', title: r.title, sub: `${r.platform} · ${r.recurrence}`, status: r.status, time: 'Reminder',
    })),
  ].slice(0, 5);

  const statusColors: Record<string, string> = {
    active: '#7C3AED', scheduled: '#F59E0B', completed: '#94A3B8',
    draft: '#06B6D4', pending: '#F59E0B', sent: '#10B981', failed: '#F43F5E',
  };
  const statusBg: Record<string, string> = {
    active: '#EDE9FE', scheduled: '#FEF3C7', completed: '#F1F5F9',
    draft: '#CFFAFE', pending: '#FEF3C7', sent: '#D1FAE5', failed: '#FFE4E6',
  };

  const platformColors: Record<string, string> = {
    Instagram: '#E1306C', Facebook: '#1877F2', 'LinkedIn': '#0A66C2', 'Twitter/X': '#1DA1F2',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
              {greeting}, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Here&apos;s your Social94 overview</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={fetchInsight}
            disabled={loadingInsight || !stats}
          >
            {loadingInsight ? <span className="spinner spinner-sm" /> : <Zap size={15} />}
            {loadingInsight ? 'Thinking...' : 'AI Insight'}
          </button>
          <Link href="/reminders">
            <button className="header-icon-btn" style={{ position: 'relative' }}>
              <Bell size={18} />
              {pendingReminders > 0 && <span className="badge">{pendingReminders}</span>}
            </button>
          </Link>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="sidebar-avatar" style={{ width: 36, height: 36 }}>
              {user?.displayName?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
        </div>
      </div>

      <div className="page-wrapper">
        {/* AI Insight Banner */}
        {aiInsight && (
          <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px', color: 'white' }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, opacity: 0.85, marginBottom: '6px' }}>✨ Gemini AI Insight</div>
              <p style={{ fontSize: '14px', opacity: 0.95, lineHeight: 1.6, margin: 0 }}>{aiInsight}</p>
            </div>
            <button onClick={() => setAiInsight('')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className="stat-cards-grid" style={{ marginBottom: '28px' }}>
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="stat-card">
                <div className="stat-card-header">
                  <div className={`stat-card-icon ${s.color}`}><Icon size={22} /></div>
                  <div className="stat-card-trend up"><ArrowUpRight size={13} />{s.change}</div>
                </div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Recent Activity */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/campaigns"><button className="btn btn-ghost btn-sm">+ Campaign</button></Link>
                <Link href="/reminders"><button className="btn btn-ghost btn-sm">+ Reminder</button></Link>
              </div>
            </div>
            {recentActivity.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 24px' }}>
                <div style={{ fontSize: '40px' }}>🚀</div>
                <div className="empty-state-title" style={{ fontSize: '16px' }}>No activity yet</div>
                <div className="empty-state-text">Create your first campaign or reminder to get started.</div>
                <Link href="/campaigns"><button className="btn btn-primary btn-sm"><Plus size={14} />Create Campaign</button></Link>
              </div>
            ) : (
              <div style={{ padding: '8px 0' }}>
                {recentActivity.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 24px', borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none', transition: 'background 0.15s', cursor: 'default' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <span style={{ fontSize: '22px', width: 32, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Clock size={11} />{item.time}
                      </div>
                    </div>
                    <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: statusBg[item.status] ?? '#F1F5F9', color: statusColors[item.status] ?? '#94A3B8' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Platform Pulse */}
          <div className="card">
            <div className="card-header"><span className="card-title">Platform Pulse</span></div>
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(stats?.platformStats ?? []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                  Add your follower counts on the{' '}
                  <Link href="/audience" style={{ color: 'var(--primary)', fontWeight: 600 }}>Audience page</Link>
                </div>
              ) : (
                (stats?.platformStats ?? []).map((p) => {
                  const total = Math.max(...(stats?.platformStats ?? []).map((x) => x.followers), 1);
                  return (
                    <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${platformColors[p.name] ?? '#7C3AED'}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                        {p.name === 'Instagram' ? '📸' : p.name === 'Facebook' ? '👥' : p.name === 'LinkedIn' ? '💼' : '🐦'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{p.name}</div>
                        <div style={{ height: '4px', background: 'var(--bg-elevated)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: platformColors[p.name] ?? '#7C3AED', borderRadius: '9999px', width: `${(p.followers / total) * 100}%`, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700 }}>{p.followers >= 1000 ? `${(p.followers / 1000).toFixed(1)}K` : p.followers}</div>
                        <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>{p.growth}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div style={{ marginTop: '8px' }}>
                <Link href="/audience">
                  <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                    View Full Analytics <ChevronRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Overview */}
        {campaigns.length > 0 && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <span className="card-title">📣 Your Campaigns</span>
              <Link href="/campaigns"><button className="btn btn-ghost btn-sm">View all</button></Link>
            </div>
            <div style={{ padding: '8px 0' }}>
              {campaigns.slice(0, 3).map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '14px 24px', borderBottom: i < Math.min(campaigns.length, 3) - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.goal} · {c.platforms.join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {c.platforms.slice(0, 2).map((p) => (
                      <span key={p} style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: `${platformColors[p] ?? '#7C3AED'}15`, color: platformColors[p] ?? '#7C3AED' }}>{p}</span>
                    ))}
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600, background: statusBg[c.status], color: statusColors[c.status] }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { href: '/audience', icon: Users, label: 'Check Audience', sub: 'View reach analytics', color: 'purple' },
            { href: '/content', icon: FileText, label: 'Analyze Content', sub: 'AI quality check', color: 'cyan' },
            { href: '/campaigns', icon: Megaphone, label: 'New Campaign', sub: 'Launch with AI', color: 'emerald' },
            { href: '/reminders', icon: Bell, label: 'Set Reminder', sub: 'Schedule alerts', color: 'amber' },
          ].map(({ href, icon: Icon, label, sub, color }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div className={`stat-card-icon ${color}`} style={{ width: 48, height: 48, margin: '0 auto 12px' }}><Icon size={22} /></div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
