'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AlertOctagon, HelpCircle as HelpIcon, Dices } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { GameTimer } from '@/components/GameTimer';
import { getStoredState, saveStoredState, clearStoredState } from '@/lib/stateManager';
import { tickTimer } from '@/lib/gameEngine';
import { GameState } from '@/types/game';
import { translations, Language } from '@/lib/translations';

export default function PlayPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [starterName, setStarterName] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [lang, setLang] = useState<Language>('tr');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Load state on mount
  useEffect(() => {
    const state = getStoredState();
    if (!state || state.players.length === 0) {
      router.push('/setup');
      return;
    }
    if (state.phase === 'REVEAL') {
      router.push('/reveal');
    } else if (state.phase === 'VOTE') {
      router.push('/vote');
    } else if (state.phase === 'RESULT') {
      router.push('/result');
    } else {
      setGameState(state);
      const randIdx = Math.floor(Math.random() * state.players.length);
      setStarterName(state.players[randIdx].name);
    }
  }, [router]);

  // Handle timer interval ticking
  useEffect(() => {
    if (!gameState || !gameState.timerActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return null;
        const updated = tickTimer(prev);
        saveStoredState(updated);
        
        if (updated.timeRemaining === 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          router.push('/vote');
        }
        
        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState?.timerActive, router]);

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-slate-400">Loading...</span>
      </div>
    );
  }

  const handleToggleTimer = () => {
    const updated = {
      ...gameState,
      timerActive: !gameState.timerActive,
    };
    setGameState(updated);
    saveStoredState(updated);
  };

  const handleSkipTimer = () => {
    const updated = {
      ...gameState,
      timeRemaining: 0,
      timerActive: false,
      phase: 'VOTE' as const,
    };
    setGameState(updated);
    saveStoredState(updated);
    router.push('/vote');
  };

  const handlePickNewStarter = () => {
    const remainingPlayers = gameState.players.filter(p => p.name !== starterName);
    const pool = remainingPlayers.length > 0 ? remainingPlayers : gameState.players;
    const randIdx = Math.floor(Math.random() * pool.length);
    setStarterName(pool[randIdx].name);
  };

  const handleConfirmCancelGame = () => {
    clearStoredState();
    router.push('/');
  };

  const t = translations[lang];

  return (
    <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10 items-center justify-between pb-12">
      {/* Header / Category Badge */}
      <div className="w-full text-center space-y-2 mt-4 select-none">
        <span className="text-[10px] text-brand-primary-light uppercase tracking-widest font-bold bg-brand-primary/10 border border-brand-primary/20 px-3 py-1 rounded-full">
          {t.category_prefix}: {gameState.category}
        </span>
        <h2 className="text-xl font-bold text-slate-200 mt-2">{t.sorgu}</h2>
      </div>

      {/* Timer Section */}
      <div className="my-6">
        <GameTimer
          timeRemaining={gameState.timeRemaining}
          durationMinutes={gameState.durationMinutes}
          timerActive={gameState.timerActive}
          onToggleTimer={handleToggleTimer}
          onSkip={handleSkipTimer}
          lang={lang}
        />
      </div>

      {/* Question Starter Widget */}
      <div className="w-full space-y-4">
        <Card variant="glass" className="p-5 border border-white/5 bg-gradient-to-br from-brand-surface to-brand-bg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3 select-none">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <HelpIcon className="w-4 h-4 text-brand-accent" />
              {t.starting_player}
            </span>
            <button
              onClick={handlePickNewStarter}
              className="p-1.5 text-slate-400 hover:text-brand-accent hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              title="Pick New Player"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center py-2">
            <span className="text-2xl font-black text-brand-accent text-glow-accent">
              {starterName || t.seciliyor}
            </span>
            <p className="text-[10px] text-slate-500 mt-1 select-none">
              {t.starting_player_sub}
            </p>
          </div>
        </Card>

        {/* Cancel Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCancelModalOpen(true)}
          className="w-full py-3 border border-white/5 text-slate-500 hover:text-brand-danger hover:border-brand-danger/30 rounded-2xl text-xs font-semibold"
        >
          {t.end_game}
        </Button>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title={t.cancel_modal_title}
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-danger/10 flex items-center justify-center text-brand-danger mx-auto">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-300">
            {t.cancel_modal_body}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={handleConfirmCancelGame}
            >
              {t.yes_cancel}
            </Button>
            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setIsCancelModalOpen(false)}
            >
              {t.no_cancel}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
