'use client';

import { useState, useEffect } from 'react';
import { Plus, Zap, X, Calendar, Target, DollarSign, Trash2, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToCampaigns, addCampaign, deleteCampaign, type Campaign } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

const goals = ['Awareness', 'Engagement', 'Conversions', 'Retention', 'Traffic'];
const tones = ['Professional', 'Friendly', 'Humorous', 'Inspirational', 'Urgent'];
const allPlatforms = ['Instagram', 'Facebook', 'Twitter/X', 'LinkedIn', 'TikTok'];

const statusConfig = {
  active: { color: '#10B981', bg: '#D1FAE5', dot: true },
  scheduled: { color: '#F59E0B', bg: '#FEF3C7', dot: false },
  completed: { color: '#94A3B8', bg: '#F1F5F9', dot: false },
  draft: { color: '#7C3AED', bg: '#EDE9FE', dot: false },
};

const platformColors: Record<string, string> = {
  Instagram: '#E1306C', Facebook: '#1877F2', 'Twitter/X': '#1DA1F2',
  LinkedIn: '#0A66C2', TikTok: '#010101',
};

interface CopyVariant {
  id: number; platform: string; caption: string;
  hashtags: string[]; cta: string; characterCount: number;
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [form, setForm] = useState({
    name: '', goal: 'Awareness', platforms: ['Instagram'],
    tone: 'Professional', targetAudience: '', budget: '',
    startDate: '', endDate: '',
  });

  const [variants, setVariants] = useState<CopyVariant[]>([]);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  const [activeVariant, setActiveVariant] = useState(0);
  const [savingCampaign, setSavingCampaign] = useState(false);

  // Real-time Firestore listener
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCampaigns(user.uid, (data) => {
      setCampaigns(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const togglePlatform = (p: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
    }));
  };

