'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Activity, TrendingUp, Coins, CheckCircle2, XCircle,
  Clock, Percent
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

type Stats = {
  totalUsers: number;
  active7d: number;
  active30d: number;
  totalAnalyses: number;
  successAnalyses: number;
  failedAnalyses: number;
  successRate: number;
  avgDuration: number;
  paidUsers: number;
  conversionRate: number;
  totalTokensSpent: number;
  requestsChart: { date: string; requests: number; users: number }[];
  toolChart: { name: string; value: number }[];
  planChart: { name: string; value: number }[];
  growthChart: { date: string; total: number }[];
  apiHealth: { errorRate: number; avgLatency: number; last100Count: number };
};

const COLORS = ['#6c5ce7', '#00cec9', '#fdcb6e', '#e17055', '#74b9ff', '#a29bfe'];

const toolLabels: Record<string, string> = {
  none: 'Без фокусу',
  market: 'Ринок',
  competitors: 'Конкуренти',
  swot: 'SWOT',
  financials: 'Фінанси',
  audience: 'Аудиторія',
};

const planLabels: Record<string, string> = {
  free: 'Безкоштовний',
  '3month': '3 місяці',
  '6month': '6 місяців',
  year: 'Рік',
};

function StatCard({ icon: Icon, label, value, sub, color = 'text-brand' }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-gray-800 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-opacity-10 ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 text-sm">Завантаження...</div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-red-400 text-center mt-20">Не вдалося завантажити дані</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Дашборд</h1>
        <p className="text-sm text-gray-500 mt-1">Огляд ключових метрик платформи</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Усього користувачів" value={stats.totalUsers} sub={`${stats.active7d} активних за 7 днів`} />
        <StatCard icon={Activity} label="Усього аналізів" value={stats.totalAnalyses} sub={`${stats.successAnalyses} успішних`} color="text-green-400" />
        <StatCard icon={Percent} label="Успішність" value={`${stats.successRate}%`} sub={`${stats.failedAnalyses} помилок`} color="text-yellow-400" />
        <StatCard icon={Clock} label="Сер. час аналізу" value={`${(stats.avgDuration / 1000).toFixed(1)}с`} color="text-cyan-400" />
        <StatCard icon={Coins} label="Витрачено токенів" value={stats.totalTokensSpent.toLocaleString()} color="text-purple-400" />
        <StatCard icon={TrendingUp} label="Конверсія в платні" value={`${stats.conversionRate}%`} sub={`${stats.paidUsers} платних`} color="text-orange-400" />
        <StatCard icon={CheckCircle2} label="API Health" value={`${100 - stats.apiHealth.errorRate}%`} sub={`Латентність: ${stats.apiHealth.avgLatency}мс`} color="text-green-400" />
        <StatCard icon={XCircle} label="Помилки API" value={`${stats.apiHealth.errorRate}%`} sub={`з останніх ${stats.apiHealth.last100Count}`} color="text-red-400" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests over time */}
        <div className="bg-surface border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Запити за 30 днів</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.requestsChart}>
              <defs>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="requests" stroke="#6c5ce7" fill="url(#reqGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="users" stroke="#00cec9" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User growth */}
        <div className="bg-surface border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Ріст користувачів</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.growthChart}>
              <defs>
                <linearGradient id="growGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00cec9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00cec9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#00cec9" fill="url(#growGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool distribution */}
        <div className="bg-surface border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Інструменти аналізу</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.toolChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} tickFormatter={v => toolLabels[v] || v} />
              <YAxis tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} formatter={(v) => [String(v), 'Запитів']} labelFormatter={l => toolLabels[String(l)] || String(l)} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {stats.toolChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan distribution */}
        <div className="bg-surface border border-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Розподіл підписок</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.planChart}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${planLabels[name || ''] || name || ''} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {stats.planChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 12, fontSize: 12 }} formatter={(v) => [String(v), 'Користувачів']} />
              <Legend formatter={v => planLabels[v] || v} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
