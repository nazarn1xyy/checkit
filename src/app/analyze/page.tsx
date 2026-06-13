'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Target, ShieldAlert, TrendingUp, Users, DollarSign, Lightbulb, CheckCircle2,
  Download, Share2, Plus, MessageSquare, Send, Lock
} from 'lucide-react';
import { useTokens, TOKENS_PER_ANALYSIS_COST } from '@/contexts/TokenContext';
import { useAuth } from '@/contexts/AuthContext';
import { saveProject, getProjectById, updateProjectChat } from '@/lib/history';
import Image from 'next/image';
import { Questionnaire, Question } from '@/components/ui/Questionnaire';
import { Toast, useToast } from '@/components/ui/Toast';
import LZString from 'lz-string';

function ScoreBar({ label, value, colorClass }: { label: string, value: number, colorClass: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-200 font-medium">{value}/100</span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full ${colorClass}`} 
        />
      </div>
    </div>
  );
}

import { Report } from '@/types/report';

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const [idea, setIdea] = useState(searchParams.get('idea') || '');
  const toolId = searchParams.get('tool') || null;
  const historyId = searchParams.get('id') || null;
  
  const router = useRouter();
  const { user } = useAuth();
  const [phase, setPhase] = useState<'loading_questions' | 'questions' | 'analyzing' | 'done'>('loading_questions');
  const [report, setReport] = useState<Report | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { subscription, setPricingOpen, useTokens: spendTokens } = useTokens();
  const { toast, showToast, hideToast } = useToast();
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const canUseChat = subscription.plan === '6month' || subscription.plan === 'year';
  const [chatMessages, setChatMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
    { role: 'ai', text: 'Привіт! Я проаналізував вашу ідею. Що б ви хотіли обговорити детальніше? Наприклад, конкурентів чи монетизацію?' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleChatSend = async () => {
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userMsg }];
    setChatMessages(updatedMessages);
    setIsTyping(true);
    
    if (historyId) {
      updateProjectChat(historyId, updatedMessages, user?.email);
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          idea,
          report,
        }),
      });
      const data = await res.json();
      if (data.message) {
        const newMessages = [...updatedMessages, { role: 'ai' as const, text: data.message }];
        setChatMessages(newMessages);
        if (historyId) {
          updateProjectChat(historyId, newMessages, user?.email);
        }
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', text: 'Вибачте, сталася помилка. Спробуйте ще раз.' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Не вдалося з\'єднатися з AI. Перевірте інтернет-з\'єднання.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (historyId) {
      const proj = getProjectById(historyId);
      if (proj) {
        setIdea(proj.idea);
        setReport(proj.report);
        if (proj.chatMessages && proj.chatMessages.length > 0) {
          setChatMessages(proj.chatMessages);
        }
        setPhase('done');
        return;
      }
    }

    if (!idea) {
      router.push('/');
      return;
    }
    
    // Step 1: Fetch Clarifying Questions
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setPhase('questions');
        } else {
          // fallback to direct analysis if questions fail
          startAnalysis([]);
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
        // fallback to direct analysis
        startAnalysis([]);
      }
    };

    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idea, historyId, router]);

  const startAnalysis = async (answers: { question: string, answer: string }[]) => {
    setPhase('analyzing');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, tool: toolId, answers }),
      });
      const data = await res.json();
      if (data.report) {
        spendTokens(TOKENS_PER_ANALYSIS_COST);
        setReport(data.report);
        setPhase('done');
        
        // Save to history and sync with Supabase
        const newId = saveProject(idea, data.report, user?.email);
        
        // Update URL to include the new history ID without reloading the page
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', newId);
        window.history.replaceState({}, '', newUrl);
        setPhase('done');
      } else {
        setAnalyzeError('AI не зміг проаналізувати ідею. Спробуйте ще раз.');
      }
    } catch {
      setAnalyzeError('Помилка з\'єднання з сервером. Перевірте інтернет.');
    }
  };

  const handleExportPDF = () => {
    if (!report) return;
    import('@/lib/generatePDF').then(({ generatePDFReport }) => {
      generatePDFReport(idea, report);
    });
  };

  const handleShare = () => {
    if (!report) return;
    const dataObj = { idea, report };
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(dataObj));
    const url = new URL('/share', window.location.origin);
    url.searchParams.set('data', compressed);
    const text = url.toString();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast('Посилання скопійовано!')).catch(() => {
        fallbackCopy(text);
        showToast('Посилання скопійовано!');
      });
    } else {
      fallbackCopy(text);
      showToast('Посилання скопійовано!');
    }
  };

  const fallbackCopy = (text: string) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };

  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (phase !== 'analyzing') return;
    const timers = [
      setTimeout(() => setLoadingStep(1), 1000),
      setTimeout(() => setLoadingStep(2), 3500),
      setTimeout(() => setLoadingStep(3), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  if (analyzeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 text-lg font-medium mb-4">{analyzeError}</div>
        <Button onClick={() => router.push('/')} className="bg-brand text-white hover:bg-brand/90 rounded-full px-6">
          Спробувати ще раз
        </Button>
      </div>
    );
  }

  if (phase === 'loading_questions') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-gray-800 border-t-brand mb-6" />
          <h2 className="text-xl font-semibold text-white mb-2">AI аналізує вашу ідею...</h2>
          <p className="text-gray-400 text-sm">Готуємо уточнюючі запитання для кращого результату</p>
        </motion.div>
      </div>
    );
  }

  if (phase === 'questions') {
    return (
      <div className="py-8 md:py-12">
        <Questionnaire questions={questions} onComplete={startAnalysis} />
      </div>
    );
  }

  if (phase === 'analyzing') {
    const steps = [
      { label: 'Збір даних', sub: 'Аналізуємо вхідні параметри та ваші відповіді' },
      { label: 'Аналіз ринку', sub: 'Оцінюємо конкурентів та попит' },
      { label: 'Генерація звіту', sub: 'Формуємо рекомендації' },
    ];

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <h2 className="text-2xl font-semibold text-white text-center mb-2">Створюємо звіт</h2>
          <p className="text-gray-400 text-center text-sm mb-10">Це займе кілька секунд</p>
          
          {/* Progress bar */}
          <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden mb-10">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min((loadingStep / 3) * 100, 90)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-brand rounded-full animate-pulse"
            />
          </div>

          {/* Steps */}
          <div className="space-y-5">
            {steps.map((step, i) => {
              const isActive = loadingStep === i + 1;
              const isDone = loadingStep > i + 1;
              const isPending = loadingStep < i + 1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex items-center space-x-4 transition-all duration-500 ${isPending ? 'opacity-30' : 'opacity-100'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    isDone ? 'bg-brand/20 text-brand' : isActive ? 'bg-brand/10 border-2 border-brand text-brand' : 'bg-gray-800 text-gray-600'
                  }`}>
                    {isDone ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-xs font-bold">{i + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-500 ${isDone || isActive ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs text-gray-400 mt-0.5"
                      >
                        {step.sub}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="w-full max-w-7xl mx-auto pb-32 relative">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/')} className="pl-0 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Повернутися
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        
        {/* Main Dashboard Content */}
        <div className="flex-1 min-w-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Score Card */}
            <Card className="md:col-span-1 bg-surface border-brand/30 relative overflow-hidden flex flex-col items-center py-8 shadow-lg">
              <div className="absolute inset-0 bg-brand/5 blur-3xl rounded-full" />
              <div className="relative z-10 text-center w-full px-6">
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest">Загальна оцінка</h3>
                <div className={`text-6xl font-bold ${report.color} mb-3`}>{report.score}</div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/50 border border-gray-700 text-xs font-medium mb-8">
                  {report.level}
                </div>
                
                <div className="w-full space-y-4 text-left">
                  <ScoreBar label="Інноваційність" value={report.scores.innovation} colorClass="bg-blue-500" />
                  <ScoreBar label="Попит на ринку" value={report.scores.marketDemand} colorClass="bg-green-500" />
                  <ScoreBar label="Реалістичність" value={report.scores.feasibility} colorClass="bg-yellow-500" />
                  <ScoreBar label="Монетизація" value={report.scores.monetization} colorClass="bg-brand" />
                </div>
              </div>
            </Card>

            {/* Input Summary */}
            <Card className="md:col-span-2 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg text-gray-200">
                  <Lightbulb className="w-5 h-5 mr-2 text-brand" /> Ваша ідея
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center">
                <blockquote className="border-l-2 border-brand pl-4 text-gray-300 italic text-lg leading-relaxed">
                  &quot;{idea}&quot;
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            <Card className="hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400 text-base">
                  <TrendingUp className="w-5 h-5 mr-2" /> Потенціал ринку
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-300 text-sm leading-relaxed">{report.market}</p></CardContent>
            </Card>

            <Card className="hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-400 text-base">
                  <Users className="w-5 h-5 mr-2" /> Цільова аудиторія
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-300 text-sm leading-relaxed">{report.audience}</p></CardContent>
            </Card>

            <Card className="hover:border-orange-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-400 text-base">
                  <Target className="w-5 h-5 mr-2" /> Конкурентне середовище
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-300 text-sm leading-relaxed">{report.competitors}</p></CardContent>
            </Card>

            <Card className="hover:border-red-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-red-400 text-base">
                  <ShieldAlert className="w-5 h-5 mr-2" /> Основні ризики
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-300 text-sm leading-relaxed">{report.risks}</p></CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="hover:border-green-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-green-400 text-base">
                  <DollarSign className="w-5 h-5 mr-2" /> Бізнес-модель
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-gray-300 text-sm leading-relaxed">{report.businessModel}</p></CardContent>
            </Card>

            <Card className="border-brand/50 bg-brand/5">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <CheckCircle2 className="w-5 h-5 mr-2 text-brand" /> Рекомендації
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-bold mr-3 mt-0.5 shadow-[0_0_10px_rgba(0,153,255,0.2)]">
                        {i + 1}
                      </span>
                      <span className="text-gray-200 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar Placeholder for layout spacing */}
        <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 384, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:block flex-shrink-0"
          />
        )}
        </AnimatePresence>

      </div>

      {/* Fixed Sidebar UI Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 flex justify-center">
        <div className="w-full max-w-7xl px-4 flex justify-end items-start pt-24 pb-6">
          <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.1 }}
              className="hidden lg:block w-96 h-[calc(100vh-120px)] pointer-events-auto shadow-2xl"
            >
               <Card className="h-full flex flex-col border-gray-800 bg-surface/90 backdrop-blur-xl">
                 <CardHeader className="border-b border-gray-800 pb-4 flex flex-row items-center justify-between space-y-0">
                     <CardTitle className="text-base flex items-center text-white">
                         <MessageSquare className="w-4 h-4 mr-2 text-brand" />
                         AI Асистент
                     </CardTitle>
                     <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                     </button>
                 </CardHeader>
                  {canUseChat ? (
                    <>
                      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                              {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center mr-3 flex-shrink-0">
                                  <Image src="/logo.png" alt="AI" width={20} height={20} className="rounded-sm aspect-square object-cover" />
                                </div>
                              )}
                              <div className={msg.role === 'ai'
                                ? 'bg-gray-800/80 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-200 shadow-sm border border-gray-700/50 max-w-[85%]'
                                : 'bg-brand/20 rounded-2xl rounded-tr-sm p-3 text-sm text-gray-100 shadow-sm border border-brand/30 max-w-[85%]'
                              }>
                                {msg.role === 'ai' ? (
                                  <div className="space-y-2 leading-relaxed [&>p]:mb-2 last:[&>p]:mb-0">
                                    {msg.text.split('\n\n').map((paragraph, pi) => (
                                      <p key={pi}>
                                        {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, ppi) => 
                                          part.startsWith('**') && part.endsWith('**')
                                            ? <strong key={ppi} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                                            : <span key={ppi}>{part}</span>
                                        )}
                                      </p>
                                    ))}
                                  </div>
                                ) : msg.text}
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center mr-3 flex-shrink-0">
                                <Image src="/logo.png" alt="AI" width={20} height={20} className="rounded-sm aspect-square object-cover" />
                              </div>
                              <div className="bg-gray-800/80 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-400 shadow-sm border border-gray-700/50">
                                <div className="flex items-center space-x-1.5">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={chatEndRef} />
                      </CardContent>
                      <div className="p-4 border-t border-gray-800 bg-black/20 rounded-b-xl">
                          <form onSubmit={(e) => { e.preventDefault(); handleChatSend(); }} className="relative">
                              <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                disabled={isTyping}
                                placeholder={isTyping ? "AI думає..." : "Задайте питання..."} 
                                className="w-full bg-surface border border-gray-700 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-white placeholder:text-gray-500 disabled:opacity-50" 
                              />
                              <button type="submit" disabled={isTyping || !chatInput.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-brand hover:bg-brand/10 rounded-full transition-colors disabled:opacity-30">
                                  <Send className="w-4 h-4" />
                              </button>
                          </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Чат недоступний</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        AI чат-асистент доступний тільки в тарифах <strong>Професійний</strong> та <strong>Бізнес</strong>.
                      </p>
                      <button 
                        onClick={() => setPricingOpen(true)}
                        className="bg-brand hover:bg-brand/90 text-white font-semibold py-2.5 px-6 rounded-full transition-all shadow-lg shadow-brand/20"
                      >
                        Оновити тариф
                      </button>
                    </div>
                  )}
             </Card>
           </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Chat Sheet */}
      <AnimatePresence>
        {isMobileChatOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-0 z-[60] bg-background flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <MessageSquare className="w-4 h-4 text-brand" />
                <span>AI Асистент</span>
              </div>
              <button onClick={() => setIsMobileChatOpen(false)} className="text-gray-400 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            {canUseChat ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex items-start ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <Image src="/logo.png" alt="AI" width={20} height={20} className="rounded-sm aspect-square object-cover" />
                        </div>
                      )}
                      <div className={msg.role === 'ai'
                        ? 'bg-gray-800/80 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-200 shadow-sm border border-gray-700/50 max-w-[85%]'
                        : 'bg-brand/20 rounded-2xl rounded-tr-sm p-3 text-sm text-gray-100 shadow-sm border border-brand/30 max-w-[85%]'
                      }>
                        {msg.role === 'ai' ? (
                          <div className="space-y-2 leading-relaxed">
                            {msg.text.split('\n\n').map((paragraph, pi) => (
                              <p key={pi}>
                                {paragraph.split(/(\*\*[^*]+\*\*)/).map((part, ppi) =>
                                  part.startsWith('**') && part.endsWith('**')
                                    ? <strong key={ppi} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                                    : <span key={ppi}>{part}</span>
                                )}
                              </p>
                            ))}
                          </div>
                        ) : msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start">
                      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center mr-3 flex-shrink-0">
                        <Image src="/logo.png" alt="AI" width={20} height={20} className="rounded-sm aspect-square object-cover" />
                      </div>
                      <div className="bg-gray-800/80 rounded-2xl rounded-tl-sm p-3 text-sm text-gray-400 shadow-sm border border-gray-700/50">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-gray-800 bg-black/20">
                  <form onSubmit={(e) => { e.preventDefault(); handleChatSend(); }} className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isTyping}
                      placeholder={isTyping ? "AI думає..." : "Задайте питання..."}
                      className="w-full bg-surface border border-gray-700 rounded-full py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-white placeholder:text-gray-500 disabled:opacity-50"
                    />
                    <button type="submit" disabled={isTyping || !chatInput.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-brand hover:bg-brand/10 rounded-full transition-colors disabled:opacity-30">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Чат недоступний</h3>
                <p className="text-sm text-gray-400 mb-6">
                  AI чат-асистент доступний тільки в тарифах <strong>Професійний</strong> та <strong>Бізнес</strong>.
                </p>
                <button
                  onClick={() => { setIsMobileChatOpen(false); setPricingOpen(true); }}
                  className="bg-brand hover:bg-brand/90 text-white font-semibold py-2.5 px-6 rounded-full transition-all shadow-lg shadow-brand/20"
                >
                  Оновити тариф
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={hideToast} />}
      </AnimatePresence>

      {/* Floating Action Bar */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-1 bg-surface/80 backdrop-blur-xl border border-gray-700/50 p-1.5 rounded-full shadow-2xl"
      >
          {!isChatOpen && (
            <>
              <Button variant="ghost" onClick={() => { const isMobile = window.innerWidth < 1024; isMobile ? setIsMobileChatOpen(true) : setIsChatOpen(true); }} className="rounded-full text-brand hover:text-brand hover:bg-white/5 h-10 px-4 font-medium">
                  <MessageSquare className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Відкрити чат</span>
              </Button>
              <div className="w-px h-6 bg-gray-700 mx-1" />
            </>
          )}
          <Button 
            variant="ghost" 
            onClick={handleExportPDF} 
            className="rounded-full text-gray-300 hover:text-white hover:bg-white/5 h-10 px-4"
          >
              <Download className="w-4 h-4 mr-2" /> 
              <span className="hidden sm:inline">PDF Звіт</span>
          </Button>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <Button variant="ghost" onClick={handleShare} className="rounded-full text-gray-300 hover:text-white hover:bg-white/5 h-10 px-4">
              <Share2 className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Поділитися</span>
          </Button>
          <div className="w-px h-6 bg-gray-700 mx-1" />
          <Button onClick={() => router.push('/')} className="rounded-full bg-brand text-white hover:bg-brand/90 h-10 px-5 shadow-lg shadow-brand/20">
              <Plus className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Нова ідея</span>
          </Button>
      </motion.div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 relative min-h-screen">
      <Suspense fallback={<div className="text-center mt-20 text-gray-400">Завантаження...</div>}>
        <AnalyzeContent />
      </Suspense>
    </div>
  );
}
