'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) return null;

  const handleScrollToFaq = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full border-t border-gray-800 bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="CheckIt" width={32} height={32} className="w-8 h-8 rounded-[10px] aspect-square object-cover" />
              <span className="font-semibold text-xl text-white tracking-tight">CheckIt</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              AI-платформа для аналізу та валідації бізнес-ідей. Отримайте професійну оцінку за секунди.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Продукт</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Головна</Link></li>
              <li><Link href="/projects" className="hover:text-white transition-colors">Мої проєкти</Link></li>
              <li><Link href="/#faq" onClick={handleScrollToFaq} className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Контакти</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="mailto:hello@checkit.ai" className="hover:text-white transition-colors">hello@checkit.ai</a></li>
              <li><span className="text-gray-500">Telegram (скоро)</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-gray-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CheckIt. Всі права захищені.
          </p>
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Умови використання</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Політика конфіденційності</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
