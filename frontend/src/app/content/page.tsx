'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Hash, Clock, CheckCircle, AlertCircle, Copy, Trash2, History, ImagePlus, X, Image as ImageIcon } from 'lucide-react';
import { QualityRing } from '@/components/ui/QualityRing';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { savePostAnalysis, subscribeToPostHistory, deletePostAnalysis, type PostAnalysis } from '@/lib/firestore';
import { PlatformIcon, PLATFORM_CONFIG, SUPPORTED_PLATFORMS } from '@/components/ui/PlatformIcon';

interface Analysis {
  score: number; sentiment: string; readability: number; engagement: number;
  hashtags: string[]; emojis: string[]; bestTime: string;
  improvements: string[]; strengths: string[]; wordCount: number; characterCount: number;
  imageAnalysis?: string | null;
}

const sentimentConfig = {
  positive: { color: '#10B981', bg: '#D1FAE5', icon: '😊', label: 'Positive' },
  neutral: { color: '#F59E0B', bg: '#FEF3C7', icon: '😐', label: 'Neutral' },
  negative: { color: '#F43F5E', bg: '#FFE4E6', icon: '😟', label: 'Negative' },
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 10;

export default function ContentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram']);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<PostAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── image state ──────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  // Real-time history from Firestore
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToPostHistory(user.uid, setHistory);
    return unsub;
  }, [user]);

  // ── image helpers ─────────────────────────────────────────────────────────
  const applyImage = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Only JPEG, PNG, WebP, or GIF images are supported', 'error'); return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      showToast(`Image must be smaller than ${MAX_FILE_SIZE_MB} MB`, 'error'); return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyImage(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyImage(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  // ── analyze ───────────────────────────────────────────────────────────────
  const analyze = async () => {
    if (!content.trim() && !imageFile) {
      showToast('Please enter some content or upload an image to analyze', 'error'); return;
    }
    setLoading(true);
    setAnalysis(null);

    try {
      let res: Response;

      if (imageFile) {
        // Multimodal: send as FormData
        const form = new FormData();
        form.append('content', content);
        form.append('platforms', JSON.stringify(selectedPlatforms));
        form.append('image', imageFile);
        res = await fetch('/api/gemini/analyze-content', { method: 'POST', body: form });
      } else {
        // Text-only (backward-compatible)
        res = await fetch('/api/gemini/analyze-content', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, platforms: selectedPlatforms }),
        });
      }

      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        showToast('Content analyzed!', 'success');
        if (user) {
          setSaving(true);
          try {
            await savePostAnalysis(user.uid, { content, platforms: selectedPlatforms, ...data.analysis });
          } catch { /* silent */ }
          setSaving(false);
        }
      } else {
        showToast(data.error || 'Analysis failed', 'error');
      }
    } catch { showToast('Failed to connect to AI service', 'error'); }
    setLoading(false);
  };

  const handleDeleteHistory = async (id: string) => {
    if (!user || !id) return;
    try {
      await deletePostAnalysis(user.uid, id);
      showToast('Deleted', 'info');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const loadFromHistory = (post: PostAnalysis) => {
    setContent(post.content);
    setSelectedPlatforms(post.platforms);
    setAnalysis({
      score: post.score, sentiment: post.sentiment, readability: post.readability,
      engagement: post.engagement, hashtags: post.hashtags, emojis: post.emojis,
      bestTime: post.bestTime, improvements: post.improvements, strengths: post.strengths,
      wordCount: post.wordCount, characterCount: post.characterCount,
    });
    setShowHistory(false);
    showToast('Loaded from history', 'info');
  };

  const copyHashtags = () => {
    if (analysis) { navigator.clipboard.writeText(analysis.hashtags.map((h) => `#${h}`).join(' ')); showToast('Hashtags copied!', 'success'); }
  };

  const charLimit = selectedPlatforms.includes('Twitter/X') ? 280 : 2200;
  const charPercent = Math.min((content.length / charLimit) * 100, 100);

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>Content Quality Checker</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Analyze &amp; optimize your posts with Gemini AI</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saving && <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><span className="spinner spinner-sm" />Saving...</span>}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(!showHistory)}>
            <History size={14} />History ({history.length})
          </button>
          <div className="ai-badge"><span className="ai-dot" />Powered by Gemini AI</div>
        </div>
      </div>

      <div className="page-wrapper">
        {/* History Panel */}
        {showHistory && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <span className="card-title">📋 Analysis History</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowHistory(false)}>Close</button>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No history yet. Analyze a post to see it here.</div>
            ) : (
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {history.map((post) => (
                  <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: post.score >= 80 ? '#D1FAE5' : post.score >= 60 ? '#FEF3C7' : '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: post.score >= 80 ? '#10B981' : post.score >= 60 ? '#F59E0B' : '#F43F5E', fontSize: '16px', flexShrink: 0 }}>
                      {post.score}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>{post.platforms.join(', ')} · {post.sentiment} sentiment</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => loadFromHistory(post)}>Load</button>
                      <button className="btn btn-ghost btn-icon" style={{ color: '#F43F5E' }} onClick={() => post.id && handleDeleteHistory(post.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left: Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Platform Selector */}
            <div className="card card-body">
              <div className="form-label" style={{ marginBottom: '12px' }}>Select Platforms</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SUPPORTED_PLATFORMS.map((p) => {
                  const selected = selectedPlatforms.includes(p);
                  const cfg = PLATFORM_CONFIG[p];
                  return (
                    <button key={p} onClick={() => togglePlatform(p)} style={{ padding: '7px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${selected ? cfg.color : 'var(--border)'}`, background: selected ? cfg.bg : 'var(--bg-surface)', color: selected ? cfg.color : 'var(--text-secondary)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <PlatformIcon platform={p} size={16} />{p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload */}
            <div className="card card-body">
              <div className="form-label" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={15} color="var(--primary)" />
                Upload Image <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>(optional — Gemini Vision will analyze it)</span>
              </div>

              {imagePreview ? (
                /* ── Preview ─────────────────────────────────────────────── */
                <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1.5px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Upload preview" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={removeImage}
                    style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.85)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.6)')}
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                  <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImagePlus size={12} />
                    {imageFile?.name} · {((imageFile?.size ?? 0) / 1024).toFixed(0)} KB
                  </div>
                </div>
              ) : (
                /* ── Drop Zone ───────────────────────────────────────────── */
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragging ? 'var(--primary-light)' : 'var(--bg-elevated)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <ImagePlus size={32} color={isDragging ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto' }} />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: isDragging ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '4px' }}>
                    {isDragging ? 'Drop image here' : 'Drag & drop or click to upload'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>JPEG, PNG, WebP, GIF · max {MAX_FILE_SIZE_MB} MB</div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                style={{ display: 'none' }}
                onChange={onFileChange}
              />
            </div>

            {/* Content Input */}
            <div className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div className="form-label">Post Content {imageFile && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}>(optional when image is provided)</span>}</div>
                <span style={{ fontSize: '12px', color: charPercent > 90 ? '#F43F5E' : 'var(--text-muted)' }}>{content.length} / {charLimit}</span>
              </div>
              <textarea className="form-input form-textarea" style={{ minHeight: '160px' }} placeholder={imageFile ? 'Add caption text (optional — AI can work from image alone)...' : 'Paste or type your social media post here...'} value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="progress-bar" style={{ marginTop: '8px' }}>
                <div style={{ height: '100%', borderRadius: '9999px', background: charPercent > 90 ? '#F43F5E' : charPercent > 70 ? '#F59E0B' : '#7C3AED', width: `${charPercent}%`, transition: 'width 0.3s' }} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }} onClick={analyze} disabled={loading || (!content.trim() && !imageFile)}>
                {loading ? <><span className="spinner spinner-sm" />Analyzing with Gemini AI...</> : <><Zap size={17} />{imageFile ? 'Analyze Image & Content' : 'Analyze Content Quality'}</>}
              </button>
            </div>

            {/* Tips */}
            <div className="card card-body" style={{ background: 'var(--primary-light)', border: '1px solid rgba(124,58,237,0.15)' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)', marginBottom: '10px' }}>💡 Quick Tips</div>
              {['Upload an image to let Gemini Vision analyze visual quality & relevance', 'Keep Instagram captions between 138–150 characters for best engagement', 'Use 3–5 targeted hashtags (not 30)', 'Start with a hook — ask a question or use a bold statement'].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--primary-dark)' }}>
                  <span style={{ marginTop: '1px', flexShrink: 0 }}>•</span>{tip}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!analysis && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Waiting for Analysis</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Enter your post content{' '}or upload an image and click &ldquo;Analyze&rdquo; to get AI-powered insights</div>
                {history.length > 0 && (
                  <button className="btn btn-outline" style={{ marginTop: '16px' }} onClick={() => setShowHistory(true)}>
                    <History size={15} />View History ({history.length})
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><div className="spinner" /></div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Analyzing your content{imageFile ? ' & image' : ''}...</div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Gemini AI{imageFile ? ' Vision' : ''} is reviewing your post</div>
              </div>
            )}

            {analysis && (
              <>
                {/* Score + Sentiment */}
                <div className="card card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Overall Quality Score</div>
                  <QualityRing score={analysis.score} />
                  <div style={{ marginTop: '20px' }}>
                    {(() => {
                      const s = analysis.sentiment as keyof typeof sentimentConfig;
                      const cfg = sentimentConfig[s] ?? sentimentConfig.neutral;
                      return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '9999px', background: cfg.bg, color: cfg.color, fontSize: '14px', fontWeight: 600 }}>
                          {cfg.icon} {cfg.label} Sentiment
                        </span>
                      );
                    })()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px', textAlign: 'left' }}>
                    {[{ label: 'Readability', value: analysis.readability }, { label: 'Engagement', value: analysis.engagement }].map((m) => (
                      <div key={m.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.value}/100</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${m.value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <span>{analysis.wordCount} words</span>
                    <span>{analysis.characterCount} chars</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} />{analysis.bestTime}</span>
                  </div>
                </div>

                {/* Image Analysis */}
                {analysis.imageAnalysis && (
                  <div className="card card-body" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(59,130,246,0.07) 100%)', border: '1px solid rgba(124,58,237,0.15)' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={16} color="var(--primary)" /> Image Analysis
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{analysis.imageAnalysis}</div>
                  </div>
                )}

                {/* Hashtags */}
                <div className="card card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Hash size={16} color="var(--primary)" />Suggested Hashtags</div>
                    <button className="btn btn-ghost btn-sm" onClick={copyHashtags}><Copy size={14} />Copy</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.hashtags.map((tag) => <span key={tag} className="tag tag-purple">#{tag}</span>)}
                  </div>
                  {analysis.emojis?.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Suggested Emojis</div>
                      <div style={{ fontSize: '22px', letterSpacing: '4px' }}>{analysis.emojis.join(' ')}</div>
                    </div>
                  )}
                </div>

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div className="card card-body">
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} color="#10B981" />Strengths</div>
                    {analysis.strengths.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        <span style={{ color: '#10B981', flexShrink: 0 }}>✓</span>{s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements?.length > 0 && (
                  <div className="card card-body">
                    <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} color="#F59E0B" />Improvements</div>
                    {analysis.improvements.map((imp, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', background: 'var(--accent-amber-light)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '13px', color: '#92400E', marginBottom: '8px' }}>
                        <span style={{ flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>{imp}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
