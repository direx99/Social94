'use client';

import { useState, useEffect } from 'react';
import { Plus, Bell, Clock, Calendar, Zap, X, Repeat, Trash2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToReminders, addReminder, deleteReminder, updateReminderStatus, type Reminder } from '@/lib/firestore';
import { useToast } from '@/components/ui/Toast';

const platforms = ['Instagram', 'Facebook', 'Twitter/X', 'LinkedIn', 'TikTok', 'All Platforms'];
const recurrenceOptions = ['once', 'daily', 'weekly', 'monthly'];

const statusConfig = {
  pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending', icon: Clock },
  sent: { color: '#10B981', bg: '#D1FAE5', label: 'Sent', icon: Check },
  failed: { color: '#F43F5E', bg: '#FFE4E6', label: 'Failed', icon: X },
};

const platformColors: Record<string, string> = {
  Instagram: '#E1306C', Facebook: '#1877F2', 'Twitter/X': '#1DA1F2',
  LinkedIn: '#0A66C2', TikTok: '#010101', 'All Platforms': '#7C3AED',
};

const platformEmojis: Record<string, string> = {
  Instagram: '📸', Facebook: '👥', 'Twitter/X': '🐦',
  LinkedIn: '💼', TikTok: '🎵', 'All Platforms': '🌐',
};

export default function RemindersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);

  const [form, setForm] = useState({
    title: '', message: '', platform: 'Instagram',
    date: '', time: '09:00', recurrence: 'once',
  });

  // Real-time Firestore listener
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToReminders(user.uid, (data) => {
      setReminders(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const generateMessage = async () => {
    if (!form.title) { showToast('Enter a title first', 'error'); return; }
    setGeneratingMessage(true);
    try {
      const res = await fetch('/api/gemini/generate-reminder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, platform: form.platform, context: form.message }),
      });
      const data = await res.json();
      if (data.success) { setForm((prev) => ({ ...prev, message: data.message })); showToast('AI message generated!', 'success'); }
      else showToast(data.error || 'Failed to generate', 'error');
    } catch { showToast('AI service error', 'error'); }
    setGeneratingMessage(false);
  };

  const saveReminder = async () => {
    if (!form.title || !form.message) { showToast('Title and message are required', 'error'); return; }
    if (!user) return;
    setSavingReminder(true);
    try {
      await addReminder(user.uid, {
        title: form.title,
        message: form.message,
        platform: form.platform,
        datetime: `${form.date} ${form.time}`,
        recurrence: form.recurrence,
        status: 'pending',
      });
      setShowModal(false);
      setForm({ title: '', message: '', platform: 'Instagram', date: '', time: '09:00', recurrence: 'once' });
      showToast('Reminder created!', 'success');
    } catch { showToast('Failed to save reminder', 'error'); }
    setSavingReminder(false);
  };

  const handleDelete = async (id: string) => {
    if (!user || !id) return;
    try {
      await deleteReminder(user.uid, id);
      showToast('Reminder deleted', 'info');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleMarkSent = async (id: string) => {
    if (!user || !id) return;
    try {
      await updateReminderStatus(user.uid, id, 'sent');
      showToast('Marked as sent', 'success');
    } catch { showToast('Failed to update', 'error'); }
  };

  const filtered = filterStatus === 'all' ? reminders : reminders.filter((r) => r.status === filterStatus);

  const stats = [
    { label: 'Total', value: reminders.length, color: '#7C3AED', icon: Bell },
    { label: 'Pending', value: reminders.filter((r) => r.status === 'pending').length, color: '#F59E0B', icon: Clock },
    { label: 'Sent', value: reminders.filter((r) => r.status === 'sent').length, color: '#10B981', icon: Check },
    { label: 'Failed', value: reminders.filter((r) => r.status === 'failed').length, color: '#F43F5E', icon: X },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Automated Reminders</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Schedule & automate your social media reminders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={17} />New Reminder
        </button>
      </div>

      <div className="page-wrapper">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={s.color} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Banner */}
        {reminders.filter((r) => r.status === 'pending').length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)', border: '1px solid #FDE68A', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 40, height: 40, background: '#FEF3C7', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={20} color="#F59E0B" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400E' }}>
                {reminders.filter((r) => r.status === 'pending').length} upcoming reminder{reminders.filter((r) => r.status === 'pending').length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: '13px', color: '#B45309' }}>
                Next: &ldquo;{reminders.filter((r) => r.status === 'pending')[0]?.title}&rdquo; — {reminders.filter((r) => r.status === 'pending')[0]?.datetime}
              </div>
            </div>
          </div>
        )}

        {/* Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'pending', 'sent', 'failed'].map((s) => (
            <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && <div style={{ textAlign: 'center', padding: '60px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}

        {/* Reminder List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Bell size={36} /></div>
              <div className="empty-state-title">No reminders yet</div>
              <div className="empty-state-text">Create your first automated reminder. Use AI to generate the message!</div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Create Reminder</button>
            </div>
          )}

          {filtered.map((reminder) => {
            const sc = statusConfig[reminder.status] ?? statusConfig.pending;
            const StatusIcon = sc.icon;
            return (
              <div key={reminder.id} className="reminder-card" style={{ borderLeft: `3px solid ${sc.color}` }}>
                <div className="reminder-icon" style={{ background: `${platformColors[reminder.platform] ?? '#7C3AED'}15` }}>
                  <span style={{ fontSize: '22px' }}>{platformEmojis[reminder.platform] ?? '🔔'}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{reminder.title}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <StatusIcon size={10} />{sc.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {reminder.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />{reminder.datetime}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Repeat size={11} />{reminder.recurrence}</span>
                    <span style={{ fontSize: '12px', padding: '1px 8px', borderRadius: '9999px', background: `${platformColors[reminder.platform] ?? '#7C3AED'}15`, color: platformColors[reminder.platform] ?? '#7C3AED', fontWeight: 600 }}>
                      {reminder.platform}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {reminder.status === 'pending' && (
                    <button className="btn btn-ghost btn-icon" title="Mark as sent" style={{ color: '#10B981' }}
                      onClick={() => reminder.id && handleMarkSent(reminder.id)}>
                      <Check size={16} />
                    </button>
                  )}
                  <button className="btn btn-ghost btn-icon" title="Delete" style={{ color: '#F43F5E' }}
                    onClick={() => reminder.id && handleDelete(reminder.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">🔔 Create Reminder</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. Weekly Newsletter Reminder" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Message *
                  <button className="btn btn-primary btn-sm" onClick={generateMessage} disabled={generatingMessage} style={{ fontSize: '12px' }}>
                    {generatingMessage ? <><span className="spinner spinner-sm" />Generating...</> : <><Zap size={13} />AI Generate</>}
                  </button>
                </label>
                <textarea className="form-input form-textarea" placeholder="Enter your reminder message, or click 'AI Generate' to draft with Gemini AI..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ minHeight: '120px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Platform</label>
                  <select className="form-input form-select" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                    {platforms.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Recurrence</label>
                  <select className="form-input form-select" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })}>
                    {recurrenceOptions.map((r) => <option key={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="time" className="form-input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveReminder} disabled={savingReminder}>
                {savingReminder ? <><span className="spinner spinner-sm" />Saving...</> : 'Save Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
