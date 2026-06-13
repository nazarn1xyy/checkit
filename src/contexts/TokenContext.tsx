'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabase';

type Subscription = {
  plan: 'free' | '3month' | '6month' | 'year';
  expiresAt: number | null; // timestamp
  tokensTotal: number;
};

type TokenContextType = {
  tokens: number;
  maxTokens: number;
  subscription: Subscription;
  useTokens: (amount: number) => boolean;
  hasTokens: (amount: number) => boolean;
  isPricingOpen: boolean;
  setPricingOpen: (open: boolean) => void;
  activateSubscription: (plan: '3month' | '6month' | 'year') => void;
};

const TOKENS_PER_ANALYSIS = 334; // ~10 free analyses = 3340 tokens
const FREE_TOKENS = 3340;
const OLD_FREE_TOKENS = 1000; // legacy value — used for migration

const PLAN_TOKENS: Record<string, number> = {
  '3month': 10000,   // ~30 analyses
  '6month': 25000,   // ~75 analyses
  'year': 60000,     // ~180 analyses
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

import { useAuth } from './AuthContext';

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();

  const [tokens, setTokens] = useState(FREE_TOKENS);
  const [maxTokens, setMaxTokens] = useState(FREE_TOKENS);
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'free',
    expiresAt: null,
    tokensTotal: FREE_TOKENS,
  });
  const [isPricingOpen, setPricingOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('checkit_tokens');
    let loadedData = stored ? JSON.parse(stored) : null;
    
    const loadFromSupabase = async () => {
      if (hasSupabase && supabase && user?.email) {
        const { data, error } = await supabase.from('user_tokens').select('*').eq('user_email', user.email).single();
        if (data) {
          loadedData = {
            tokens: data.tokens,
            maxTokens: data.maxtokens,
            subscription: {
              plan: data.plan,
              expiresAt: data.expiresat ? new Date(data.expiresat).getTime() : null,
              tokensTotal: data.maxtokens
            }
          };
        }
      }

      if (loadedData) {
        try {
          const savedPlan = loadedData.subscription?.plan ?? 'free';
          const savedTokens: number = loadedData.tokens ?? FREE_TOKENS;
          const savedMax: number = loadedData.maxTokens ?? FREE_TOKENS;
          const migratedTokens = savedPlan === 'free' && savedMax === OLD_FREE_TOKENS
            ? savedTokens + (FREE_TOKENS - OLD_FREE_TOKENS)
            : savedTokens;
          const migratedMax = savedPlan === 'free' && savedMax === OLD_FREE_TOKENS
            ? FREE_TOKENS
            : savedMax;
          setTokens(migratedTokens);
          setMaxTokens(migratedMax);
          setSubscription(loadedData.subscription ?? { plan: 'free', expiresAt: null, tokensTotal: FREE_TOKENS });
        } catch {
          // corrupt data, keep defaults
        }
      }
      setIsLoaded(true);
    };

    loadFromSupabase();
  }, [user?.email]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('checkit_tokens', JSON.stringify({
      tokens,
      maxTokens,
      subscription,
    }));

    if (hasSupabase && supabase && user?.email) {
      supabase.from('user_tokens').upsert({
        user_email: user.email,
        tokens,
        maxtokens: maxTokens,
        plan: subscription.plan,
        expiresat: subscription.expiresAt ? new Date(subscription.expiresAt).toISOString() : null,
      }).then(({ error }) => {
        if (error) console.error('Supabase token save error:', error.message, error.details, error.hint, error);
      });
    }
  }, [tokens, maxTokens, subscription, isLoaded, user?.email]);

  const useTokensFunc = (amount: number): boolean => {
    if (isAdmin) return true;
    if (tokens < amount) return false;
    setTokens(prev => prev - amount);
    return true;
  };

  const hasTokensFunc = (amount: number): boolean => {
    if (isAdmin) return true;
    return tokens >= amount;
  };

  const effectiveSubscription = React.useMemo(
    () => isAdmin
      // eslint-disable-next-line react-hooks/purity
      ? { plan: 'year' as const, expiresAt: Date.now() + 31536000000, tokensTotal: 9999999 }
      : subscription,
    [isAdmin, subscription]
  );

  const effectiveTokens = isAdmin ? 9999999 : tokens;
  const effectiveMaxTokens = isAdmin ? 9999999 : maxTokens;

  const activateSubscription = (plan: '3month' | '6month' | 'year') => {
    const planTokens = PLAN_TOKENS[plan];
    const months = plan === '3month' ? 3 : plan === '6month' ? 6 : 12;
    const expiresAt = Date.now() + months * 30 * 24 * 60 * 60 * 1000;

    setTokens(planTokens);
    setMaxTokens(planTokens);
    setSubscription({
      plan,
      expiresAt,
      tokensTotal: planTokens,
    });
    setPricingOpen(false);
  };

  if (!isLoaded) {
    // Provide default values so the page renders immediately
    return (
      <TokenContext.Provider value={{
        tokens: FREE_TOKENS,
        maxTokens: FREE_TOKENS,
        subscription: { plan: 'free', expiresAt: null, tokensTotal: FREE_TOKENS },
        useTokens: () => false,
        hasTokens: () => true,
        isPricingOpen: false,
        setPricingOpen: () => {},
        activateSubscription: () => {},
      }}>
        {children}
      </TokenContext.Provider>
    );
  }

  return (
    <TokenContext.Provider value={{
      tokens: effectiveTokens,
      maxTokens: effectiveMaxTokens,
      subscription: effectiveSubscription,
      useTokens: useTokensFunc,
      hasTokens: hasTokensFunc,
      isPricingOpen,
      setPricingOpen,
      activateSubscription,
    }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
}

export const TOKENS_PER_ANALYSIS_COST = TOKENS_PER_ANALYSIS;