  const generateCopy = async () => {
    if (!form.name) { showToast('Enter a campaign name first', 'error'); return; }
    setGeneratingCopy(true);
    setVariants([]);
    try {
      const res = await fetch('/api/gemini/generate-copy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (data.success) { setVariants(data.variants); showToast('AI copy generated!', 'success'); }
      else showToast(data.error || 'Generation failed', 'error');
    } catch { showToast('Failed to generate copy', 'error'); }
    setGeneratingCopy(false);
  };

  const saveCampaign = async () => {
    if (!form.name) { showToast('Campaign name is required', 'error'); return; }
    if (!user) return;
    setSavingCampaign(true);
    try {
      await addCampaign(user.uid, {
        name: form.name, goal: form.goal, platforms: form.platforms,
        status: 'draft',
        startDate: form.startDate || 'TBD',
        endDate: form.endDate || 'TBD',
        budget: form.budget ? `$${form.budget}` : 'TBD',
        reach: '—', engagement: '—',
      });
      setShowModal(false);
      setForm({ name: '', goal: 'Awareness', platforms: ['Instagram'], tone: 'Professional', targetAudience: '', budget: '', startDate: '', endDate: '' });
      setVariants([]);
      showToast('Campaign created!', 'success');
    } catch { showToast('Failed to save campaign', 'error'); }
    setSavingCampaign(false);
  };

  const handleDelete = async (id: string) => {
    if (!user || !id) return;
    try {
      await deleteCampaign(user.uid, id);
      showToast('Campaign deleted', 'info');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const filtered = filterStatus === 'all' ? campaigns : campaigns.filter((c) => c.status === filterStatus);

  const summaryStats = [
    { label: 'Total', value: campaigns.length },
    { label: 'Active', value: campaigns.filter((c) => c.status === 'active').length },
    { label: 'Scheduled', value: campaigns.filter((c) => c.status === 'scheduled').length },
    { label: 'Completed', value: campaigns.filter((c) => c.status === 'completed').length },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Campaigns</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Manage & automate your social media campaigns</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={17} /> Create Campaign
        </button>
      </div>

      <div className="page-wrapper">
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {summaryStats.map((s) => (
            <div key={s.label} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'active', 'scheduled', 'draft', 'completed'].map((status) => (
            <button key={status} className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span style={{ background: filterStatus === status ? 'rgba(255,255,255,0.25)' : 'var(--bg-elevated)', borderRadius: '9999px', padding: '1px 6px', fontSize: '11px', marginLeft: '4px' }}>
                  {campaigns.filter((c) => c.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty / Loading */}
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><span style={{ fontSize: '36px' }}>📣</span></div>
            <div className="empty-state-title">{filterStatus === 'all' ? 'No campaigns yet' : `No ${filterStatus} campaigns`}</div>
            <div className="empty-state-text">Create your first campaign and let Gemini AI generate the copy for you.</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Create Campaign</button>
          </div>
        )}

        {/* Campaign Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map((campaign) => {
            const sc = statusConfig[campaign.status] ?? statusConfig.draft;
            return (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-card-header">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{campaign.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`campaign-status ${campaign.status}`}>
                        {sc.dot && <span className="status-dot" />}
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Target size={11} />{campaign.goal}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon" style={{ color: 'var(--accent-rose)', flexShrink: 0 }}
                    onClick={() => campaign.id && handleDelete(campaign.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {campaign.platforms.map((p) => (
                    <span key={p} style={{ padding: '3px 8px', borderRadius: '9999px', background: `${platformColors[p] ?? '#7C3AED'}15`, color: platformColors[p] ?? '#7C3AED', fontSize: '11px', fontWeight: 600 }}>{p}</span>
                  ))}
                </div>

                <div className="divider" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px' }}>
                  {[{ label: 'Reach', value: campaign.reach }, { label: 'Engagement', value: campaign.engagement }, { label: 'Budget', value: campaign.budget }].map((m) => (
                    <div key={m.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{m.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />{campaign.startDate} → {campaign.endDate}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2 className="modal-title">✨ Create New Campaign</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Campaign Name *</label>
                  <input className="form-input" placeholder="e.g. Summer Product Launch 2024" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Goal</label>
                  <select className="form-input form-select" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })}>
                    {goals.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tone</label>
                  <select className="form-input form-select" value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })}>
                    {tones.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Target Audience</label>
                  <input className="form-input" placeholder="e.g. Young professionals aged 25-35 interested in tech" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label"><DollarSign size={13} style={{ display: 'inline' }} /> Budget (USD)</label>
                  <input type="number" className="form-input" placeholder="e.g. 500" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '8px' }}>
                <label className="form-label">Platforms</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {allPlatforms.map((p) => {
                    const sel = form.platforms.includes(p);
                    return (
                      <button key={p} onClick={() => togglePlatform(p)} style={{ padding: '7px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${sel ? platformColors[p] : 'var(--border)'}`, background: sel ? `${platformColors[p]}15` : 'transparent', color: sel ? platformColors[p] : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Copy */}
              <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '20px', border: '1px solid rgba(124,58,237,0.15)', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>✨ AI Copy Generator</div>
                  <button className="btn btn-primary btn-sm" onClick={generateCopy} disabled={generatingCopy}>
                    {generatingCopy ? <><span className="spinner spinner-sm" />Generating...</> : <><Zap size={14} />Generate Copy</>}
                  </button>
                </div>
                {variants.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {variants.map((v, i) => (
                        <button key={v.id} onClick={() => setActiveVariant(i)} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: activeVariant === i ? 'var(--primary)' : 'white', color: activeVariant === i ? 'white' : 'var(--primary)', border: '1.5px solid var(--primary)', cursor: 'pointer' }}>
                          Variant {i + 1}
                        </button>
                      ))}
                    </div>
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>📌 {variants[activeVariant]?.platform} · {variants[activeVariant]?.characterCount} chars</div>
                      <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>{variants[activeVariant]?.caption}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                        {variants[activeVariant]?.hashtags.map((h) => <span key={h} className="tag tag-purple">#{h}</span>)}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>CTA: {variants[activeVariant]?.cta}</div>
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }}
                        onClick={() => { navigator.clipboard.writeText(variants[activeVariant]?.caption ?? ''); showToast('Copied!', 'success'); }}>
                        <Copy size={13} />Copy Caption
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveCampaign} disabled={savingCampaign}>
                {savingCampaign ? <><span className="spinner spinner-sm" />Saving...</> : 'Save Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
