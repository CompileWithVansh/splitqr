import type { UpiProfile, TransactionRecord } from '../types';

const PROFILES_LIST_KEY = 'splitqr_profiles_list';
const ACTIVE_PROFILE_ID_KEY = 'splitqr_active_profile_id';
const HAS_SEEN_ONBOARDING_KEY = 'splitqr_has_onboarded';

export const DEMO_PROFILE: UpiProfile = {
  id: 'demo_store',
  storeName: 'Demo Store',
  payeeName: 'Cashier',
  primaryUpiId: 'merchant@upi',
  secondaryUpiId: '',
  splitThreshold: 1999,
  splitStrategy: 'random',
  multiAccountMode: false,
  soundEnabled: true,
  hapticsEnabled: true,
  pin: '',
  createdAt: new Date().toISOString(),
};

export function hasCompletedOnboarding(): boolean {
  return true; // Start directly on the terminal without blocking popups
}

export function setHasCompletedOnboarding(val: boolean = true): void {
  localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, String(val));
}

export function loadAllProfiles(): UpiProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_LIST_KEY);
    if (!raw) return [DEMO_PROFILE];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEMO_PROFILE];
  } catch {
    return [DEMO_PROFILE];
  }
}

export function saveAllProfiles(profiles: UpiProfile[]): void {
  try {
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles list:', err);
  }
}

export function getActiveProfile(): UpiProfile {
  const profiles = loadAllProfiles();
  const activeId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  if (activeId) {
    const matched = profiles.find((p) => p.id === activeId);
    if (matched) return matched;
  }
  return profiles[0] || DEMO_PROFILE;
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
}

export function saveOrUpdateProfile(profile: UpiProfile): void {
  const profiles = loadAllProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  saveAllProfiles(profiles);
  setActiveProfileId(profile.id);
}

export function deleteProfile(id: string): UpiProfile | null {
  const profiles = loadAllProfiles();
  if (profiles.length <= 1) return null; // keep at least one profile
  const filtered = profiles.filter((p) => p.id !== id);
  saveAllProfiles(filtered);
  const nextActive = filtered[0];
  setActiveProfileId(nextActive.id);
  return nextActive;
}

// ---------------- Profile-Scoped Transaction History ----------------
function getHistoryStorageKey(profileId: string): string {
  return `splitqr_history_${profileId}`;
}

export function loadProfileHistory(profileId: string): TransactionRecord[] {
  try {
    const key = getHistoryStorageKey(profileId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProfileHistory(profileId: string, history: TransactionRecord[]): void {
  try {
    const key = getHistoryStorageKey(profileId);
    localStorage.setItem(key, JSON.stringify(history.slice(0, 200)));
  } catch (err) {
    console.error('Failed to save profile history:', err);
  }
}

export function recordProfileTransaction(profileId: string, record: TransactionRecord): void {
  const list = loadProfileHistory(profileId);
  list.unshift(record);
  saveProfileHistory(profileId, list);
}

// ---------------- Backup & Export / Import ----------------
export function exportAllData(): string {
  const profiles = loadAllProfiles();
  const histories: Record<string, TransactionRecord[]> = {};
  for (const p of profiles) {
    histories[p.id] = loadProfileHistory(p.id);
  }
  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    profiles,
    histories,
  }, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.profiles || !Array.isArray(data.profiles)) return false;
    saveAllProfiles(data.profiles);
    if (data.histories) {
      for (const [profId, list] of Object.entries(data.histories)) {
        if (Array.isArray(list)) {
          saveProfileHistory(profId, list as TransactionRecord[]);
        }
      }
    }
    if (data.profiles[0]) {
      setActiveProfileId(data.profiles[0].id);
    }
    setHasCompletedOnboarding(true);
    return true;
  } catch (err) {
    console.error('Failed to import backup data:', err);
    return false;
  }
}

export function wipeAllStoredData(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('splitqr_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Failed to wipe stored data:', err);
  }
}
