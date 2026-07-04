'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, Trash2, Shield, Clock, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategorySelector } from '@/components/CategorySelector';
import { initializeGame } from '@/lib/gameEngine';
import { saveStoredState, getStoredState } from '@/lib/stateManager';
import { translations, Language } from '@/lib/translations';

export default function SetupPage() {
  const router = useRouter();
  
  // Language state
  const [lang, setLang] = useState<Language>('tr');

  // Players State
  const [players, setPlayers] = useState<string[]>(['', '', '']);
  // Settings
  const [spyCount, setSpyCount] = useState<number>(1);
  const [duration, setDuration] = useState<number>(3); // 3 minutes default
  // Category & words
  const [categoryName, setCategoryName] = useState<string>('');
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Load last saved game settings on mount if available
  useEffect(() => {
    const prevState = getStoredState();
    if (prevState && prevState.players && prevState.players.length >= 3) {
      setPlayers(prevState.players.map(p => p.name));
      setSpyCount(prevState.spyCount);
      setDuration(prevState.durationMinutes);
    }
  }, []);

  // Sync spy count constraints when player count changes
  useEffect(() => {
    const maxSpies = Math.max(1, players.length - 2);
    if (spyCount > maxSpies) {
      setSpyCount(maxSpies);
    }
  }, [players.length, spyCount]);

  const handleAddPlayer = () => {
    if (players.length >= 12) return;
    setPlayers([...players, '']);
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length <= 3) return;
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const handlePlayerNameChange = (index: number, val: string) => {
    const newPlayers = [...players];
    newPlayers[index] = val;
    setPlayers(newPlayers);
  };

  const handleSelectCategory = (name: string, words: string[]) => {
    setCategoryName(name);
    setWordPool(words);
  };

  const handleStartGame = () => {
    try {
      setErrorMessage(null);
      const t = translations[lang];

      // Clean player names
      const finalNames = players.map((name, idx) => 
        name.trim() ? name.trim() : `${t.player_prefix || 'Oyuncu'} ${idx + 1}`
      );

      if (wordPool.length === 0) {
        setErrorMessage(t.lobby_error);
        return;
      }

      // Initialize game via engine
      const gameState = initializeGame(
        finalNames,
        spyCount,
        duration,
        categoryName,
        wordPool
      );

      // Save state to localStorage
      saveStoredState(gameState);

      // Go to reveal page
      router.push('/reveal');
    } catch (e: any) {
      setErrorMessage(e.message || 'Error occurred while starting the game.');
    }
  };

  const maxSpies = Math.max(1, players.length - 2);
  const t = translations[lang];

  return (
    <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {t.setup_title}
        </h1>
      </div>

      <div className="space-y-6 flex-1">
        {/* Oyuncular Section */}
        <Card variant="glass" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-lg">{t.players} ({players.length}/12)</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPlayer}
              disabled={players.length >= 12}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.add}</span>
            </Button>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {players.map((player, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-xs text-slate-500 font-mono w-5">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={player}
                  placeholder={`${t.player_prefix || 'Oyuncu'} ${index + 1}`}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  maxLength={15}
                  className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-brand-primary focus:outline-none px-4 py-2.5 rounded-xl text-sm transition-all text-slate-200"
                />
                <button
                  onClick={() => handleRemovePlayer(index)}
                  disabled={players.length <= 3}
                  className="p-2 text-slate-500 hover:text-brand-danger disabled:opacity-0 disabled:pointer-events-none transition-all"
                  title="Delete Player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Ayarlar Section */}
        <Card variant="glass" className="grid grid-cols-2 gap-4">
          {/* Casus Sayısı */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield className="w-4 h-4 text-brand-secondary" />
              <span className="text-xs font-semibold">{t.spy_count}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-1 w-full">
              <button
                onClick={() => setSpyCount(prev => Math.max(1, prev - 1))}
                disabled={spyCount <= 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-lg text-white font-mono">{spyCount}</span>
              <button
                onClick={() => setSpyCount(prev => Math.min(maxSpies, prev + 1))}
                disabled={spyCount >= maxSpies}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Süre */}
          <div className="space-y-2 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-4 h-4 text-brand-accent" />
              <span className="text-xs font-semibold">{t.duration}</span>
            </div>
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-1 w-full">
              <button
                onClick={() => setDuration(prev => Math.max(1, prev - 1))}
                disabled={duration <= 1}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-lg text-white font-mono">{duration}</span>
              <button
                onClick={() => setDuration(prev => Math.min(10, prev + 1))}
                disabled={duration >= 10}
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-slate-300 hover:bg-white/5 disabled:opacity-30 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </Card>

        {/* Kategori Seçimi */}
        <CategorySelector
          selectedCategoryName={categoryName}
          onSelectCategory={handleSelectCategory}
        />

        {errorMessage && (
          <div className="p-3.5 bg-brand-danger/25 border border-brand-danger/30 text-red-200 text-xs rounded-2xl text-center font-semibold animate-pulse">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Start Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleStartGame}
        className="mt-6 py-4 flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5 fill-current" />
        <span>{t.start_card_dist}</span>
      </Button>
    </main>
  );
}
