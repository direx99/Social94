'use client';

import { useState, useEffect } from 'react';
import {
  User, Save, Trash2, Shield, Bell,
  Database, AlertTriangle, CheckCircle2, Loader2, LogOut,
  Zap, RefreshCw, Download, X, Camera,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  doc, getDoc, setDoc, collection, getDocs, serverTimestamp, writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updateProfile, deleteUser, reauthenticateWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface ProfileForm {
  displayName: string;
  email: string;
  bio: string;
  website: string;
  location: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailDigest: boolean;
  campaignAlerts: boolean;
  reminderPush: boolean;
  weeklyReport: boolean;
  aiInsights: boolean;
}

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface Toast { id: number; message: string; type: ToastType }

function ToastBar({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map((t) => {
        const map: Record<ToastType, { bg: string; border: string; icon: string }> = {
          success: { bg: '#D1FAE5', border: '#10B981', icon: '✓' },
          error: { bg: '#FFE4E6', border: '#F43F5E', icon: '✕' },
          warning: { bg: '#FEF3C7', border: '#F59E0B', icon: '⚠' },
          info: { bg: '#DBEAFE', border: '#3B82F6', icon: 'ℹ' },
        };
        const c = map[t.type];
        return (
          <div key={t.id} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 280, maxWidth: 380, animation: 'toastIn 0.3s ease' }}>
            <span style={{ fontWeight: 700, color: c.border, fontSize: 15, flexShrink: 0 }}>{c.icon}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#0F172A' }}>{t.message}</span>
            <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2, flexShrink: 0 }}><X size={13} /></button>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmModal({ open, title, description, confirmText, danger, onConfirm, onCancel, loading }: {
  open: boolean; title: string; description: string; confirmText: string;
  danger?: boolean; onConfirm: () => void; onCancel: () => void; loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: danger ? '#FFE4E6' : '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle size={26} color={danger ? '#F43F5E' : '#7C3AED'} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: 'Outfit, sans-serif', color: '#0F172A' }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.65, marginBottom: 24 }}>{description}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: danger ? '#F43F5E' : '#7C3AED', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ icon: Icon, title, subtitle, color = '#7C3AED' }: { icon: React.ElementType; title: string; subtitle: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ width: 46, height: 26, borderRadius: 13, cursor: 'pointer', transition: 'background 0.2s', background: checked ? '#7C3AED' : '#E2E8F0', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.18)' }} />
    </div>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'data' | 'danger'>('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastId, setToastId] = useState(0);

  const [form, setForm] = useState<ProfileForm>({ displayName: '', email: '', bio: '', website: '', location: '', timezone: 'UTC+05:30', language: 'English' });
  const [notifs, setNotifs] = useState<NotificationSettings>({ emailDigest: true, campaignAlerts: true, reminderPush: true, weeklyReport: false, aiInsights: true });

  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [stats, setStats] = useState({ campaigns: 0, reminders: 0, posts: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const toast = (message: string, type: ToastType = 'success') => {
    const id = toastId + 1;
    setToastId(id);
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  };

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, displayName: user.displayName || '', email: user.email || '' }));
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setForm({ displayName: d.displayName || user.displayName || '', email: user.email || '', bio: d.bio || '', website: d.website || '', location: d.location || '', timezone: d.timezone || 'UTC+05:30', language: d.language || 'English' });
        if (d.notifications) setNotifs(d.notifications);
      }
      setLoadingProfile(false);
    });
    Promise.all([
      getDocs(collection(db, 'users', user.uid, 'campaigns')),
      getDocs(collection(db, 'users', user.uid, 'reminders')),
      getDocs(collection(db, 'users', user.uid, 'posts')),
    ]).then(([c, r, p]) => { setStats({ campaigns: c.size, reminders: r.size, posts: p.size }); setLoadingStats(false); });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      if (form.displayName !== user.displayName) await updateProfile(auth.currentUser!, { displayName: form.displayName });
      await setDoc(doc(db, 'users', user.uid), { displayName: form.displayName, bio: form.bio, website: form.website, location: form.location, timezone: form.timezone, language: form.language, updatedAt: serverTimestamp() }, { merge: true });
      toast('Profile updated successfully!');
    } catch (e: unknown) { toast((e as Error).message || 'Failed to update', 'error'); }
    finally { setSavingProfile(false); }
  };

  const saveNotifs = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), { notifications: notifs }, { merge: true });
      toast('Notification preferences saved!');
    } catch { toast('Failed to save', 'error'); }
  };

  const clearCache = async () => {
    setClearingCache(true);
    try {
      localStorage.clear(); sessionStorage.clear();
      if ('caches' in window) { const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); }
      await new Promise((r) => setTimeout(r, 800));
      setClearCacheOpen(false);
      toast('Cache cleared successfully!');
    } catch { toast('Partial cache clear', 'warning'); }
    finally { setClearingCache(false); }
  };

  const deleteAllData = async () => {
    if (!user) return;
    setDeletingData(true);
    try {
      const batch = writeBatch(db);
      for (const col of ['campaigns', 'reminders', 'posts']) {
        const snap = await getDocs(collection(db, 'users', user.uid, col));
        snap.forEach((d) => batch.delete(d.ref));
      }
      batch.set(doc(db, 'users', user.uid, 'meta', 'stats'), { totalReach: 0, engagementRate: 0, postsScheduled: 0, activeCampaigns: 0, newFollowers: 0, avgReachPerPost: 0, platformStats: [{ name: 'Instagram', followers: 0, growth: '0%' }, { name: 'Facebook', followers: 0, growth: '0%' }, { name: 'TikTok', followers: 0, growth: '0%' }, { name: 'YouTube', followers: 0, growth: '0%' }], reachOverTime: [], ageData: [], locationData: [], engagementByDay: [], lastUpdated: serverTimestamp() });
      await batch.commit();
      setStats({ campaigns: 0, reminders: 0, posts: 0 });
      setDeleteDataOpen(false);
      toast('All data deleted');
    } catch (e: unknown) { toast((e as Error).message || 'Delete failed', 'error'); }
    finally { setDeletingData(false); }
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeletingAccount(true);
    try {
      await reauthenticateWithPopup(auth.currentUser!, googleProvider);
      const batch = writeBatch(db);
      for (const col of ['campaigns', 'reminders', 'posts']) {
        const snap = await getDocs(collection(db, 'users', user.uid, col));
        snap.forEach((d) => batch.delete(d.ref));
      }
      batch.delete(doc(db, 'users', user.uid, 'meta', 'stats'));
      batch.delete(doc(db, 'users', user.uid));
      await batch.commit();
      await deleteUser(auth.currentUser!);
      router.replace('/login');
    } catch (e: unknown) { toast((e as Error).message || 'Delete account failed', 'error'); }
    finally { setDeletingAccount(false); setDeleteAccountOpen(false); }
  };

  const exportData = async () => {
    if (!user) return;
    try {
      const [c, r, p] = await Promise.all([getDocs(collection(db, 'users', user.uid, 'campaigns')), getDocs(collection(db, 'users', user.uid, 'reminders')), getDocs(collection(db, 'users', user.uid, 'posts'))]);
      const data = { exportedAt: new Date().toISOString(), profile: { displayName: user.displayName, email: user.email }, campaigns: c.docs.map((d) => ({ id: d.id, ...d.data() })), reminders: r.docs.map((d) => ({ id: d.id, ...d.data() })), posts: p.docs.map((d) => ({ id: d.id, ...d.data() })) };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `social94-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      URL.revokeObjectURL(url);
      toast('Data exported!');
    } catch { toast('Export failed', 'error'); }
  };

  if (!user) return null;

  const initials = user.displayName ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#0F172A', background: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s' };
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' };
  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'data' as const, label: 'Data & Privacy', icon: Database },
    { id: 'danger' as const, label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(50px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sinp:focus { border-color: #7C3AED !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }
        .stab { display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:10px;border:none;background:transparent;cursor:pointer;font-size:14px;font-weight:500;color:#475569;transition:all 0.15s;width:100%;text-align:left;font-family:Inter,sans-serif; }
        .stab:hover { background:#F1F5F9;color:#0F172A; }
        .stab.act { background:#EDE9FE;color:#7C3AED;font-weight:600; }
        .stab.dng { color:#F43F5E; }
        .stab.dng:hover { background:#FFE4E6; }
        .stab.dng.act { background:#FFE4E6;color:#F43F5E; }
        .ditem { display:flex;align-items:center;justify-content:space-between;padding:15px 0;border-bottom:1px solid #F1F5F9; }
        .ditem:last-child { border-bottom:none; }
        .arow { display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-radius:12px;background:#F8FAFC;border:1px solid #E2E8F0;transition:all 0.15s;margin-bottom:12px; }
        .arow:hover { background:#F1F5F9;border-color:#CBD5E1; }
        .drow { display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-radius:12px;background:#FFF5F5;border:1px solid #FED7D7;margin-bottom:12px;transition:all 0.15s; }
        .drow:hover { background:#FFE4E6; }
      `}</style>

      <ToastBar toasts={toasts} onRemove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
      <ConfirmModal open={clearCacheOpen} title="Clear App Cache" description="This clears all local storage and service worker caches. Your Firestore data is safe." confirmText="Clear Cache" onConfirm={clearCache} onCancel={() => setClearCacheOpen(false)} loading={clearingCache} />
      <ConfirmModal open={deleteDataOpen} title="Delete All User Data" description={`Permanently delete ${stats.campaigns} campaigns, ${stats.reminders} reminders, and ${stats.posts} post analyses. Your account remains. This cannot be undone.`} confirmText="Delete All Data" danger onConfirm={deleteAllData} onCancel={() => setDeleteDataOpen(false)} loading={deletingData} />
      <ConfirmModal open={deleteAccountOpen} title="Delete Your Account" description="This permanently deletes your account and all data. You'll be asked to re-authenticate with Google first. This action is irreversible." confirmText="Delete Account" danger onConfirm={deleteAccount} onCancel={() => setDeleteAccountOpen(false)} loading={deletingAccount} />

      <div>
        {/* Header */}
        <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>⚙️ Settings</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Manage your account and preferences</div>
          </div>
          {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div className="sidebar-avatar" style={{ width: 36, height: 36 }}>{initials}</div>}
        </div>

        <div className="page-wrapper">
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left nav */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 12, position: 'sticky', top: 88 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 14px', borderBottom: '1px solid var(--border-light)', marginBottom: 8 }}>
                {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #EDE9FE' }} /> : <div className="sidebar-avatar" style={{ width: 38, height: 38, fontSize: 14 }}>{initials}</div>}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName || 'User'}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>
              </div>
              {tabs.map((t) => (
                <button key={t.id} className={`stab ${activeTab === t.id ? 'act' : ''} ${t.id === 'danger' ? 'dng' : ''}`} onClick={() => setActiveTab(t.id)}>
                  <t.icon size={16} />{t.label}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── PROFILE ── */}
              {activeTab === 'profile' && (
                <>
                  <div className="card" style={{ padding: 28 }}>
                    <SectionHead icon={User} title="Profile Information" subtitle="Update your public profile details" />
                    {/* Avatar row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ position: 'relative' }}>
                        {user.photoURL
                          ? <img src={user.photoURL} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #EDE9FE' }} />
                          : <div className="sidebar-avatar" style={{ width: 80, height: 80, fontSize: 26 }}>{initials}</div>}
                        <div style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                          <Camera size={13} color="#fff" />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{user.displayName || 'Your Name'}</div>
                        <div style={{ fontSize: 13, color: '#94A3B8', marginTop: 3 }}>{user.email}</div>
                        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: '#EDE9FE', color: '#7C3AED' }}>Free Plan</span>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, background: '#D1FAE5', color: '#10B981' }}>Active</span>
                        </div>
                      </div>
                    </div>

                    {loadingProfile
                      ? <div style={{ textAlign: 'center', padding: '40px 0' }}><Loader2 size={24} color="#94A3B8" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
                      : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                          <div style={{ gridColumn: '1/-1' }}>
                            <label style={lbl}>Display Name</label>
                            <input className="sinp" style={inp} value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="Your full name" />
                          </div>
                          <div style={{ gridColumn: '1/-1' }}>
                            <label style={lbl}>Email <span style={{ fontWeight: 400, color: '#94A3B8', fontSize: 11 }}>(managed by Google)</span></label>
                            <input style={{ ...inp, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }} value={form.email} readOnly />
                          </div>
                          <div style={{ gridColumn: '1/-1' }}>
                            <label style={lbl}>Bio</label>
                            <textarea className="sinp" style={{ ...inp, minHeight: 88, resize: 'vertical' }} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell us about yourself..." />
                          </div>
                          <div>
                            <label style={lbl}>Website</label>
                            <input className="sinp" style={inp} value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://yoursite.com" />
                          </div>
                          <div>
                            <label style={lbl}>Location</label>
                            <input className="sinp" style={inp} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, Country" />
                          </div>
                          <div>
                            <label style={lbl}>Timezone</label>
                            <select className="sinp" style={{ ...inp, cursor: 'pointer' }} value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}>
                              {['UTC-08:00', 'UTC-05:00', 'UTC+00:00', 'UTC+01:00', 'UTC+05:30', 'UTC+08:00', 'UTC+09:00', 'UTC+10:00'].map((tz) => <option key={tz}>{tz}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={lbl}>Language</label>
                            <select className="sinp" style={{ ...inp, cursor: 'pointer' }} value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}>
                              {['English', 'Sinhala', 'Tamil', 'Hindi', 'French', 'Spanish', 'German', 'Japanese'].map((l) => <option key={l}>{l}</option>)}
                            </select>
                          </div>
                        </div>
                      )}

                    {!loadingProfile && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-light)' }}>
                        <button className="btn btn-primary" onClick={saveProfile} disabled={savingProfile} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {savingProfile ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={15} />}
                          {savingProfile ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plan */}
                  <div className="card" style={{ padding: 24 }}>
                    <SectionHead icon={Zap} title="Plan & Subscription" subtitle="Your current plan" color="#F59E0B" />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12, background: 'linear-gradient(135deg, rgba(124,58,237,0.07), rgba(6,182,212,0.07))', border: '1px solid #EDE9FE' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>Free Plan</div>
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>5 AI analyses/day · 10 campaigns · 50 reminders</div>
                      </div>
                      <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={13} />Upgrade Pro</button>
                    </div>
                  </div>
                </>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="card" style={{ padding: 28 }}>
                  <SectionHead icon={Bell} title="Notification Preferences" subtitle="Control when and how you hear from us" color="#06B6D4" />
                  {[
                    { key: 'emailDigest', label: 'Daily Email Digest', desc: 'Summarised analytics delivered to your inbox each morning' },
                    { key: 'campaignAlerts', label: 'Campaign Alerts', desc: 'Get notified when campaigns start, end, or need attention' },
                    { key: 'reminderPush', label: 'Reminder Notifications', desc: 'Push alerts for scheduled social media posts' },
                    { key: 'weeklyReport', label: 'Weekly Performance Report', desc: 'Detailed weekly review delivered every Monday' },
                    { key: 'aiInsights', label: 'AI Insights', desc: 'Gemini AI tips and optimisation suggestions' },
                  ].map((item) => (
                    <div key={item.key} className="ditem">
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{item.desc}</div>
                      </div>
                      <Toggle checked={notifs[item.key as keyof NotificationSettings]} onChange={(v) => setNotifs((n) => ({ ...n, [item.key]: v }))} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button className="btn btn-primary" onClick={saveNotifs} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Save size={15} />Save Preferences</button>
                  </div>
                </div>
              )}

              {/* ── DATA ── */}
              {activeTab === 'data' && (
                <>
                  <div className="card" style={{ padding: 28 }}>
                    <SectionHead icon={Database} title="Your Data" subtitle="Overview of data stored in your account" color="#10B981" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                      {[
                        { label: 'Campaigns', value: loadingStats ? '—' : stats.campaigns, icon: '📣', color: '#7C3AED' },
                        { label: 'Reminders', value: loadingStats ? '—' : stats.reminders, icon: '🔔', color: '#06B6D4' },
                        { label: 'Post Analyses', value: loadingStats ? '—' : stats.posts, icon: '📊', color: '#10B981' },
                      ].map((s) => (
                        <div key={s.label} style={{ padding: 16, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                          <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 3 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="arow">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Download size={18} color="#7C3AED" /></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Export My Data</div>
                          <div style={{ fontSize: 12, color: '#94A3B8' }}>Download all your data as a JSON file</div>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={exportData} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} />Export</button>
                    </div>
                    <div className="arow">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#CFFAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={18} color="#06B6D4" /></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Clear App Cache</div>
                          <div style={{ fontSize: 12, color: '#94A3B8' }}>Clear localStorage, sessionStorage & service worker caches</div>
                        </div>
                      </div>
                      <button className="btn btn-outline btn-sm" onClick={() => setClearCacheOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={14} />Clear</button>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 28 }}>
                    <SectionHead icon={Shield} title="Privacy & Security" subtitle="Your data is encrypted and protected" color="#7C3AED" />
                    {[
                      { label: 'Data Encryption', desc: 'All data encrypted at rest with AES-256' },
                      { label: 'Firebase Authentication', desc: 'Secured via Google Firebase Auth' },
                      { label: 'Firestore Security Rules', desc: 'Per-user data isolation enforced at the database level' },
                    ].map((item) => (
                      <div key={item.label} className="ditem">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <CheckCircle2 size={18} color="#10B981" />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                            <div style={{ fontSize: 12, color: '#94A3B8' }}>{item.desc}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#10B981', background: '#D1FAE5', padding: '3px 10px', borderRadius: 9999 }}>Active</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── DANGER ── */}
              {activeTab === 'danger' && (
                <div className="card" style={{ padding: 28 }}>
                  <SectionHead icon={AlertTriangle} title="Danger Zone" subtitle="Irreversible actions — proceed with caution" color="#F43F5E" />
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: '#FFF5F5', border: '1px solid #FED7D7', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <AlertTriangle size={17} color="#F43F5E" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.6, margin: 0 }}>Actions here are <strong>permanent</strong> and cannot be undone. Be absolutely sure before proceeding.</p>
                  </div>

                  <div className="drow">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Database size={20} color="#F43F5E" /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Delete All User Data</div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Remove all campaigns, reminders & post analyses. Account stays.</div>
                        <div style={{ fontSize: 11, color: '#F43F5E', marginTop: 4, fontWeight: 600 }}>{stats.campaigns} campaigns · {stats.reminders} reminders · {stats.posts} posts</div>
                      </div>
                    </div>
                    <button onClick={() => setDeleteDataOpen(true)} style={{ padding: '9px 16px', borderRadius: 10, border: '1.5px solid #F43F5E', background: 'transparent', color: '#F43F5E', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <Trash2 size={14} />Delete Data
                    </button>
                  </div>

                  <div className="drow">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={20} color="#F43F5E" /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>Delete Account & Profile</div>
                        <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Permanently delete your account and all associated data.</div>
                        <div style={{ fontSize: 11, color: '#F43F5E', marginTop: 4, fontWeight: 600 }}>Requires Google re-authentication. Irreversible.</div>
                      </div>
                    </div>
                    <button onClick={() => setDeleteAccountOpen(true)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: '#F43F5E', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      <Trash2 size={14} />Delete Account
                    </button>
                  </div>

                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #FED7D7' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Session</div>
                    <div className="arow">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <LogOut size={18} color="#94A3B8" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>Sign Out</div>
                          <div style={{ fontSize: 12, color: '#94A3B8' }}>End your current session on this device</div>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={async () => { await signOut(); router.replace('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <LogOut size={13} />Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
