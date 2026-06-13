'use client';

import { useState, useEffect } from 'react';
import { useTokens } from '@/contexts/TokenContext';
import { X, Check, Zap, Crown, Rocket, CreditCard, Lock, ArrowLeft, Sparkles } from 'lucide-react';

const plans = [
  {
    id: '3month' as const,
    name: 'Стартовий',
    icon: Zap,
    duration: '3 місяці',
    price: 299,
    priceTotal: 897,
    tokens: 10000,
    analyses: '~30',
    popular: false,
    features: [
      'До 30 аналізів бізнес-ідей',
      'Експорт звітів у PDF',
      'Базова аналітика ринку',
      'Email підтримка',
    ],
  },
  {
    id: '6month' as const,
    name: 'Професійний',
    icon: Crown,
    duration: '6 місяців',
    price: 199,
    priceTotal: 1194,
    tokens: 25000,
    analyses: '~75',
    popular: true,
    savings: '33%',
    features: [
      'До 75 аналізів бізнес-ідей',
      'AI чат-асистент без обмежень',
      'Експорт звітів у PDF',
      'Розширена аналітика ринку',
      'Порівняння з конкурентами',
      'Пріоритетна підтримка 24/7',
      'Ранній доступ до нових функцій',
    ],
  },
  {
    id: 'year' as const,
    name: 'Бізнес',
    icon: Rocket,
    duration: '12 місяців',
    price: 149,
    priceTotal: 1788,
    tokens: 60000,
    analyses: '~180',
    popular: false,
    savings: '50%',
    features: [
      'До 180 аналізів бізнес-ідей',
      'AI чат-асистент без обмежень',
      'Експорт звітів у PDF',
      'Повна аналітика ринку та трендів',
      'Детальне порівняння з конкурентами',
      'Фінансове моделювання',
      'Пріоритетна підтримка 24/7',
      'Ранній доступ до нових функцій',
      'API доступ для інтеграцій',
    ],
  },
];

function PaymentForm({ plan, onBack, onSuccess }: {
  plan: typeof plans[0];
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');

  const formatCard = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    setStep('success');
    await new Promise(resolve => setTimeout(resolve, 1500));
    onSuccess();
  };

  const isFormValid = cardNumber.replace(/\s/g, '').length === 16
    && expiry.length === 5
    && cvv.length >= 3
    && cardHolder.length > 2;

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-gray-700 border-t-brand animate-spin" />
          <CreditCard className="w-6 h-6 text-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Обробка платежу...</h3>
        <p className="text-sm text-gray-400">Зачекайте, це займе кілька секунд</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Оплата успішна!</h3>
        <p className="text-sm text-gray-400">Підписку активовано</p>
      </div>
    );
  }

  return (
    <div
      className="animate-in slide-in-from-right-4 duration-300"
    >
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Повернутися до тарифів
      </button>

      <div className="bg-surface/50 border border-gray-700/50 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Обраний тариф</p>
            <p className="text-white font-semibold">{plan.name} — {plan.duration}</p>
          </div>
          <div className="text-right">
            <p className="text-brand font-bold text-lg">{plan.priceTotal} ₴</p>
            <p className="text-xs text-gray-500">{plan.price} ₴/міс</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Номер картки
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all text-lg tracking-widest"
            />
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Термін дії
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all tracking-widest"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              CVV
            </label>
            <div className="relative">
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 pr-10 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all tracking-widest"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
            Ім&apos;я власника картки
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            placeholder="IVAN PETRENKO"
            className="w-full bg-black/50 border border-gray-700 rounded-xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all uppercase tracking-wider"
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isProcessing}
          className="w-full mt-4 bg-brand hover:bg-brand/90 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand/20 disabled:shadow-none"
        >
          <Lock className="w-4 h-4" />
          <span>Оплатити {plan.priceTotal} ₴</span>
        </button>

        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-3">
          <Lock className="w-3 h-3" />
          <span>Захищено 256-bit SSL шифруванням</span>
        </div>
      </form>
    </div>
  );
}

