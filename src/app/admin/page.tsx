'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { translations, Language } from '@/lib/translations';

interface CustomPack {
  name: string;
  words: string[];
}

export default function AdminPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>('tr');

  // Custom Local Packs
  const [customPacks, setCustomPacks] = useState<CustomPack[]>([]);
  const [newPackName, setNewPackName] = useState('');
  const [selectedLocalPackName, setSelectedLocalPackName] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');

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

  // Load custom packs from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('whoisspy_custom_packs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CustomPack[];
        setCustomPacks(parsed);
        if (parsed.length > 0) {
          setSelectedLocalPackName(parsed[0].name);
        }
      } catch {}
    } else {
      const initialPack: CustomPack[] = [
        { name: lang === 'tr' ? "Benim Paketim" : "My Custom Pack", words: lang === 'tr' ? ["Gemici", "Deniz Feneri", "Uzaylı"] : ["Sailor", "Lighthouse", "Alien"] }
      ];
      setCustomPacks(initialPack);
      setSelectedLocalPackName(initialPack[0].name);
      localStorage.setItem('whoisspy_custom_packs', JSON.stringify(initialPack));
    }
  }, [lang]);

  // Custom Pack Logic
  const handleCreatePack = () => {
    if (!newPackName.trim()) return;
    const name = newPackName.trim();
    if (customPacks.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert(lang === 'tr' ? 'Bu isimde bir paket zaten var.' : 'A pack with this name already exists.');
      return;
    }
    const updated = [...customPacks, { name, words: [] }];
    setCustomPacks(updated);
    setSelectedLocalPackName(name);
    setNewPackName('');
    localStorage.setItem('whoisspy_custom_packs', JSON.stringify(updated));
  };

  const handleDeletePack = (nameToDelete: string) => {
    const updated = customPacks.filter(p => p.name !== nameToDelete);
    setCustomPacks(updated);
    if (selectedLocalPackName === nameToDelete) {
      setSelectedLocalPackName(updated.length > 0 ? updated[0].name : null);
    }
    localStorage.setItem('whoisspy_custom_packs', JSON.stringify(updated));
  };

  const handleAddWordToLocal = () => {
    if (!newWord.trim() || !selectedLocalPackName) return;
    const word = newWord.trim();
    const updated = customPacks.map(pack => {
      if (pack.name === selectedLocalPackName) {
        if (pack.words.includes(word)) return pack;
        return { ...pack, words: [...pack.words, word] };
      }
      return pack;
    });
    setCustomPacks(updated);
    setNewWord('');
    localStorage.setItem('whoisspy_custom_packs', JSON.stringify(updated));
  };

  const handleRemoveWordFromLocal = (wordToRemove: string) => {
    const updated = customPacks.map(pack => {
      if (pack.name === selectedLocalPackName) {
        return { ...pack, words: pack.words.filter(w => w !== wordToRemove) };
      }
      return pack;
    });
    setCustomPacks(updated);
    localStorage.setItem('whoisspy_custom_packs', JSON.stringify(updated));
  };

  const selectedLocalPack = customPacks.find(p => p.name === selectedLocalPackName);
  const t = translations[lang];

  return (
    <main className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full relative z-10 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {t.admin_title}
        </h1>
      </div>
      <p className="text-xs text-slate-500 mb-6 ml-12">
        {lang === 'tr' ? 'Kendi kelime paketlerinizi oluşturun ve yönetin' : 'Create and manage your own word packs'}
      </p>

      {/* Create New Pack */}
      <Card variant="glass" className="p-4 mb-6 border border-white/5">
        <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-2">
          {t.admin_local_create}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPackName}
            onChange={(e) => setNewPackName(e.target.value)}
            placeholder={t.admin_local_placeholder}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePack()}
            className="flex-1 bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none px-4 py-2.5 rounded-xl text-sm transition-all text-slate-200"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreatePack}
            className="px-4 rounded-xl flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{t.admin_local_btn}</span>
          </Button>
        </div>
      </Card>

      {/* Packs Content */}
      <div className="flex-1 flex flex-col">
        {customPacks.length > 0 ? (
          <div className="space-y-4 flex-1 flex flex-col">
            {/* Pack Tabs */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                {t.admin_local_title}
              </label>
              <div className="flex flex-wrap gap-2">
                {customPacks.map((pack) => (
                  <div key={pack.name} className="flex items-center">
                    <button
                      onClick={() => setSelectedLocalPackName(pack.name)}
                      className={`px-3 py-1.5 rounded-l-xl text-xs font-semibold border-y border-l transition-all cursor-pointer ${
                        selectedLocalPackName === pack.name
                          ? 'bg-brand-primary/20 border-brand-primary text-brand-primary-light'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pack.name} ({pack.words.length})
                    </button>
                    <button
                      onClick={() => handleDeletePack(pack.name)}
                      className="px-2 py-1.5 border border-white/5 hover:border-brand-danger/30 rounded-r-xl bg-white/5 hover:bg-brand-danger/10 hover:text-brand-danger transition-colors text-slate-500 cursor-pointer"
                      title={lang === 'tr' ? 'Paketi Sil' : 'Delete Pack'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Pack Word Management */}
            {selectedLocalPack && (
              <Card variant="glass" className="p-4 flex-1 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    &quot;{selectedLocalPack.name}&quot; {t.admin_local_words_title}
                  </span>
                  <span className="text-slate-500 text-[10px]">{selectedLocalPack.words.length} {t.words_suffix.toLowerCase()}</span>
                </div>

                {/* Add Word */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder={t.admin_local_add_placeholder}
                    className="flex-1 bg-white/5 border border-white/10 focus:border-brand-primary focus:outline-none px-3 py-2 rounded-xl text-xs transition-all text-slate-200"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWordToLocal()}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddWordToLocal}
                    className="px-3 py-2 rounded-xl"
                  >
                    {t.add}
                  </Button>
                </div>

                {/* Word Grid */}
                {selectedLocalPack.words.length > 0 ? (
                  <div className="flex-1 overflow-y-auto no-scrollbar max-h-[260px] grid grid-cols-2 gap-2 text-xs text-slate-300">
                    {selectedLocalPack.words.map((w, idx) => (
                      <div key={idx} className="bg-white/5 px-2 py-1.5 rounded-xl flex items-center justify-between group">
                        <span className="truncate pr-1">{w}</span>
                        <button
                          onClick={() => handleRemoveWordFromLocal(w)}
                          className="text-slate-500 hover:text-brand-danger opacity-60 hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[11px] text-slate-500 text-center leading-normal select-none">
                    {t.admin_local_empty}
                  </div>
                )}
              </Card>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
              <Package className="w-8 h-8 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">
                {lang === 'tr' ? 'Henüz paketiniz yok' : 'No packs yet'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'tr' ? 'Yukarıdan yeni bir kelime paketi oluşturun!' : 'Create a new word pack above to get started!'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
