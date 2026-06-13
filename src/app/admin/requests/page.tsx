'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

type DbEvent = {
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

const typeLabels: Record<string, string> = {
  analyze: 'Аналіз',
  questions: 'Питання',
  chat: 'Чат',
};

const typeColors: Record<string, string> = {
  analyze: 'bg-brand/10 text-brand',
  questions: 'bg-cyan-900/30 text-cyan-400',
  chat: 'bg-yellow-900/30 text-yellow-400',
};

export default function AdminRequestsPage() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/admin/requests?limit=500')
      .then(r => r.json())
      .then(data => { setEvents(data.events || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = events
    .filter(e => typeFilter === 'all' || e.type === typeFilter)
    .filter(e =>
      e.idea.toLowerCase().includes(search.toLowerCase()) ||
      (e.userEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.error || '').toLowerCase().includes(search.toLowerCase())
    );

  const successCount = filtered.filter(e => e.success).length;
  const errorCount = filtered.filter(e => !e.success).length;
  const avgDuration = filtered.length > 0 ? Math.round(filtered.filter(e => e.success).reduce((s, e) => s + e.durationMs, 0) / Math.max(1, filtered.filter(e => e.success).length)) : 0;

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">Завантаження...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Аналітика запитів</h1>
        <p className="text-sm text-gray-500 mt-1">Останні {filtered.length} запитів</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <div className="text-lg font-bold text-white">{successCount}</div>
            <div className="text-xs text-gray-500">Успішних</div>
          </div>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-400" />
          <div>
            <div className="text-lg font-bold text-white">{errorCount}</div>
            <div className="text-xs text-gray-500">Помилок</div>
          </div>
        </div>
        <div className="bg-surface border border-gray-800 rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-lg font-bold text-white">{(avgDuration / 1000).toFixed(1)}с</div>
            <div className="text-xs text-gray-500">Середній час</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Пошук за ідеєю або помилкою..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface border border-gray-800 rounded-xl p-1">
          <Filter className="w-4 h-4 text-gray-500 ml-2" />
          {['all', 'analyze', 'questions', 'chat'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t ? 'bg-brand/10 text-brand' : 'text-gray-500 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Усі' : typeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                <th className="px-4 py-3 text-left font-medium">Тип</th>
                <th className="px-4 py-3 text-left font-medium">Статус</th>
                <th className="px-4 py-3 text-left font-medium">Ідея</th>
                <th className="px-4 py-3 text-left font-medium">Інструмент</th>
                <th className="px-4 py-3 text-left font-medium">Тривалість</th>
                <th className="px-4 py-3 text-left font-medium">Час</th>
                <th className="px-4 py-3 text-left font-medium">Помилка</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12">Немає запитів</td></tr>
              ) : (
                filtered.map((e, i) => (
                  <tr key={e.id} className={`border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[e.type]}`}>
                        {typeLabels[e.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.success ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-[200px] truncate" title={e.idea}>{e.idea || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{e.tool || '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{(e.durationMs / 1000).toFixed(1)}с</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{new Date(e.timestamp).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                    <td className="px-4 py-3 text-red-400/80 text-xs max-w-[150px] truncate" title={e.error || ''}>{e.error || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
