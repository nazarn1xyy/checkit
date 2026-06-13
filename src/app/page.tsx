'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PromptBox } from '@/components/ui/chatgpt-prompt-input';
import { useAuth } from '@/contexts/AuthContext';
import { useTokens, TOKENS_PER_ANALYSIS_COST } from '@/contexts/TokenContext';
import { Sparkles, Lock, MessageSquare, Cpu, FileText, ChevronDown, ShoppingCart, Bot, GraduationCap, HeartPulse, Coins } from 'lucide-react';
import { ReviewMarquee, reviews } from '@/components/ui/ReviewMarquee';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, setAuthModalOpen } = useAuth();
  const { tokens, hasTokens, setPricingOpen } = useTokens();

  const remainingAnalyses = Math.floor(tokens / TOKENS_PER_ANALYSIS_COST);

  const handleMessageSubmit = (message: string, toolId?: string) => {
    if (!message.trim()) return;
    
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!hasTokens(TOKENS_PER_ANALYSIS_COST)) {
      setPricingOpen(true);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const url = new URL(`/analyze`, window.location.origin);
      url.searchParams.set('idea', message);
      if (toolId) {
        url.searchParams.set('tool', toolId);
      }
      router.push(url.pathname + url.search);
    }, 400);
  };

  return (
    <div className="relative w-full min-h-screen">
      <HeroGeometric />
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-10 max-w-5xl block text-center">
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex items-center space-x-2 bg-surface border border-gray-700 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-brand" />
          <span className="text-sm font-medium text-gray-300">AI оцінка за секунди</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Перевір життєздатність своєї <span className="text-brand font-playfair italic font-medium">бізнес-ідеї</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Штучний інтелект проаналізує ринок, конкурентів, ризики та бізнес-модель, 
          надавши детальний звіт і рекомендації щодо розвитку вашого стартапу.
        </p>

        <div className="hidden md:block w-full max-w-2xl mx-auto text-left relative">
          <div className="relative animate-in fade-in zoom-in-95 duration-500 delay-100 fill-mode-both">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 to-blue-600/20 rounded-xl blur-xl opacity-50"></div>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm rounded-[28px] flex flex-col items-center justify-center">
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent mb-2" />
                  <span className="text-white text-sm font-medium">Аналізуємо...</span>
                </div>
              )}
              <PromptBox onMessageSubmit={handleMessageSubmit} disabled={isLoading} />
            </div>
          </div>
          {/* Trust Badge + Token indicator */}
          <div className="mt-6 flex flex-col items-center space-y-2 animate-in fade-in duration-500 delay-300 fill-mode-both">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Ваші ідеї повністю конфіденційні. Ми не зберігаємо їх і не використовуємо для навчання.</span>
            </div>
            {user && (
              <button
                onClick={() => remainingAnalyses <= 0 ? setPricingOpen(true) : null}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
                  remainingAnalyses <= 0
                    ? 'border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10 cursor-pointer'
                    : remainingAnalyses <= 1
                      ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400 cursor-default'
                      : 'border-gray-700 bg-surface/50 text-gray-400 cursor-default'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {remainingAnalyses <= 0
                    ? 'Токени вичерпано — отримати ще'
                    : `Залишилось аналізів: ${remainingAnalyses}`
                  }
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile: fixed bottom prompt box */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm rounded-[28px] flex flex-col items-center justify-center">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent mb-2" />
                <span className="text-white text-sm font-medium">Аналізуємо...</span>
              </div>
            )}
            <PromptBox onMessageSubmit={handleMessageSubmit} disabled={isLoading} />
          </div>
          <div className="mt-2 flex items-center justify-center space-x-3 text-xs text-gray-600">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3 h-3" />
              <span>Конфіденційно</span>
            </div>
            {user && (
              <>
                <div className="w-px h-3 bg-gray-700" />
                <button
                  onClick={() => remainingAnalyses <= 0 ? setPricingOpen(true) : null}
                  className="flex items-center space-x-1.5"
                >
                  <Coins className="w-3 h-3" />
                  <span className={remainingAnalyses <= 0 ? 'text-red-400' : ''}>
                    {remainingAnalyses <= 0 ? 'Токени вичерпано' : `Аналізів: ${remainingAnalyses}`}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Quick prompt suggestions to fill empty space */}
      <div className="md:hidden mt-8 mb-32 px-2">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Спробуйте приклад</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: ShoppingCart, color: "text-emerald-400 bg-emerald-400/10", title: "E-commerce", desc: "Маркетплейс для локальних фермерів" },
            { icon: Bot, color: "text-blue-400 bg-blue-400/10", title: "AI-сервіс", desc: "Автоматичне резюме для відео" },
            { icon: GraduationCap, color: "text-purple-400 bg-purple-400/10", title: "EdTech", desc: "Платформа для менторства" },
            { icon: HeartPulse, color: "text-rose-400 bg-rose-400/10", title: "HealthTech", desc: "Трекер здорових звичок з ШІ" },
          ].map((suggestion, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              onClick={() => handleMessageSubmit(suggestion.desc)}
              className="flex flex-col items-start p-4 rounded-[28px] border border-gray-800 bg-surface/50 text-left active:scale-95 transition-transform"
            >
              <div className={`w-10 h-10 rounded-xl ${suggestion.color} flex items-center justify-center mb-3`}>
                <suggestion.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-white">{suggestion.title}</span>
              <span className="text-xs text-gray-400 mt-1">{suggestion.desc}</span>
            </motion.button>
          ))}
        </div>
      </div>


      <div className="hidden md:block">
        <div className="w-full h-24 md:h-32"></div>
        
        <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-700 delay-300 fill-mode-both">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Як це працює</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { 
                step: 1, 
                title: "Введіть ідею", 
                desc: "Опишіть вашу концепцію своїми словами",
                icon: MessageSquare 
              },
              { 
                step: 2, 
                title: "AI Аналіз", 
                desc: "Нейромережа аналізує ринок, конкурентів та ризики, оцінюючи потенційний успіх",
                icon: Cpu 
              },
              { 
                step: 3, 
                title: "Отримайте звіт", 
                desc: "Отримайте оцінку життєздатності та покроковий план дій",
                icon: FileText 
              }
            ].map((feature, idx) => (
              <div key={idx} className="relative p-8 rounded-[28px] border border-gray-800 bg-surface flex flex-col items-center text-center shadow-lg">
                <div className="w-14 h-14 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-base text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-16 md:h-32 shrink-0"></div>

        <div className="mb-32 w-full overflow-hidden animate-in fade-in duration-700 delay-300 fill-mode-both">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Відгуки користувачів</h2>
            <p className="text-gray-400">Дізнайтесь, як CheckIt допомагає іншим</p>
          </div>
          
          {/* Desktop Marquee */}
          <div className="hidden md:block w-full mb-8">
            <ReviewMarquee />
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden w-full relative">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {reviews.map((r, i) => (
                <div key={i} className="w-[85vw] max-w-[320px] bg-[#111111] border border-gray-800 rounded-2xl p-6 text-left shrink-0 whitespace-normal shadow-lg snap-center">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">&quot;{r.text}&quot;</p>
                  <div className="flex items-center space-x-3 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/50 to-blue-600/50 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {r.author.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.author}</p>
                      <p className="text-xs text-gray-500">{r.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div 
          id="faq"
          className="mb-32 w-full max-w-3xl text-left mx-auto scroll-mt-24 animate-in fade-in duration-700 delay-500 fill-mode-both"
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Поширені запитання</h2>
          <div className="space-y-6">
             {[
              { q: "Яку проблему вирішує CheckIt?", a: "Щороку тисячі стартапів закриваються через недостатній аналіз ринку, конкурентів та бізнес-моделі ще на етапі ідеї. CheckIt допомагає підприємцям-початківцям швидко валідувати ідею за допомогою AI, щоб уникнути типових помилок на старті." },
              { q: "Що саме аналізує AI?", a: "Система приймає опис вашої бізнес-ідеї і проводить комплексний аналіз: оцінює потенційний ринок, визначає цільову аудиторію, аналізує конкурентне середовище, виявляє основні ризики та формує рекомендації щодо подальшого розвитку." },
              { q: "Чи можу я зберегти та поділитися результатами?", a: "Так! Усі ваші аналізи зберігаються у розділі «Мої проєкти». Ви можете завантажити звіт у PDF для презентації інвесторам або згенерувати публічне посилання для кофаундерів та партнерів." },
              { q: "Наскільки можна довіряти результатам AI?", a: "AI надає якісну первинну оцінку на основі актуальних ринкових даних і трендів. Це чудовий інструмент для швидкої валідації, але для прийняття фінальних бізнес-рішень ми рекомендуємо додатково проконсультуватись з експертами галузі." },
              { q: "Скільки аналізів я можу зробити безкоштовно?", a: "Безкоштовний план включає 3 повних аналізи. Цього достатньо, щоб протестувати декілька варіантів вашої ідеї. Для активного використання доступні преміум-плани з розширеним лімітом." }
            ].map((faq, i) => (
              <details key={i} className="group border border-gray-800 bg-surface rounded-[28px] p-6 [&_summary::-webkit-details-marker]:hidden shadow-sm hover:border-gray-700 transition-colors">
                <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-white text-lg">
                  <span>{faq.q}</span>
                  <span className="transition group-open:rotate-180 bg-gray-800 p-2 rounded-full">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </span>
                </summary>
                <p className="text-gray-400 mt-4 leading-relaxed text-base">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
