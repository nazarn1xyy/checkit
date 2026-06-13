'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Target, TrendingUp, Users, Lightbulb, CheckCircle2
} from 'lucide-react';
import { Report } from '@/types/report';

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

function ShareContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  const router = useRouter();

  const [idea, setIdea] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dataParam) {
      setError('Посилання недійсне або пошкоджене.');
      return;
    }

    const loadData = async () => {
      try {
        const LZString = (await import('lz-string')).default;
        const decompressed = LZString.decompressFromEncodedURIComponent(dataParam);
        if (!decompressed) throw new Error('Failed to decompress');
        const parsed = JSON.parse(decompressed);
        
        if (parsed.idea && parsed.report) {
          setIdea(parsed.idea);
          setReport(parsed.report);
        } else {
          setError('Невірний формат даних.');
        }
      } catch (err) {
        console.error(err);
        setError('Помилка при читанні даних. Можливо, посилання пошкоджене.');
      }
    };
    
    loadData();
  }, [dataParam]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-400 text-lg font-medium mb-4">{error}</div>
        <Button onClick={() => router.push('/')} className="bg-brand text-white hover:bg-brand/90 rounded-full px-6">
          На головну
        </Button>
      </div>
    );
  }

  if (!report) {
    return <div className="text-center mt-20 text-gray-400">Завантаження звіту...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 relative">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/')} className="pl-0 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Створити свій аналіз
        </Button>
        <div className="text-sm text-gray-500">Створено за допомогою CheckIt AI</div>
      </div>
      
      <div className="flex flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
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
                <Lightbulb className="w-5 h-5 mr-2 text-brand" /> Аналізована ідея
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
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
    </div>
  );
}

export default function SharePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 relative min-h-screen">
      <Suspense fallback={<div className="text-center mt-20 text-gray-400">Завантаження...</div>}>
        <ShareContent />
      </Suspense>
    </div>
  );
}
