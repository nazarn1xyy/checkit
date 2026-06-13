import fs from 'fs';
import path from 'path';

// ── Types ──────────────────────────────────────────────
export type DbUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: string;
  tokens: number;
  analysesCount: number;
  createdAt: number;
  lastActiveAt: number;
};

export type DbEvent = {
  id: string;
  type: 'analyze' | 'questions' | 'chat';
  userEmail: string | null;
  idea: string;
  tool: string | null;
  success: boolean;
  durationMs: number;
  error: string | null;
  timestamp: number;
};

export type DbSettings = {
  freeTokens: number;
  tokensPerAnalysis: number;
  planTokens: Record<string, number>;
  maintenanceMode: boolean;
  chatEnabled: boolean;
};

type Database = {
  users: DbUser[];
  events: DbEvent[];
  settings: DbSettings;
};

// ── File path ──────────────────────────────────────────
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDir() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // Ignore read-only file system error on Vercel
  }
}

// ── Read / Write ───────────────────────────────────────
function readDb(): Database {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    const empty: Database = {
      users: [],
      events: [],
      settings: {
        freeTokens: 3340,
        tokensPerAnalysis: 334,
        planTokens: { '3month': 10000, '6month': 25000, 'year': 60000 },
        maintenanceMode: false,
        chatEnabled: true,
      },
    };
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    } catch (e) {
      // Ignore on Vercel
    }
    return empty;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return { users: [], events: [], settings: { freeTokens: 3340, tokensPerAnalysis: 334, planTokens: {}, maintenanceMode: false, chatEnabled: true } };
  }
}

function writeDb(db: Database) {
  ensureDir();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    // Ignore read-only file system error on Vercel
  }
}

