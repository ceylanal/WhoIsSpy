'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Key, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getStoredState, saveStoredState, clearStoredState } from '@/lib/stateManager';
import { initializeGame } from '@/lib/gameEngine';
import { GameState } from '@/types/game';
import { translations, Language } from '@/lib/translations';

export default function ResultPage() {
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
    if (state.phase === 'REVEAL') {
      router.push('/reveal');
    } else if (state.phase === 'PLAY') {
      router.push('/play');
    } else {
      setGameState(state);
      triggerConfetti();
    }
  }, [router]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-slate-400">Loading...</span>
      </div>
    );
  }

  const t = translations[lang];

  const spies = gameState.players.filter(p => p.isSpy);
  const spyNamesString = spies.map(s => s.name).join(', ');

  const handlePlayAgainSamePlayers = () => {
    try {
      const playerNames = gameState.players.map(p => p.name);
      
      const { fallbackCategoriesTr, fallbackCategoriesEn } = require('@/data/fallbackWords');
      let wordList: string[] = [];
      
      const currentFallback = lang === 'tr' ? fallbackCategoriesTr : fallbackCategoriesEn;
      
      if (gameState.category === 'Karışık' || gameState.category === 'Mixed') {
        wordList = currentFallback.flatMap((c: any) => c.words);
      } else {
        const found = currentFallback.find((c: any) => c.name === gameState.category);
        wordList = found ? found.words : currentFallback.flatMap((c: any) => c.words);
      }

      const freshState = initializeGame(
        playerNames,
        gameState.spyCount,
        gameState.durationMinutes,
        gameState.category,
        wordList
      );

      saveStoredState(freshState);
      router.push('/reveal');
    } catch (e) {
      router.push('/setup');
    }
  };

  const handleGoHome = () => {
    clearStoredState();
    router.push('/');
  };

  return (
    <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10 justify-between pb-12">
      {/* Header Info */}
      <div className="text-center space-y-2 mt-4 select-none">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
          {t.result_title}
        </span>
        <h1 className="text-3xl font-black text-brand-primary-light text-glow-primary uppercase">
          {lang === 'tr' ? 'OYUN BİTTİ!' : 'GAME OVER!'}
        </h1>
      </div>

      {/* Main Stats / Roles Reveal Panel */}
      <div className="my-6 flex-1 flex flex-col justify-center space-y-6">
        
        {/* Game Secrets Card */}
        <Card variant="solid" className="p-6 space-y-4 border border-white/5 bg-gradient-to-br from-brand-surface to-brand-bg">
          {/* Secret Word */}
          <div className="flex items-center gap-3 pb-3 border-b border-white/5">
            <div className="p-2 rounded-xl bg-brand-success/10 text-brand-success">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">
                {lang === 'tr' ? 'Gizli Kelime' : 'Secret Word'}
              </span>
              <span className="font-bold text-brand-success uppercase tracking-wide">
                {gameState.secretWord} ({t.category_prefix}: {gameState.category})
              </span>
            </div>
          </div>

          {/* Spies */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-secondary/10 text-brand-secondary">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-semibold">
                {t.game_spies}
              </span>
              <span className="font-bold text-brand-secondary-light">
                {spyNamesString}
              </span>
            </div>
          </div>
        </Card>

        {/* Full Players List & Roles */}
        <div className="space-y-3">
          <h3 className="text-xs text-slate-400 uppercase tracking-widest font-bold px-1">
            {lang === 'tr' ? 'OYUNCU ROLLERİ' : 'PLAYER ROLES'}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 no-scrollbar">
            {gameState.players.map((player) => (
              <Card 
                key={player.id} 
                variant="glass" 
                className="p-4 flex items-center justify-between border border-white/5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    player.isSpy ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-success/10 text-brand-success'
                  }`}>
                    {player.isSpy ? <ShieldAlert className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-200 block">{player.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      {player.isSpy 
                        ? (lang === 'tr' ? 'Casus' : 'Spy') 
                        : (lang === 'tr' ? 'Vatandaş' : 'Citizen')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    player.isSpy ? 'text-brand-danger' : 'text-brand-success'
                  }`}>
                    {player.isSpy ? (lang === 'tr' ? 'CASUS' : 'SPY') : player.secretWord}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* Restart / Navigation Buttons */}
      <div className="w-full space-y-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handlePlayAgainSamePlayers}
          className="py-4 flex items-center justify-center gap-2 rounded-2xl"
        >
          <RotateCcw className="w-5 h-5" />
          <span>{t.play_again}</span>
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleGoHome}
          className="py-4 border border-white/5 hover:border-white/10 flex items-center justify-center gap-2 rounded-2xl"
        >
          <Home className="w-5 h-5" />
          <span>{t.main_menu}</span>
        </Button>
      </div>
    </main>
  );
}
