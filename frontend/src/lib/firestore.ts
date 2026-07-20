import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Campaign {
  id?: string;
  name: string;
  goal: string;
  platforms: string[];
  status: 'active' | 'scheduled' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
  budget: string;
  reach: string;
  engagement: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Reminder {
  id?: string;
  title: string;
  message: string;
  platform: string;
  datetime: string;
  recurrence: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt?: Timestamp;
}

export interface PostAnalysis {
  id?: string;
  content: string;
  platforms: string[];
  score: number;
  sentiment: string;
  readability: number;
  engagement: number;
  hashtags: string[];
  emojis: string[];
  bestTime: string;
  improvements: string[];
  strengths: string[];
  wordCount: number;
  characterCount: number;
  analyzedAt?: Timestamp;
}

export interface PlatformStats {
  name: string;
  followers: number;
  growth: string;
}

export interface ReachDataPoint {
  month: string;
  instagram: number;
  facebook: number;
  tiktok: number;
  youtube: number;
}

export interface UserStats {
  totalReach: number;
  engagementRate: number;
  postsScheduled: number;
  activeCampaigns: number;
  newFollowers: number;
  avgReachPerPost: number;
  platformStats: PlatformStats[];
  reachOverTime: ReachDataPoint[];
  ageData: { age: string; percentage: number }[];
  locationData: { country: string; percent: number }[];
  engagementByDay: { day: string; rate: number }[];
  lastUpdated?: Timestamp;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt?: Timestamp;
  plan: 'free' | 'pro';
}

// ─── Default Stats ─────────────────────────────────────────────────────────────

export const defaultStats: UserStats = {
  totalReach: 0,
  engagementRate: 0,
  postsScheduled: 0,
  activeCampaigns: 0,
  newFollowers: 0,
  avgReachPerPost: 0,
  platformStats: [
    { name: 'Instagram', followers: 0, growth: '0%' },
    { name: 'Facebook', followers: 0, growth: '0%' },
    { name: 'TikTok', followers: 0, growth: '0%' },
    { name: 'YouTube', followers: 0, growth: '0%' },
  ],
  reachOverTime: [],
  ageData: [
    { age: '18–24', percentage: 0 },
    { age: '25–34', percentage: 0 },
    { age: '35–44', percentage: 0 },
    { age: '45–54', percentage: 0 },
    { age: '55+', percentage: 0 },
  ],
  locationData: [],
  engagementByDay: [
    { day: 'Mon', rate: 0 },
    { day: 'Tue', rate: 0 },
    { day: 'Wed', rate: 0 },
    { day: 'Thu', rate: 0 },
    { day: 'Fri', rate: 0 },
    { day: 'Sat', rate: 0 },
    { day: 'Sun', rate: 0 },
  ],
};

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'createdAt' | 'plan'>) {
  const userRef = doc(db, 'users', uid);
  const existing = await getDoc(userRef);
  if (!existing.exists()) {
    await setDoc(userRef, {
      ...data,
      plan: 'free',
      createdAt: serverTimestamp(),
    });
    // Init default stats sub-doc
    await setDoc(doc(db, 'users', uid, 'meta', 'stats'), {
      ...defaultStats,
      lastUpdated: serverTimestamp(),
    });
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getUserStats(uid: string): Promise<UserStats> {
  const ref = doc(db, 'users', uid, 'meta', 'stats');
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserStats;
  return defaultStats;
}

export async function updateUserStats(uid: string, stats: Partial<UserStats>) {
  const ref = doc(db, 'users', uid, 'meta', 'stats');
  await setDoc(ref, { ...stats, lastUpdated: serverTimestamp() }, { merge: true });
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

export function subscribeToCampaigns(uid: string, callback: (campaigns: Campaign[]) => void): Unsubscribe {
  const q = query(collection(db, 'users', uid, 'campaigns'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const campaigns = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Campaign));
    callback(campaigns);
  });
}

export async function addCampaign(uid: string, campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'campaigns'), {
    ...campaign,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCampaign(uid: string, campaignId: string, data: Partial<Campaign>) {
  await updateDoc(doc(db, 'users', uid, 'campaigns', campaignId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCampaign(uid: string, campaignId: string) {
  await deleteDoc(doc(db, 'users', uid, 'campaigns', campaignId));
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export function subscribeToReminders(uid: string, callback: (reminders: Reminder[]) => void): Unsubscribe {
  const q = query(collection(db, 'users', uid, 'reminders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const reminders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reminder));
    callback(reminders);
  });
}

export async function addReminder(uid: string, reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'reminders'), {
    ...reminder,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateReminderStatus(uid: string, reminderId: string, status: Reminder['status']) {
  await updateDoc(doc(db, 'users', uid, 'reminders', reminderId), { status });
}

export async function deleteReminder(uid: string, reminderId: string) {
  await deleteDoc(doc(db, 'users', uid, 'reminders', reminderId));
}

// ─── Post Analysis History ─────────────────────────────────────────────────────

export function subscribeToPostHistory(uid: string, callback: (posts: PostAnalysis[]) => void): Unsubscribe {
  const q = query(collection(db, 'users', uid, 'posts'), orderBy('analyzedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostAnalysis));
    callback(posts);
  });
}

export async function savePostAnalysis(uid: string, analysis: Omit<PostAnalysis, 'id' | 'analyzedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'users', uid, 'posts'), {
    ...analysis,
    analyzedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deletePostAnalysis(uid: string, postId: string) {
  await deleteDoc(doc(db, 'users', uid, 'posts', postId));
}