// ── Users ──────────────────────────────────────────────
export function upsertUser(data: { email: string; name: string; role?: 'user' | 'admin'; plan?: string; tokens?: number }): DbUser {
  const db = readDb();
  const idx = db.users.findIndex(u => u.email === data.email);
  if (idx >= 0) {
    db.users[idx].name = data.name;
    db.users[idx].lastActiveAt = Date.now();
    if (data.role) db.users[idx].role = data.role;
    if (data.plan) db.users[idx].plan = data.plan;
    if (data.tokens !== undefined) db.users[idx].tokens = data.tokens;
    writeDb(db);
    return db.users[idx];
  }
  const newUser: DbUser = {
    id: Math.random().toString(36).substring(2, 11),
    name: data.name,
    email: data.email,
    role: data.role || 'user',
    plan: data.plan || 'free',
    tokens: data.tokens ?? 3340,
    analysesCount: 0,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function getAllUsers(): DbUser[] {
  return readDb().users;
}

export function getUserByEmail(email: string): DbUser | null {
  return readDb().users.find(u => u.email === email) || null;
}

export function incrementUserAnalyses(email: string) {
  const db = readDb();
  const user = db.users.find(u => u.email === email);
  if (user) {
    user.analysesCount++;
    user.lastActiveAt = Date.now();
    writeDb(db);
  }
}

// ── Events ─────────────────────────────────────────────
export function logEvent(event: Omit<DbEvent, 'id' | 'timestamp'>): DbEvent {
  const db = readDb();
  const full: DbEvent = {
    ...event,
    id: Math.random().toString(36).substring(2, 11),
    timestamp: Date.now(),
  };
  db.events.push(full);
  // Keep last 10 000 events max
  if (db.events.length > 10000) db.events = db.events.slice(-10000);
  writeDb(db);
  return full;
}

export function getAllEvents(): DbEvent[] {
  return readDb().events;
}

export function getEventsByType(type: DbEvent['type']): DbEvent[] {
  return readDb().events.filter(e => e.type === type);
}

// ── Settings ───────────────────────────────────────────
export function getSettings(): DbSettings {
  return readDb().settings;
}

export function updateSettings(patch: Partial<DbSettings>) {
  const db = readDb();
  db.settings = { ...db.settings, ...patch };
  writeDb(db);
  return db.settings;
}

// ── Stats helpers ──────────────────────────────────────
export function getStats() {
  const db = readDb();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const totalUsers = db.users.filter(u => u.role !== 'admin').length;
  const active7d = db.users.filter(u => u.role !== 'admin' && now - u.lastActiveAt < 7 * day).length;
  const active30d = db.users.filter(u => u.role !== 'admin' && now - u.lastActiveAt < 30 * day).length;

  const totalAnalyses = db.events.filter(e => e.type === 'analyze').length;
  const successAnalyses = db.events.filter(e => e.type === 'analyze' && e.success).length;
  const failedAnalyses = totalAnalyses - successAnalyses;
  const successRate = totalAnalyses > 0 ? Math.round((successAnalyses / totalAnalyses) * 100) : 0;

  const analyzeDurations = db.events.filter(e => e.type === 'analyze' && e.success).map(e => e.durationMs);
  const avgDuration = analyzeDurations.length > 0 ? Math.round(analyzeDurations.reduce((a, b) => a + b, 0) / analyzeDurations.length) : 0;

  const paidUsers = db.users.filter(u => u.plan !== 'free' && u.role !== 'admin').length;
  const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

  const totalTokensSpent = db.users.reduce((sum, u) => {
    if (u.role === 'admin') return sum;
    const initial = u.plan === 'free' ? 3340 : (db.settings.planTokens[u.plan] || 3340);
    return sum + Math.max(0, initial - u.tokens);
  }, 0);

  // Per-day request counts (last 30 days)
  const requestsByDay: Record<string, number> = {};
  const usersByDay: Record<string, Set<string>> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * day);
    const key = d.toISOString().slice(0, 10);
    requestsByDay[key] = 0;
    usersByDay[key] = new Set();
  }
  db.events.forEach(e => {
    const key = new Date(e.timestamp).toISOString().slice(0, 10);
    if (key in requestsByDay) {
      requestsByDay[key]++;
      if (e.userEmail) usersByDay[key].add(e.userEmail);
    }
  });

  const requestsChart = Object.entries(requestsByDay).map(([date, count]) => ({
    date,
    requests: count,
    users: usersByDay[date]?.size || 0,
  }));

  // Tool distribution
  const toolCounts: Record<string, number> = { none: 0, market: 0, competitors: 0, swot: 0, financials: 0, audience: 0 };
  db.events.filter(e => e.type === 'analyze').forEach(e => {
    const t = e.tool || 'none';
    toolCounts[t] = (toolCounts[t] || 0) + 1;
  });
  const toolChart = Object.entries(toolCounts).map(([name, value]) => ({ name, value }));

  // Plan distribution
  const planCounts: Record<string, number> = { free: 0, '3month': 0, '6month': 0, year: 0 };
  db.users.filter(u => u.role !== 'admin').forEach(u => {
    planCounts[u.plan] = (planCounts[u.plan] || 0) + 1;
  });
  const planChart = Object.entries(planCounts).map(([name, value]) => ({ name, value }));

  // User growth (cumulative by day, last 30 days)
  const growthChart: { date: string; total: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * day);
    const key = d.toISOString().slice(0, 10);
    const cutoff = d.getTime() + day;
    const total = db.users.filter(u => u.role !== 'admin' && u.createdAt < cutoff).length;
    growthChart.push({ date: key, total });
  }

  // API health
  const last100 = db.events.slice(-100);
  const errorRate = last100.length > 0 ? Math.round((last100.filter(e => !e.success).length / last100.length) * 100) : 0;
  const avgLatency = last100.length > 0 ? Math.round(last100.filter(e => e.success).reduce((s, e) => s + e.durationMs, 0) / Math.max(1, last100.filter(e => e.success).length)) : 0;

  return {
    totalUsers,
    active7d,
    active30d,
    totalAnalyses,
    successAnalyses,
    failedAnalyses,
    successRate,
    avgDuration,
    paidUsers,
    conversionRate,
    totalTokensSpent,
    requestsChart,
    toolChart,
    planChart,
    growthChart,
    apiHealth: { errorRate, avgLatency, last100Count: last100.length },
  };
}
