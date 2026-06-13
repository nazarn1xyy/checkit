'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export function Toast({ message, onDone, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center space-x-3 bg-gray-900 border border-gray-700 text-white px-5 py-3 rounded-2xl shadow-2xl"
    >
      <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
      <span className="text-sm font-medium whitespace-nowrap">{message}</span>
      <button onClick={onDone} className="ml-1 text-gray-400 hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// Simple hook to manage toast state
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => setToast(msg);
  const hideToast = () => setToast(null);
  return { toast, showToast, hideToast };
}
