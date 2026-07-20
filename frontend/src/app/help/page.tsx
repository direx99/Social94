'use client';

import { useState } from 'react';
import {
  HelpCircle, Search, ChevronDown, ChevronUp, MessageSquare,
  BookOpen, Zap, Mail,
  ExternalLink, ArrowRight, CheckCircle2, Globe,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const faqs = [
  {
    category: 'Getting Started',
    icon: '🚀',
    color: '#7C3AED',
    items: [
      {
        q: 'How do I connect my social media accounts?',
        a: 'Currently Social94 pulls your data manually from the Audience Reach page. Navigate to the Audience page and use the follower entry section to input your platform stats. Full OAuth integration with Instagram, Facebook, and TikTok is coming in the next update.',
      },
      {
        q: 'How do I get started with my first campaign?',
        a: 'Go to the Campaigns page and click "New Campaign". Fill in your campaign name, goal, target platforms, start/end dates, and budget. Once created, your campaign will appear in the dashboard and you can track its progress in real-time.',
      },
      {
        q: 'What is the AI Content Quality analyser?',
        a: 'The Content Quality page lets you paste any social media post. Our Gemini AI engine scores it across 6 dimensions — engagement potential, readability, sentiment, hashtags, emojis, and optimal posting time — then gives you actionable improvements.',
      },
    ],
  },
  {
    category: 'AI & Analytics',
    icon: '🤖',
    color: '#06B6D4',
    items: [
      {
        q: 'How many AI analyses can I run per day?',
        a: 'On the Free plan you can run up to 5 AI content analyses per day. Upgrading to Pro gives you unlimited daily analyses, priority processing, and access to advanced image analysis features powered by Gemini Vision.',
      },
      {
        q: 'How accurate are the AI insights?',
        a: 'Our AI insights are powered by Google Gemini Pro, one of the most capable language models available. Accuracy is generally high for text-based analysis, but we recommend treating insights as a guide rather than absolute truth. Always combine AI suggestions with your own audience knowledge.',
      },
      {
        q: 'Can I analyse images and videos?',
        a: 'Image analysis is available in the Content Quality page — you can upload images alongside your post text for a combined score. Video analysis is on our roadmap for a future release.',
      },
    ],
  },
  {
    category: 'Reminders & Campaigns',
    icon: '📣',
    color: '#10B981',
    items: [
      {
        q: 'How do reminders work?',
        a: 'Reminders are stored in your Firestore account and shown in the Reminders page. You can set one-time or recurring reminders for any platform. Currently reminders are displayed in-app; email and push notification delivery will be available in the Pro plan.',
      },
      {
        q: 'Can I duplicate or edit a campaign?',
        a: 'Yes — on the Campaigns page, each campaign card has an Edit button that opens a full edit modal. You can update any field including status, dates, budget, and platform targeting.',
      },
      {
        q: 'What campaign statuses are available?',
        a: 'Campaigns can be in one of four states: Draft (not yet live), Scheduled (set for a future start), Active (currently running), and Completed (ended). You can manually change the status at any time from the campaign edit modal.',
      },
    ],
  },
  {
    category: 'Account & Billing',
    icon: '💳',
    color: '#F59E0B',
    items: [
      {
        q: 'How do I upgrade to Pro?',
        a: 'Click the "Upgrade Pro" button in the sidebar or on the Settings page. Pro includes unlimited AI analyses, advanced analytics, priority support, image & video analysis, and custom branding options.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Settings → Danger Zone → Delete Account & Profile. You will be asked to re-authenticate with Google before deletion. This permanently removes all your data and cannot be undone.',
      },
      {
        q: 'Is my data safe?',
        a: 'Yes. All data is stored in Google Firebase Firestore with per-user security rules, meaning no other user can access your data. Data is encrypted at rest with AES-256 and in transit with TLS. See our Privacy Policy for full details.',
      },
    ],
  },
];

const guides = [
  { icon: '📊', title: 'Audience Reach Guide', desc: 'Learn how to track and grow your cross-platform follower base', color: '#7C3AED', link: '/audience' },
  { icon: '✍️', title: 'Content Quality 101', desc: 'Write posts that score 90+ with our AI engine', color: '#06B6D4', link: '/content' },
  { icon: '📣', title: 'Running Your First Campaign', desc: 'Step-by-step guide to launching and tracking a campaign', color: '#10B981', link: '/campaigns' },
  { icon: '🔔', title: 'Mastering Reminders', desc: 'Never miss a posting schedule with smart reminders', color: '#F59E0B', link: '/reminders' },
];

export default function HelpPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', email: user?.email || '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const filteredFaqs = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) => !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>❓ Help & Support</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Guides, FAQs and contact support</div>
        </div>
        {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div className="sidebar-avatar" style={{ width: 36, height: 36 }}>{initials}</div>}
      </div>

      <div className="page-wrapper">

        {/* Hero Search */}
        <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)', borderRadius: 20, padding: '40px 36px', marginBottom: 28, color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, opacity: 0.8, marginBottom: 10, textTransform: 'uppercase' }}>Support Center</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: 10, color: '#fff' }}>How can we help you?</h1>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 24, lineHeight: 1.6 }}>Search our knowledge base or browse categories below</p>
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search size={18} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs, guides, topics…"
              style={{ width: '100%', padding: '14px 16px 14px 46px', borderRadius: 14, border: 'none', fontSize: 14, background: 'rgba(255,255,255,0.95)', color: '#0F172A', outline: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: BookOpen, label: 'Guides', desc: 'Step-by-step tutorials', color: '#7C3AED', bg: '#EDE9FE', link: '#guides' },
            { icon: HelpCircle, label: 'FAQs', desc: 'Common questions answered', color: '#06B6D4', bg: '#CFFAFE', link: '#faqs' },
            { icon: MessageSquare, label: 'Contact Us', desc: 'Send a support message', color: '#10B981', bg: '#D1FAE5', link: '#contact' },
            { icon: Globe, label: 'Privacy Policy', desc: 'How we handle your data', color: '#F59E0B', bg: '#FEF3C7', link: '/privacy' },
          ].map((item) => (
            <a key={item.label} href={item.link} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 16px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={20} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Guides */}
        <div id="guides" className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={22} color="#7C3AED" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Getting Started Guides</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>Everything you need to master Social94</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {guides.map((g) => (
              <Link key={g.title} href={g.link} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border)', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLElement).style.borderColor = g.color; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: g.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{g.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.title}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{g.desc}</div>
                  </div>
                  <ArrowRight size={16} color="#94A3B8" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#CFFAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HelpCircle size={22} color="#06B6D4" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Frequently Asked Questions</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{search ? `Showing results for "${search}"` : 'Browse by category'}</div>
            </div>
          </div>

          {filteredFaqs.length === 0 && (
            <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No results found</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>Try a different search term or browse the categories above</div>
            </div>
          )}

          {filteredFaqs.map((cat) => (
            <div key={cat.category} className="card" style={{ padding: 24, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: cat.color, fontFamily: 'Outfit, sans-serif' }}>{cat.category}</span>
              </div>
              {cat.items.map((item) => {
                const key = `${cat.category}-${item.q}`;
                const isOpen = openFaq === key;
                return (
                  <div key={item.q} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : key)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>{item.q}</span>
                      {isOpen ? <ChevronUp size={18} color="#94A3B8" style={{ flexShrink: 0 }} /> : <ChevronDown size={18} color="#94A3B8" style={{ flexShrink: 0 }} />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 0 16px', fontSize: 14, color: '#475569', lineHeight: 1.7 }}>{item.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div id="contact" className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={22} color="#10B981" />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Contact Support</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>We typically respond within 24 hours</div>
            </div>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} color="#10B981" />
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Message Sent!</div>
              <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>Thanks for reaching out. Our team will get back to you within 24 hours.</div>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setSubmitted(false)}>Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Your Email</label>
                  <input
                    value={supportForm.email}
                    onChange={(e) => setSupportForm((f) => ({ ...f, email: e.target.value }))}
                    required type="email"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' }}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Subject</label>
                  <select
                    value={supportForm.subject}
                    onChange={(e) => setSupportForm((f) => ({ ...f, subject: e.target.value }))}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', cursor: 'pointer', background: '#fff' }}
                  >
                    <option value="">Select a topic…</option>
                    <option>AI Analysis not working</option>
                    <option>Campaign issue</option>
                    <option>Billing or subscription</option>
                    <option>Data export / deletion</option>
                    <option>Feature request</option>
                    <option>Bug report</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Message</label>
                  <textarea
                    value={supportForm.message}
                    onChange={(e) => setSupportForm((f) => ({ ...f, message: e.target.value }))}
                    required rows={5}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                    placeholder="Describe your issue or question in detail…"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {submitting
                      ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Sending…</>
                      : <><Mail size={15} />Send Message</>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Status & Social */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} /> All Systems Operational
            </div>
            {['API Services', 'Gemini AI Engine', 'Firebase Database', 'Authentication'].map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: '#475569' }}>{s}</span>
                <span style={{ color: '#10B981', fontWeight: 600, fontSize: 11 }}>Operational</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>More Resources</div>
            {[
              { icon: ExternalLink, label: 'Release Notes', desc: 'Latest features & fixes', color: '#7C3AED' },
              { icon: ExternalLink, label: 'Follow on X', desc: 'Stay updated @social94ai', color: '#1DA1F2' },
              { icon: Globe, label: 'Privacy Policy', desc: 'How we protect your data', color: '#10B981', link: '/privacy' },
              { icon: Zap, label: 'Upgrade to Pro', desc: 'Unlock full AI power', color: '#F59E0B' },
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}>
                <item.icon size={16} color={item.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{item.desc}</div>
                </div>
                <ArrowRight size={14} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
