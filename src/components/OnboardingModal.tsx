'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, Mic, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenOnboarding = localStorage.getItem('checkit_onboarding_completed');
    if (!hasSeenOnboarding) {
      // Small delay to make it feel more natural
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('checkit_onboarding_completed', 'true');
    setIsOpen(false);
  };

  const features = [
    {
      icon: Sparkles,
      title: "Миттєвий AI-аналіз",
      description: "Отримайте професійну оцінку бізнес-ідеї за лічені секунди. Дізнайтеся потенціал ринку та ключові ризики.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Mic,
      title: "Голосове введення",
      description: "Не хочете друкувати? Натисніть на мікрофон і просто наговоріть свою ідею — ми зробимо решту.",
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      icon: FileText,
      title: "Історія та PDF звіти",
      description: "Ваші геніальні ідеї надійно зберігаються у розділі 'Мої проєкти'. Завантажуйте результати у форматі PDF.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: Share2,
      title: "Діліться з партнерами",
      description: "Генеруйте публічне посилання на звіт в один клік, щоб зручно ділитися з інвесторами чи кофаундерами.",
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <>
      {isOpen && mounted && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={handleClose}
          />
          
          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-gray-800 rounded-3xl shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6 sm:p-8">
                <button 
                  onClick={handleClose}
                  className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <img src="/logo.png" alt="CheckIt Logo" className="w-10 h-10 rounded-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Ласкаво просимо до CheckIt!</h2>
                  <p className="text-gray-400">Платформа для швидкої валідації ваших стартап-ідей.</p>
                </div>

                <div className="space-y-6 mb-8">
                  {features.map((feature, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-[#111111] border border-gray-800/50 hover:bg-[#1a1a1a] transition-colors animate-in slide-in-from-left-4 fade-in duration-300 fill-mode-both"
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${feature.bg} ${feature.color}`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={handleClose}
                  className="w-full h-12 bg-brand hover:bg-brand/90 text-white rounded-xl text-base font-semibold shadow-lg shadow-brand/20 transition-all"
                >
                  Почати роботу
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
