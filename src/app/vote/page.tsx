'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Crosshair, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getStoredState, saveStoredState } from '@/lib/stateManager';
import { submitVote } from '@/lib/gameEngine';
import { GameState } from '@/types/game';
import { translations, Language } from '@/lib/translations';

export default function VotePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
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

  const handleSubmitVote = () => {
    if (!selectedPlayerId) return;

    const updated = submitVote(gameState, selectedPlayerId);
    saveStoredState(updated);
    router.push('/result');
  };

  const t = translations[lang];

  return (
    <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10 justify-between pb-12">
      {/* Header Info */}
      <div className="text-center space-y-2 mt-4 select-none">
        <div className="inline-flex p-3 bg-brand-secondary/10 border border-brand-secondary/30 rounded-2xl text-brand-secondary text-glow-secondary animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {t.vote_title}
        </h1>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          {t.vote_sub}
        </p>
      </div>

      {/* Players Selection Grid */}
      <div className="my-6 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar py-2">
          {gameState.players.map((player) => {
            const isSelected = selectedPlayerId === player.id;
            return (
              <Card
                key={player.id}
                variant={isSelected ? 'glow' : 'glass'}
                onClick={() => setSelectedPlayerId(player.id)}
                className={`cursor-pointer border-2 transition-all duration-200 text-center p-5 flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'border-brand-secondary bg-gradient-to-b from-brand-surface to-brand-secondary/10 shadow-brand-secondary/10 scale-[1.02]'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-brand-secondary">
                    <Crosshair className="w-4 h-4 animate-spin-slow" />
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isSelected ? 'bg-brand-secondary/20 text-brand-secondary' : 'bg-white/5 text-slate-400'
                }`}>
                  <span className="font-bold font-mono">{player.name.substring(0, 2).toUpperCase()}</span>
                </div>
                
                <span className={`font-bold text-sm truncate max-w-full ${
                  isSelected ? 'text-brand-secondary-light' : 'text-slate-200'
                }`}>
                  {player.name}
                </span>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="w-full space-y-4">
        <div className="flex items-start gap-2 bg-white/5 border border-white/5 p-3 rounded-2xl select-none">
          <Info className="w-4.5 h-4.5 text-brand-primary-light flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-400 leading-normal">
            {t.vote_warn}
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={!selectedPlayerId}
          onClick={handleSubmitVote}
          className="py-4 flex items-center justify-center gap-2"
        >
          <Crosshair className="w-5 h-5" />
          <span>{t.vote_submit}</span>
        </Button>
      </div>
    </main>
  );
}
