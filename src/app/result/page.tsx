'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ShieldAlert, Key, RotateCcw, Home, Sparkles, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getStoredState, saveStoredState, clearStoredState } from '@/lib/stateManager';
import { submitSpyGuess, overrideSpyGuess, initializeGame } from '@/lib/gameEngine';
import { GameState } from '@/types/game';
import { translations, Language } from '@/lib/translations';

export default function ResultPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [guess, setGuess] = useState('');
  const [showGuessResult, setShowGuessResult] = useState(false);
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
    } else if (state.phase === 'VOTE') {
      router.push('/vote');
    } else {
      setGameState(state);
      if (state.winner === 'players') {
        triggerConfetti();
      }
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

  const votedPlayer = gameState.players.find(p => p.id === gameState.votedPlayerId);
  const spies = gameState.players.filter(p => p.isSpy);
  const spyNamesString = spies.map(s => s.name).join(', ');

  const innocentVotedOut = votedPlayer && !votedPlayer.isSpy;

  const handleGuessSubmit = () => {
    if (!guess.trim()) return;
    
    const updated = submitSpyGuess(gameState, guess);
    setGameState(updated);
    saveStoredState(updated);
    setShowGuessResult(true);

    if (updated.winner === 'players') {
      triggerConfetti();
    }
  };

  const handleOverrideResult = (isCorrect: boolean) => {
    const updated = overrideSpyGuess(gameState, isCorrect);
    setGameState(updated);
    saveStoredState(updated);

    if (!isCorrect) {
      triggerConfetti();
    }
  };

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
      {/* Header Winner Info */}
      <div className="text-center space-y-2 mt-4 select-none">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
          {t.result_title}
        </span>
        
        {/* Winner Banner */}
        {gameState.winner && (
          <h1 className={`text-4xl font-black tracking-tight uppercase ${
            gameState.winner === 'spies' 
              ? 'text-brand-danger text-glow-secondary' 
              : 'text-brand-success text-glow-accent'
          }`}>
            {gameState.winner === 'spies' ? t.spies_win : t.players_win}
          </h1>
        )}

        {/* Voted out spy guessing phase */}
        {!gameState.winner && votedPlayer && votedPlayer.isSpy && (
          <h1 className="text-3xl font-black text-brand-primary-light text-glow-primary uppercase">
            {t.spy_caught}
          </h1>
        )}
      </div>

      {/* Main Stats / Interactive Panel */}
      <div className="my-6 flex-1 flex flex-col justify-center space-y-6">
        
        {/* 1. Winner is decided */}
        {gameState.winner && (
          <div className="space-y-4">
            <Card variant="solid" className="p-6 space-y-4 border border-white/5">
              {/* Voted out info */}
              {votedPlayer && (
                <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                  <div className={`p-2 rounded-xl ${votedPlayer.isSpy ? 'bg-brand-danger/10 text-brand-danger' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {votedPlayer.isSpy ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">{t.voted_player}</span>
                    <span className="font-bold text-slate-200">
                      {votedPlayer.name} ({votedPlayer.isSpy ? (lang === 'tr' ? 'Casus' : 'Spy') : (lang === 'tr' ? 'Köylü' : 'Citizen')})
                    </span>
                  </div>
                </div>
              )}

              {/* Secret Word Reveal */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="p-2 rounded-xl bg-brand-success/10 text-brand-success">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">{lang === 'tr' ? 'Gizli Kelime' : 'Secret Word'}</span>
                  <span className="font-bold text-brand-success uppercase tracking-wide">{gameState.secretWord}</span>
                </div>
              </div>

              {/* Spies Reveal */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-brand-secondary/10 text-brand-secondary">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">{t.game_spies}</span>
                  <span className="font-bold text-brand-secondary-light">{spyNamesString}</span>
                </div>
              </div>
            </Card>

            {/* Spy Guess Details */}
            {gameState.spyGuessedWord && (
              <Card variant="glass" className="p-4 border-2 border-white/5 text-center text-xs space-y-1">
                <p className="text-slate-400">
                  {lang === 'tr' ? 'Casus' : 'Spy'} <span className="font-semibold text-white">"{votedPlayer?.name}"</span> {lang === 'tr' ? 'kelimeyi tahmin etti:' : 'guessed the word:'}
                </p>
                <p className="text-lg font-black text-slate-200 uppercase tracking-wider">
                  "{gameState.spyGuessedWord}"
                </p>
                <p className={`font-bold ${gameState.spyGuessCorrect ? 'text-brand-success' : 'text-brand-danger'}`}>
                  {gameState.spyGuessCorrect ? (lang === 'tr' ? '✓ Doğru Tahmin' : '✓ Correct Guess') : (lang === 'tr' ? '✗ Yanlış Tahmin' : '✗ Wrong Guess')}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* 2. Innocent voted out */}
        {!gameState.winner && innocentVotedOut && (
          <div className="space-y-4">
            <Card variant="solid" className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-danger/10 text-brand-danger flex items-center justify-center mx-auto animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="select-none">
                <h3 className="font-bold text-lg text-white">
                  {t.citizen_voted}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {lang === 'tr'
                    ? `Oylama sonucunda seçilen "${votedPlayer?.name}" bir casus değildi! Casuslar aranızda gizlenmeyi başardı.`
                    : `The voted player "${votedPlayer?.name}" was not a spy! The spies successfully hid among you.`}
                </p>
              </div>
            </Card>
            
            <Button
              variant="danger"
              size="md"
              fullWidth
              onClick={() => handleOverrideResult(true)}
              className="py-4 font-bold"
            >
              {lang === 'tr' ? 'Sonucu Kaydet ve Devam Et' : 'Save Result & Continue'}
            </Button>
          </div>
        )}

        {/* 3. Spy voted out -> Guessing Panel */}
        {!gameState.winner && votedPlayer && votedPlayer.isSpy && (
          <div className="space-y-4">
            <Card variant="solid" className="p-5 border border-white/5 space-y-4 bg-gradient-to-br from-brand-surface to-brand-bg">
              <div className="text-center space-y-2 select-none">
                <div className="inline-flex p-2 bg-brand-primary/10 rounded-xl text-brand-primary-light mb-1">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="font-bold text-white">{t.spy_caught}</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  {lang === 'tr'
                    ? `Oyuncular casusu (${votedPlayer.name}) doğru tahmin etti. Ancak casus kelimeyi bilirse oyunu kazanabilir!`
                    : `Players correctly guessed the spy (${votedPlayer.name}). However, if the spy knows the word, they can still win!`}
                </p>
              </div>

              {!showGuessResult ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                      {t.spy_guess_label}
                    </label>
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder={t.spy_guess_input_placeholder}
                      className="w-full bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none px-4 py-3 rounded-xl text-sm transition-all text-slate-200"
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={!guess.trim()}
                    onClick={handleGuessSubmit}
                    className="py-3 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>{t.spy_guess_submit}</span>
                  </Button>
                </div>
              ) : (
                // Evaluate and show manual override options
                <div className="space-y-4 pt-2 text-center">
                  <div className="space-y-2 text-xs text-slate-400 select-none">
                    <p>
                      {lang === 'tr' ? 'Casus tahmini:' : 'Spy guess:'} <span className="font-bold text-white">"{guess}"</span>
                    </p>
                    <p>
                      {lang === 'tr' ? 'Gerçek kelime:' : 'Secret word:'} <span className="font-bold text-brand-success uppercase tracking-wider">"{gameState.secretWord}"</span>
                    </p>
                  </div>

                  <div className={`p-3 rounded-xl text-sm font-bold select-none ${
                    gameState.winner === 'spies' 
                      ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' 
                      : 'bg-brand-danger/10 text-brand-danger border border-brand-danger/20'
                  }`}>
                    {gameState.winner === 'spies' ? t.system_match_correct : t.system_match_wrong}
                  </div>

                  <div className="space-y-2 pt-2 select-none">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">
                      {t.manual_override_label}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleOverrideResult(false)}
                        className="border-brand-success/20 text-brand-success hover:bg-brand-success/10 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.manual_override_players}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => handleOverrideResult(true)}
                        className="border-brand-danger/20 text-brand-secondary hover:bg-brand-secondary/10 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t.manual_override_spies}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Restart / Navigation Buttons */}
      <div className="w-full space-y-3">
        {gameState.winner && (
          <>
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
          </>
        )}
      </div>
    </main>
  );
}
