'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

type Stats = {
  requestsChart: { date: string; requests: number; users: number }[];
  growthChart: { date: string; total: number }[];
  toolChart: { name: string; value: number }[];
  totalAnalyses: number;
  successRate: number;
  avgDuration: number;
  apiHealth: { errorRate: number; avgLatency: number; last100Count: number };
};

const toolLabels: Record<string, string> = {
  none: 'Без фокусу',
  market: 'Ринок',
  competitors: 'Конкуренти',
  swot: 'SWOT',
  financials: 'Фінанси',
  audience: 'Аудиторія',
};

const COLORS = ['#6c5ce7', '#00cec9', '#fdcb6e', '#e17055', '#74b9ff', '#a29bfe'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">Завантаження...</div>;
  }

  // Compute hourly distribution from requestsChart dates
  const dailyAvg = stats.requestsChart.reduce((s, d) => s + d.requests, 0) / Math.max(1, stats.requestsChart.filter(d => d.requests > 0).length);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Детальна аналітика</h1>
        <p className="text-sm text-gray-500 mt-1">Тренди та розподіли за 30 днів</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{stats.totalAnalyses}</div>
          <div className="text-xs text-gray-500 mt-1">Усього аналізів</div>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.successRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Успішність</div>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{(stats.avgDuration / 1000).toFixed(1)}с</div>
          <div className="text-xs text-gray-500 mt-1">Середній час</div>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-brand">{dailyAvg.toFixed(1)}</div>
          <div className="text-xs text-gray-500 mt-1">Запитів / день</div>
        </div>
      </div>

      {/* Requests line chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Запити та активні користувачі за день</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.requestsChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} />
            <Legend />
            <Line type="monotone" dataKey="requests" stroke="#6c5ce7" strokeWidth={2} dot={false} name="Запити" />
            <Line type="monotone" dataKey="users" stroke="#00cec9" strokeWidth={2} dot={false} name="Користувачі" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Growth area chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Кумулятивний ріст користувачів</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={stats.growthChart}>
            <defs>
              <linearGradient id="aGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00cec9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00cec9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: '#666' }} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="total" stroke="#00cec9" fill="url(#aGrowth)" strokeWidth={2} name="Користувачів" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tool bar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Використання інструментів</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.toolChart} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#666' }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#aaa' }} tickFormatter={v => toolLabels[v] || v} width={100} />
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} formatter={(v) => [String(v), 'Запитів']} labelFormatter={l => toolLabels[String(l)] || String(l)} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} fill="#6c5ce7" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* API Health */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Здоров&apos;я API</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold ${stats.apiHealth.errorRate < 5 ? 'text-green-400' : stats.apiHealth.errorRate < 20 ? 'text-yellow-400' : 'text-red-400'}`}>
              {100 - stats.apiHealth.errorRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Uptime</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${stats.apiHealth.avgLatency < 5000 ? 'text-green-400' : stats.apiHealth.avgLatency < 15000 ? 'text-yellow-400' : 'text-red-400'}`}>
              {(stats.apiHealth.avgLatency / 1000).toFixed(1)}с
            </div>
            <div className="text-xs text-gray-500 mt-1">Середня латентність</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-300">{stats.apiHealth.last100Count}</div>
            <div className="text-xs text-gray-500 mt-1">Остання вибірка</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
