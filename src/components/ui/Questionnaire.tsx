'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ArrowLeft } from 'lucide-react';

export interface Question {
  question: string;
  options: string[];
  allowCustom: boolean;
}

interface QuestionnaireProps {
  questions: Question[];
  onComplete: (answers: { question: string; answer: string }[]) => void;
}

export function Questionnaire({ questions, onComplete }: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [customAnswer, setCustomAnswer] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Direction state for animation (1 for forward, -1 for backward)
  const [direction, setDirection] = useState(1);

  const currentQuestion = questions[currentIndex];

  const navigateTo = (newIndex: number) => {
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentIndex(newIndex);
    setIsCustomMode(false);
  };

  const handleSelectOptionWrapper = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { question: currentQuestion.question, answer: option };
    
    // Remove any subsequent answers if they change a previous one, 
    // to force them to re-answer or just keep them? Let's just keep them for convenience.
    setAnswers(newAnswers);
    
    if (currentIndex < questions.length - 1) {
      navigateTo(currentIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const handleCustomSubmitWrapper = () => {
    if (!customAnswer.trim()) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { question: currentQuestion.question, answer: customAnswer.trim() };
    
    setAnswers(newAnswers);
    setCustomAnswer('');
    setIsCustomMode(false);
    
    if (currentIndex < questions.length - 1) {
      navigateTo(currentIndex + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  // iOS Spring configuration
  const iosSpring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 1,
  };

  const variants = {
    enter: (dir: number) => ({ x: dir * 50, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir * -50, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-full mb-6 flex items-center justify-between px-4">
        <span className="text-sm font-medium text-gray-400">
          Уточнення ідеї {currentIndex + 1} / {questions.length}
        </span>
        <div className="flex space-x-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => i <= answers.length && navigateTo(i)}
              disabled={i > answers.length}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-brand' : i < currentIndex ? 'w-2 bg-brand/50' : 'w-2 bg-gray-700'
              } ${i <= answers.length && i !== currentIndex ? 'cursor-pointer hover:bg-brand/80' : 'cursor-default'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative w-full overflow-hidden px-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={iosSpring}
            className="w-full bg-surface border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-start mb-6">
              {currentIndex > 0 && (
                <button 
                  onClick={() => navigateTo(currentIndex - 1)}
                  className="mt-1 mr-3 p-1.5 shrink-0 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="flex flex-col space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOptionWrapper(option)}
                  className="w-full text-left p-4 rounded-2xl border border-gray-700 hover:border-brand/50 bg-gray-900/50 hover:bg-brand/10 transition-all flex items-center justify-between group active:scale-[0.98]"
                >
                  <span className="text-gray-200 group-hover:text-white font-medium">{option}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
                </button>
              ))}

              {currentQuestion.allowCustom && !isCustomMode && (
                <button
                  onClick={() => setIsCustomMode(true)}
                  className="w-full text-left p-4 rounded-2xl border border-dashed border-gray-700 hover:border-gray-500 text-gray-400 transition-all flex items-center justify-between"
                >
                  <span>Свій варіант...</span>
                </button>
              )}

              {currentQuestion.allowCustom && isCustomMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex flex-col space-y-3 mt-2"
                >
                  <textarea
                    value={customAnswer}
                    onChange={(e) => setCustomAnswer(e.target.value)}
                    placeholder="Напишіть свою відповідь тут..."
                    className="w-full bg-gray-900/50 border border-brand/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none h-24"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsCustomMode(false)}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Скасувати
                    </button>
                    <button
                      onClick={handleCustomSubmitWrapper}
                      disabled={!customAnswer.trim()}
                      className="px-5 py-2 rounded-xl bg-brand text-white font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>Продовжити</span>
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