export function PricingModal() {
  const { isPricingOpen, setPricingOpen, activateSubscription, tokens, maxTokens } = useTokens();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isPricingOpen || !mounted) return null;

  const handleSelectPlan = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    if (selectedPlan) {
      activateSubscription(selectedPlan.id);
    }
  };

  const handleClose = () => {
    setPricingOpen(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <div
          className="relative bg-surface border border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-4 md:p-5">
            
              {selectedPlan ? (
                <PaymentForm
                  key="payment"
                  plan={selectedPlan}
                  onBack={() => setSelectedPlan(null)}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <div
                  key="plans"
                >
                  {/* Header */}
                  <div className="text-center mb-3">
                    <div className="inline-flex items-center space-x-2 bg-brand/10 border border-brand/20 rounded-full px-3 py-1 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand" />
                      <span className="text-xs font-medium text-brand">Оберіть план</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5">
                      Розблокуйте повний потенціал
                    </h2>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      У вас залишилось <span className="text-brand font-semibold">{tokens}</span> з {maxTokens} токенів.
                      Оберіть підписку для необмеженого аналізу.
                    </p>
                  </div>

                  {/* Plans Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    {plans.map((plan, i) => {
                      const Icon = plan.icon;
                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-2xl border transition-all duration-300 ${
                            plan.popular
                              ? 'bg-gradient-to-b from-brand/10 to-transparent border-brand/40 shadow-lg shadow-brand/10 scale-[1.02] md:scale-105'
                              : 'bg-black/30 border-gray-800 hover:border-gray-600'
                          }`}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <div className="bg-brand text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg shadow-brand/30">
                                НАЙВИГІДНІШИЙ
                              </div>
                            </div>
                          )}

                          <div className="p-3 pt-4">
                            {/* Plan header */}
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-1.5 rounded-lg ${plan.popular ? 'bg-brand/20' : 'bg-gray-800'}`}>
                                <Icon className={`w-4 h-4 ${plan.popular ? 'text-brand' : 'text-gray-400'}`} />
                              </div>
                              <div>
                                <h3 className="text-sm text-white font-bold">{plan.name}</h3>
                                <p className="text-[10px] text-gray-500">{plan.duration}</p>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-2">
                              <div className="flex items-baseline space-x-1">
                                <span className={`text-2xl font-bold ${plan.popular ? 'text-brand' : 'text-white'}`}>
                                  {plan.price}
                                </span>
                                <span className="text-gray-400 text-xs">₴/міс</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <span className="text-[10px] text-gray-500">{plan.priceTotal} ₴ разом</span>
                                {plan.savings && (
                                  <span className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                                    -{plan.savings}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tokens info */}
                            <div className="bg-white/5 rounded-lg p-1.5 px-2 mb-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-400">Токени</span>
                                <span className="text-xs font-semibold text-white">{plan.tokens.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-gray-400">Аналізів</span>
                                <span className="text-xs font-semibold text-white">{plan.analyses}</span>
                              </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-1 mb-3">
                              {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-start space-x-1.5">
                                  <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-brand' : 'text-gray-500'}`} />
                                  <span className="text-xs text-gray-300 leading-tight">{feature}</span>
                                </li>
                              ))}
                            </ul>

                            {/* CTA */}
                            <button
                              onClick={() => handleSelectPlan(plan)}
                              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                plan.popular
                                  ? 'bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20'
                                  : 'bg-white/5 hover:bg-white/10 text-white border border-gray-700'
                              }`}
                            >
                              Оформити підписку
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer note */}
                  <div className="text-center mt-3">
                    <p className="text-[10px] text-gray-500">
                      Всі ціни вказані в гривнях (UAH). Оплата одноразова за обраний період. Без автоматичного поновлення.
                    </p>
                  </div>
                </div>
              )}
            
          </div>
        </div>
      </div>
    </>
  );
}
