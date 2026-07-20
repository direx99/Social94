'use client';

import { useState } from 'react';
import {
  Shield, Lock, Eye, Database, Server, AlertTriangle,
  CheckCircle2, Mail, Globe, ArrowRight, ChevronDown, ChevronUp, Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const sections = [
  {
    id: 'collect',
    icon: Database,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: '1. Data We Collect',
    content: [
      {
        subtitle: 'Account Information',
        text: 'When you sign in with Google, we receive your name, email address, and profile photo URL from your Google account. This information is stored in Firebase Firestore under your unique user ID and is used solely to personalise your experience within Social94.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We store data you create within the app: campaigns, reminders, post analyses, audience statistics, and notification preferences. This data lives in your private Firestore sub-collection and is never shared with other users or third parties.',
      },
      {
        subtitle: 'Content You Analyse',
        text: 'When you use the AI Content Quality tool, the text (and optionally images) you submit are sent to the Google Gemini API for analysis. We do not permanently store the raw content of your posts; only the resulting analysis scores and metadata are saved to your account.',
      },
    ],
  },
  {
    id: 'use',
    icon: Eye,
    color: '#06B6D4',
    bg: '#CFFAFE',
    title: '2. How We Use Your Data',
    content: [
      {
        subtitle: 'To Power the App',
        text: 'Your profile information, campaigns, reminders, and stats are used exclusively to render your personalised dashboard and provide Social94\'s features. We do not use your data for advertising, resale, or any purpose outside of providing the service.',
      },
      {
        subtitle: 'AI Analysis',
        text: 'Content submitted for AI analysis is forwarded to the Google Gemini API. Google\'s usage policies apply to this data. We do not use your content to train our own models. Analysis results are stored temporarily in your account for reference.',
      },
      {
        subtitle: 'Service Improvement',
        text: 'We may use anonymised, aggregated usage metrics (e.g. feature adoption rates) to improve the app. These metrics cannot be used to identify individual users.',
      },
    ],
  },
  {
    id: 'storage',
    icon: Server,
    color: '#10B981',
    bg: '#D1FAE5',
    title: '3. Data Storage & Security',
    content: [
      {
        subtitle: 'Firebase Infrastructure',
        text: 'All user data is stored on Google Firebase (Firestore & Authentication), hosted in Google Cloud. Firebase operates ISO 27001, SOC 1, SOC 2, and SOC 3 certified data centres with AES-256 encryption at rest and TLS in transit.',
      },
      {
        subtitle: 'Access Controls',
        text: 'Firestore Security Rules ensure that each user can only read and write their own documents. No other user — including Social94 administrators — can access your personal data without explicit re-authentication.',
      },
      {
        subtitle: 'Data Retention',
        text: 'Your data is retained as long as your account is active. You can delete all data at any time from Settings → Danger Zone. Account deletion permanently removes all associated Firestore documents and revokes your Firebase Auth identity.',
      },
    ],
  },
  {
    id: 'sharing',
    icon: Globe,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: '4. Third-Party Services',
    content: [
      {
        subtitle: 'Google Firebase',
        text: 'We use Firebase Authentication and Firestore for identity management and data storage. Firebase is governed by Google\'s Privacy Policy (policies.google.com/privacy).',
      },
      {
        subtitle: 'Google Gemini API',
        text: 'Content submitted for AI analysis is processed by the Google Gemini API. This processing is subject to Google\'s API Terms of Service. We do not sell or otherwise share your data with Gemini beyond what is necessary to process your analysis request.',
      },
      {
        subtitle: 'No Other Third Parties',
        text: 'We do not use advertising networks, analytics trackers (e.g. Google Analytics), or data brokers. We do not sell your personal information to any third party, ever.',
      },
    ],
  },
  {
    id: 'rights',
    icon: CheckCircle2,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access & Portability',
        text: 'You can export all of your data at any time from Settings → Data & Privacy → Export My Data. The export is a JSON file containing your profile, campaigns, reminders, and post analyses.',
      },
      {
        subtitle: 'Correction',
        text: 'You can update your display name, bio, website, location, timezone, and language at any time from Settings → Profile.',
      },
      {
        subtitle: 'Deletion (Right to be Forgotten)',
        text: 'You have the right to delete all your data at any time. Go to Settings → Danger Zone to either delete all content data while keeping your account, or permanently delete your entire account and all associated data.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: Lock,
    color: '#10B981',
    bg: '#D1FAE5',
    title: '6. Cookies & Local Storage',
    content: [
      {
        subtitle: 'Session Storage',
        text: 'Social94 uses browser localStorage and sessionStorage to cache UI state and reduce Firestore reads. This data is stored locally on your device and never transmitted to our servers.',
      },
      {
        subtitle: 'Authentication Tokens',
        text: 'Firebase Authentication stores your auth tokens in IndexedDB to maintain your login session across page refreshes. These tokens are managed by the Firebase SDK and are automatically refreshed.',
      },
      {
        subtitle: 'No Tracking Cookies',
        text: 'We do not use any third-party tracking cookies, advertising pixels, or fingerprinting technologies. You can clear all locally stored data from Settings → Data & Privacy → Clear App Cache.',
      },
    ],
  },
  {
    id: 'changes',
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: '7. Policy Changes',
    content: [
      {
        subtitle: 'Notification of Changes',
        text: 'If we make material changes to this Privacy Policy, we will notify you via a banner in the app and by updating the "Last Updated" date below. Continued use of Social94 after changes constitutes acceptance of the updated policy.',
      },
      {
        subtitle: 'Version History',
        text: 'This policy was last updated on 19 July 2026. Previous versions are available on request by contacting our support team.',
      },
    ],
  },
];

export default function PrivacyPage() {
  const { user } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>('collect');

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>🔒 Privacy Policy</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>How Social94 collects, uses, and protects your data</div>
        </div>
        {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div className="sidebar-avatar" style={{ width: 36, height: 36 }}>{initials}</div>}
      </div>

      <div className="page-wrapper">

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 20, padding: '40px 36px', marginBottom: 28, color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 80, width: 160, height: 160, borderRadius: '50%', background: 'rgba(6,182,212,0.10)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={28} color="#A78BFA" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Your Privacy Matters</div>
                <div style={{ fontSize: 13, opacity: 0.65, marginTop: 2 }}>Last updated: 19 July 2026</div>
              </div>
            </div>
            <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.75, maxWidth: 640, marginBottom: 20 }}>
              Social94 is built on the principle that your data belongs to you. We collect only what is necessary to run the service, we never sell it, and we give you full control to export or delete it at any time.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['No Ads', 'No Data Selling', 'GDPR Principles', 'Full Data Portability', 'AES-256 Encryption'].map((badge) => (
                <span key={badge} style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,0.12)', color: '#E2E8F0', border: '1px solid rgba(255,255,255,0.15)' }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { icon: '🚫', title: 'No Ads. Ever.', desc: 'We do not serve ads or share data with advertisers', color: '#F43F5E', bg: '#FFE4E6' },
            { icon: '📦', title: 'Data Portability', desc: 'Export all your data as JSON any time, instantly', color: '#7C3AED', bg: '#EDE9FE' },
            { icon: '🗑️', title: 'Right to Delete', desc: 'Delete all data or your full account in one click', color: '#10B981', bg: '#D1FAE5' },
          ].map((s) => (
            <div key={s.title} style={{ padding: '20px 20px', borderRadius: 14, background: s.bg, border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

          {/* TOC */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, position: 'sticky', top: 88 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Table of Contents</div>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: openSection === s.id ? s.bg : 'transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 2, transition: 'all 0.15s', fontSize: 13, fontWeight: openSection === s.id ? 600 : 500, color: openSection === s.id ? s.color : '#475569' }}
              >
                <s.icon size={14} color={openSection === s.id ? s.color : '#94A3B8'} />
                {s.title.replace(/^\d+\.\s/, '')}
              </button>
            ))}
            <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 14, paddingTop: 14 }}>
              <Link href="/help" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7C3AED', fontWeight: 600, textDecoration: 'none' }}>
                <ArrowRight size={14} />View Help Centre
              </Link>
            </div>
          </div>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sections.map((section) => {
              const isOpen = openSection === section.id;
              return (
                <div key={section.id} className="card" style={{ padding: 0, overflow: 'hidden', border: isOpen ? `1.5px solid ${section.color}40` : '1px solid var(--border)' }}>
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '20px 24px', background: isOpen ? section.bg + 'AA' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: section.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <section.icon size={20} color={section.color} />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', fontFamily: 'Outfit, sans-serif' }}>{section.title}</div>
                    </div>
                    {isOpen ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 24px 24px' }}>
                      {section.content.map((block) => (
                        <div key={block.subtitle} style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: section.color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CheckCircle2 size={14} />
                            {block.subtitle}
                          </div>
                          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, margin: 0 }}>{block.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Contact */}
            <div className="card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={22} color="#7C3AED" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Questions About This Policy?</div>
                  <div style={{ fontSize: 13, color: '#94A3B8' }}>We&apos;re happy to clarify anything</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 16 }}>
                If you have questions, concerns, or requests related to your privacy or this policy, please contact us through the Help Centre. We aim to respond within 48 hours.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/help#contact" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={15} />Contact Support
                  </button>
                </Link>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={15} />Manage Your Data
                  </button>
                </Link>
              </div>
            </div>

            {/* Footer note */}
            <div style={{ padding: '16px 20px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Zap size={18} color="#7C3AED" />
              <div style={{ fontSize: 13, color: '#475569' }}>
                Social94 is a product built with privacy-first principles. We are committed to transparency and will never monetise your personal data.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
