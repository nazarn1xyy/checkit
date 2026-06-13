'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTokens, TOKENS_PER_ANALYSIS_COST } from '@/contexts/TokenContext';
import { Coins } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout, setAuthModalOpen } = useAuth();
  const { tokens, setPricingOpen } = useTokens();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/admin')) return null;

  const isAnalyzePage = pathname === '/analyze';
  const remainingAnalyses = Math.floor(tokens / TOKENS_PER_ANALYSIS_COST);

  const handleScrollToFaq = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Outer wrapper handles the horizontal padding/centering */}
      <div
        className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          padding: isScrolled ? '8px 16px 0 16px' : '0',
        }}
      >
        {/* Inner bar handles visual styling */}
        <div
          className="transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border border-transparent mx-auto"
          style={{
            maxWidth: isScrolled ? '860px' : '100%',
            borderRadius: isScrolled ? '28px' : '0',
            borderColor: isScrolled ? 'rgba(55, 65, 81, 0.6)' : 'transparent',
            borderBottomColor: isScrolled ? 'rgba(55, 65, 81, 0.6)' : 'rgba(55, 65, 81, 0.7)',
            background: isScrolled
              ? 'rgba(10, 10, 12, 0.9)'
              : 'rgba(10, 10, 12, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: isScrolled
              ? '0 8px 32px rgba(0, 0, 0, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)'
              : 'none',
          }}
        >
          <div
            className="flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] mx-auto"
            style={{
              height: isScrolled ? '48px' : '64px',
              paddingLeft: isScrolled ? '20px' : '16px',
              paddingRight: isScrolled ? '20px' : '16px',
              maxWidth: '1280px',
            }}
          >
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <Image
                src="/logo.png"
                alt="CheckIt Logo"
                width={32}
                height={32}
                className="rounded-[10px] aspect-square object-cover transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                  width: isScrolled ? '24px' : '32px',
                  height: isScrolled ? '24px' : '32px',
                }}
              />
              <span
                className="hidden sm:block font-semibold tracking-tight text-white transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{ fontSize: isScrolled ? '16px' : '20px' }}
              >
                CheckIt
              </span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              {!isAnalyzePage && (
                <nav className="flex items-center space-x-2.5 sm:space-x-4 md:space-x-6 text-[11px] sm:text-sm font-medium text-gray-300">
                  <Link href="/" className="hover:text-white transition-colors">Головна</Link>
                  <Link href="/projects" className="hover:text-white transition-colors">Мої проєкти</Link>
                  <Link href="/#faq" onClick={handleScrollToFaq} className="hover:text-white transition-colors">FAQ</Link>
                </nav>
              )}
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Token Button */}
                  <button
                    onClick={() => setPricingOpen(true)}
                    className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-surface border border-gray-700 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <Coins className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[11px] sm:text-xs font-semibold text-gray-200">
                      {remainingAnalyses} <span className="hidden lg:inline font-normal text-gray-400">аналізів</span>
                    </span>
                  </button>
                  {/* Profile */}
                  <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-gray-700">
                    <button onClick={logout} className="flex items-center space-x-2 hover:opacity-80 transition-opacity" title="Вийти з акаунта">
                      <Image src={user.avatar || "/logo.png"} alt={user.name} width={28} height={28} unoptimized className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-800" />
                      <span className="hidden md:block text-gray-400 hover:text-white text-xs transition-colors">Вийти</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-1.5 bg-brand text-white text-sm font-medium rounded-full hover:bg-brand/90 transition-colors shadow-sm shadow-brand/20"
                >
                  Увійти
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
