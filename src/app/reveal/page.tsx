'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Key, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FlipCard } from '@/components/ui/Card';
import { getStoredState, saveStoredState } from '@/lib/stateManager';
import { proceedReveal, revealCard, hideCard } from '@/lib/gameEngine';
import { GameState } from '@/types/game';
import { translations, Language } from '@/lib/translations';

export default function RevealPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [lang, setLang] = useState<Language>('tr');

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
    if (state.phase === 'PLAY') {
      router.push('/play');
    } else if (state.phase === 'VOTE') {
      router.push('/vote');
    } else if (state.phase === 'RESULT') {
      router.push('/result');
    } else {
      setGameState(state);
    }
  }, [router]);

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-slate-400">Loading...</span>
      </div>
    );
  }

  const t = translations[lang];

  const currentPlayer = gameState.players[gameState.currentRevealIndex];
  if (!currentPlayer) return null;

  const handleCardClick = () => {
    if (gameState.isCardRevealed) {
      const updated = hideCard(gameState);
      setGameState(updated);
      saveStoredState(updated);
    } else {
      const updated = revealCard(gameState);
      setGameState(updated);
      saveStoredState(updated);
    }
  };

  const handleNextPlayer = () => {
    const updated = proceedReveal(gameState);
    saveStoredState(updated);
    
    if (updated.phase === 'PLAY') {
      router.push('/play');
    } else {
      setGameState(updated);
    }
  };

  // Card Front Content (Hidden Role)
  const cardFront = (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary-light animate-pulse">
        <User className="w-10 h-10" />
      </div>
      <div className="space-y-2 select-none">
        <h2 className="text-3xl font-black tracking-tight text-white">
          {currentPlayer.name}
        </h2>
        <p className="text-xs text-brand-primary-light uppercase tracking-widest font-semibold">
          {t.phone_alert}
        </p>
      </div>
      <p className="text-xs text-slate-500 max-w-[200px]">
        {t.phone_alert_sub}
      </p>
    </div>
  );

  // Card Back Content (Revealed Role)
  const cardBack = currentPlayer.isSpy ? (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-brand-danger/10 border border-brand-danger/30 flex items-center justify-center text-brand-danger animate-bounce">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <span className="text-xs text-brand-danger uppercase tracking-widest font-bold">{lang === 'tr' ? 'ROLÜN' : 'ROLE'}</span>
        <h2 className="text-4xl font-black text-brand-danger text-glow-secondary tracking-widest">
          {t.spy_alert}
        </h2>
      </div>
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 max-w-xs">
        <p className="text-xs text-slate-300 leading-relaxed">
          {t.spy_sub}
        </p>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-brand-success/10 border border-brand-success/30 flex items-center justify-center text-brand-success">
        <Key className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{t.citizen_alert}</span>
        <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t.category_prefix}: {gameState.category}</span>
        <p className="text-xs text-slate-400">{t.secret_word_prefix}</p>
        <h2 className="text-3xl font-black text-brand-success text-glow-accent tracking-wide uppercase">
          {currentPlayer.secretWord}
        </h2>
      </div>
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 max-w-xs">
        <p className="text-xs text-slate-300 leading-relaxed font-semibold">
          {t.citizen_sub}
        </p>
      </div>
    </div>
  );

  const progressPercent = ((gameState.currentRevealIndex) / gameState.players.length) * 100;

  return (
    <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10 items-center justify-between pb-12">
      {/* Header Info */}
      <div className="w-full text-center space-y-2 mt-4 select-none">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
          {t.card_dist}
        </span>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-brand-primary h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">
          {t.player_prefix || 'Oyuncu'} {gameState.currentRevealIndex + 1} / {gameState.players.length}
        </p>
      </div>

      {/* 3D Flip Card */}
      <div className="my-8 flex justify-center w-full">
        <FlipCard
          isFlipped={gameState.isCardRevealed}
          onClick={handleCardClick}
          front={cardFront}
          back={cardBack}
        />
      </div>

      {/* Action Button */}
      <div className="w-full">
        {gameState.isCardRevealed ? (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleNextPlayer}
            className="py-4 flex items-center justify-center gap-2 group"
          >
            <span>{t.card_back_sub}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <div className="text-center text-xs text-slate-500 italic py-4 select-none">
            {t.tap_to_open}
          </div>
        )}
      </div>
    </main>
  );
}
