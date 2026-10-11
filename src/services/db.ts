/**
 * CIFAKE: Database Service & Security Layer
 * Implements persistent storage for users, authentication tokens,
 * prediction logs with Grad-CAM artifacts, and project settings.
 */

import { User, PredictionRecord, ProjectConfig } from '../types';

const USERS_STORAGE_KEY = 'cifake_users_db_v1';
const SESSION_STORAGE_KEY = 'cifake_active_session_v1';
const PREDICTIONS_STORAGE_KEY = 'cifake_predictions_db_v1';
const CONFIG_STORAGE_KEY = 'cifake_project_config_v1';

// Default configuration conforming to Section 2 of requirements
export const DEFAULT_CONFIG: ProjectConfig = {
  datasetPath: './dataset/cifake',
  imageSize: [32, 32],
  batchSize: 64,
  epochs: 20,
  learningRate: 0.001,
  modelPath: 'models/saved_models/cifake_modified_cnn2d.h5',
};

// Cryptographic SHA-256 with salt
export async function hashPassword(password: string): Promise<string> {
  const salt = 'cifake_academic_salt_2026';
  const msgUint8 = new TextEncoder().encode(`${salt}_${password}_${salt}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize seed user for immediate academic testing
export async function initDatabase(): Promise<void> {
  const users = getUsers();
  if (users.length === 0) {
    const defaultPasswordHash = await hashPassword('Student@2026');
    const demoUser: User = {
      id: 'usr_demo_academic_01',
      name: 'Academic Researcher',
      email: 'student@university.edu',
      passwordHash: defaultPasswordHash,
      createdAt: new Date().toISOString(),
    };
    saveUsers([demoUser]);
  }
}

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export async function registerUser(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, error: 'All fields are mandatory.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();
  if (users.some(u => u.email === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return { success: true, user: newUser };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();
  const user = users.find(u => u.email === cleanEmail);

  if (!user) {
    return { success: false, error: 'No user account found with this email.' };
  }

  const computedHash = await hashPassword(password);
  if (computedHash !== user.passwordHash) {
    return { success: false, error: 'Incorrect password entered.' };
  }

  // Set active session
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Prediction Records
export function savePredictionRecord(record: Omit<PredictionRecord, 'id' | 'timestamp'>): PredictionRecord {
  const newRecord: PredictionRecord = {
    ...record,
    id: `pred_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  const records = getAllPredictions();
  records.unshift(newRecord);
  // Cap at 100 records to prevent storage quota overflow
  if (records.length > 100) records.pop();

  localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(records));
  return newRecord;
}

export function getUserPredictions(userId: string): PredictionRecord[] {
  const all = getAllPredictions();
  return all.filter(r => r.userId === userId);
}

function getAllPredictions(): PredictionRecord[] {
  try {
    const raw = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deletePredictionRecord(recordId: string, userId: string): boolean {
  const records = getAllPredictions();
  const filtered = records.filter(r => !(r.id === recordId && r.userId === userId));
  if (filtered.length !== records.length) {
    localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
}

export function getUserStats(userId: string) {
  const records = getUserPredictions(userId);
  const total = records.length;
  const realCount = records.filter(r => r.prediction === 'REAL').length;
  const fakeCount = records.filter(r => r.prediction === 'FAKE').length;
  const avgConfidence = total > 0 ? records.reduce((acc, r) => acc + r.confidence, 0) / total : 0;

  return { total, realCount, fakeCount, avgConfidence };
}

// Project Configuration
export function getProjectConfig(): ProjectConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveProjectConfig(config: ProjectConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}
