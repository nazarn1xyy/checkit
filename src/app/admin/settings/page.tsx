'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw } from 'lucide-react';

type Settings = {
  freeTokens: number;
  tokensPerAnalysis: number;
  planTokens: Record<string, number>;
  maintenanceMode: boolean;
  chatEnabled: boolean;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { setSettings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // silent
    }
    setSaving(false);
  };

  if (loading || !settings) {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">Завантаження...</div>;
  }

  const updateField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const updatePlanTokens = (plan: string, value: number) => {
    setSettings(prev => prev ? { ...prev, planTokens: { ...prev.planTokens, [plan]: value } } : prev);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Налаштування</h1>
        <p className="text-sm text-gray-500 mt-1">Конфігурація платформи</p>
      </div>

      {/* Tokens */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-white">Токени</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Безкоштовні токени</label>
            <input
              type="number"
              value={settings.freeTokens}
              onChange={e => updateField('freeTokens', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand"
            />
            <p className="text-[10px] text-gray-600 mt-1">= {Math.floor(settings.freeTokens / settings.tokensPerAnalysis)} аналізів</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Ціна 1 аналізу (токени)</label>
            <input
              type="number"
              value={settings.tokensPerAnalysis}
              onChange={e => updateField('tokensPerAnalysis', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">Токени за план</label>
          <div className="grid grid-cols-3 gap-3">
            {(['3month', '6month', 'year'] as const).map(plan => (
              <div key={plan}>
                <label className="block text-[10px] text-gray-600 mb-1">
                  {plan === '3month' ? '3 місяці' : plan === '6month' ? '6 місяців' : 'Рік'}
                </label>
                <input
                  type="number"
                  value={settings.planTokens[plan] || 0}
                  onChange={e => updatePlanTokens(plan, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-brand"
                />
                <p className="text-[10px] text-gray-600 mt-0.5">= {Math.floor((settings.planTokens[plan] || 0) / settings.tokensPerAnalysis)} аналізів</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Feature flags */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surface border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Функції</h3>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">Режим техобслуговування</div>
            <div className="text-xs text-gray-500">Заблокувати доступ для користувачів</div>
          </div>
          <button
            onClick={() => updateField('maintenanceMode', !settings.maintenanceMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-white">AI Чат</div>
            <div className="text-xs text-gray-500">Увімкнути чат з AI після аналізу</div>
          </div>
          <button
            onClick={() => updateField('chatEnabled', !settings.chatEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.chatEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${settings.chatEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-400 text-sm"
          >
            Збережено!
          </motion.span>
        )}
      </div>
    </div>
  );
}
