'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Language } from '@/lib/translations';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>('tr');

  useEffect(() => {
    const saved = localStorage.getItem('whoisspy_language') as Language;
    if (saved === 'tr' || saved === 'en') {
      setLang(saved);
    }

    const handleLangChange = () => {
      const current = localStorage.getItem('whoisspy_language') as Language;
      if (current) setLang(current);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const handleToggle = () => {
    const next: Language = lang === 'tr' ? 'en' : 'tr';
    localStorage.setItem('whoisspy_language', next);
    setLang(next);
    window.dispatchEvent(new Event('languageChange'));
  };

  const handleLogoClick = () => {
    if (pathname === '/') return;
    
    const confirmMsg = lang === 'tr'
      ? 'Ana menüye dönmek istiyor musunuz? Aktif oyun iptal edilecektir.'
      : 'Do you want to return to the main menu? Active game will be aborted.';
      
    if (pathname === '/setup' || pathname === '/admin' || window.confirm(confirmMsg)) {
      router.push('/');
    }
  };

  return (
    <header className="w-full max-w-md mx-auto px-6 pt-5 flex items-center justify-between z-50 relative select-none">
      <button 
        onClick={handleLogoClick}
        className="font-black text-sm tracking-widest text-slate-300 hover:text-white transition-colors cursor-pointer"
      >
        WHOIS<span className="text-brand-primary text-glow-primary">SPY?</span>
      </button>

      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 text-[10px] uppercase font-bold tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5 text-brand-primary-light" />
        <span>{lang === 'tr' ? 'Türkçe 🇹🇷' : 'English 🇬🇧'}</span>
      </button>
    </header>
  );
};
export default Header;
