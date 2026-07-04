'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, HelpCircle, Package, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { translations, Language } from '@/lib/translations';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('tr');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sync language selection on mount and listen to updates
  useEffect(() => {
    const saved = localStorage.getItem('whoisspy_language') as Language;
    if (saved === 'tr' || saved === 'en') {
      setLang(saved);
    }

    const handleLangChange = () => {
      const current = localStorage.getItem('whoisspy_language') as Language;
      if (current === 'tr' || current === 'en') {
        setLang(current);
      }
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = translations[lang];

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full relative z-10">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-brand-secondary/10 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12 select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-primary-light text-xs font-semibold uppercase tracking-widest animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          {t.social_deduction}
        </div>
        
        <h1 className="text-6xl font-black tracking-tight">
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">WhoIs</span>
          <span className="bg-gradient-to-r from-brand-primary-light via-brand-primary to-brand-secondary bg-clip-text text-transparent text-glow-primary">SPY?</span>
        </h1>
        
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          {t.game_desc}
        </p>
      </div>

      {/* Action Cards / Menu */}
      <div className="w-full space-y-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          animateGlow
          onClick={() => router.push('/setup')}
          className="py-5 text-xl flex items-center justify-center gap-3 rounded-2xl"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>{t.start_game}</span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl"
          >
            <HelpCircle className="w-5 h-5" />
            <span>{t.rules}</span>
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => router.push('/admin')}
            className="flex items-center justify-center gap-2 py-4 border border-white/5 hover:border-white/10 rounded-2xl"
          >
            <Package className="w-5 h-5" />
            <span>{t.words}</span>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-slate-500 space-y-1 select-none">
        <p>{t.offline_play}</p>
        <p className="text-[10px]">{t.version}</p>
      </div>

      {/* Rules Modal */}
      <Modal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        title={t.how_to_play}
      >
        {lang === 'tr' ? (
          <div className="space-y-6 text-sm text-slate-300">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Kurulum ve Rol Dağıtımı</h4>
                <p>
                  Oyuncu isimlerini girin, süreyi ve kategoriyi seçip oyunu başlatın. Telefonu sırayla elden ele gezdireceksiniz.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Kartını Gör</h4>
                <p>
                  Her oyuncu kendi adını görünce telefonu alır, ekrana dokunarak kartını açar. 
                  Normal oyuncular <strong>gizli kelimeyi</strong> görür. 
                  Casuslar ise kelime yerine <strong>CASUS</strong> yazarını görür. Rolünüzü kimseye göstermeyin!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Soru-Cevap (Oyun Süreci)</h4>
                <p>
                  Zamanlayıcıyı başlatın. Oyuncular sırayla birbirlerine şüphe uyandıran sorular sorar.
                  Hedef kelimeyi açıkça söylemeden, kelimeye dair ipuçları vermeye çalışın.
                  Casus ise kelimeyi çaktırmadan anlamaya çalışarak sorulara cevap verir.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                4
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Oylama ve Sonuç</h4>
                <p>
                  Süre bittiğinde tartışıp en çok şüphe çekeni oylarsınız.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                  <li>
                    <span className="text-brand-secondary font-semibold">Casus Olmayan Biri Elenirse:</span> Casus anında kazanır!
                  </li>
                  <li>
                    <span className="text-brand-success font-semibold">Casus Elenirse:</span> Casusa kelimeyi tahmin etmek için tek bir hak verilir. Doğru tahmin ederse casus, bilemezse diğerleri kazanır.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-slate-300">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                1
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Setup & Role Distribution</h4>
                <p>
                  Enter player names, choose the duration and category, and start the game. You will pass the phone around.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                2
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">View Your Card</h4>
                <p>
                  Each player holds the phone privately and taps their card to flip it. 
                  Citizens see the <strong>secret word</strong>. 
                  Spies only see the word <strong>SPY</strong>. Do not let anyone see your screen!
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                3
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Question & Answer Phase</h4>
                <p>
                  Start the countdown. Players take turns questioning each other.
                  Give subtle, vague hints showing you know the word without spelling it out.
                  The spy will try to blend in and figure out the secret word.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary-light font-bold">
                4
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">Voting & Game Over</h4>
                <p>
                  When the timer ends, debate and vote out who you think is the spy.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                  <li>
                    <span className="text-brand-secondary font-semibold">If a Citizen is Voted Out:</span> Spies win immediately!
                  </li>
                  <li>
                    <span className="text-brand-success font-semibold">If a Spy is Voted Out:</span> The spy gets one final attempt to guess the secret word. If correct, they win; otherwise, the citizens win!
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
