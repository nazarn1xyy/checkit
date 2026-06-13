'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  tokens: number;
  analysesCount: number;
  createdAt: number;
  lastActiveAt: number;
};

const planLabels: Record<string, string> = {
  free: 'Безкоштовний',
  '3month': '3 міс.',
  '6month': '6 міс.',
  year: 'Рік',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof User>('lastActiveAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data.users || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = (key: keyof User) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = users
    .filter(u => u.role !== 'admin')
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === 'number' ? (av as number) - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">Завантаження...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Користувачі</h1>
        <p className="text-sm text-gray-500 mt-1">Усього: {filtered.length}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук за ім'ям або email..."
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-gray-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-xs">
                {([
                  ['name', "Ім'я"],
                  ['email', 'Email'],
                  ['plan', 'План'],
                  ['tokens', 'Токени'],
                  ['analysesCount', 'Аналізів'],
                  ['createdAt', 'Зареєстрований'],
                  ['lastActiveAt', 'Остання активність'],
                ] as [keyof User, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-left font-medium cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort(key)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {sortKey === key && <ArrowUpDown className="w-3 h-3 text-brand" />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-600 py-12">Немає користувачів</td></tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id} className={`border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.plan === 'free' ? 'bg-gray-800 text-gray-400' :
                        u.plan === 'year' ? 'bg-brand/10 text-brand' :
                        'bg-cyan-900/30 text-cyan-400'
                      }`}>
                        {planLabels[u.plan] || u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.tokens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-300">{u.analysesCount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('uk-UA')}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(u.lastActiveAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
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
