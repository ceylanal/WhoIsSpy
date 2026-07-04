'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wifi, WifiOff, Plus, Trash2, Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase, isSupabaseConnected } from '@/lib/supabase';
import { translations, Language } from '@/lib/translations';

interface CustomPack {
  name: string;
  words: string[];
}

export default function AdminPage() {
  const router = useRouter();
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cloud' | 'local' | 'sql'>('cloud');
  const [lang, setLang] = useState<Language>('tr');
  
  // Cloud Categories
  const [cloudCategories, setCloudCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCloudCatId, setSelectedCloudCatId] = useState<string | null>(null);
  const [cloudWords, setCloudWords] = useState<string[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);

  // Custom Local Packs
  const [customPacks, setCustomPacks] = useState<CustomPack[]>([]);
  const [newPackName, setNewPackName] = useState('');
  const [selectedLocalPackName, setSelectedLocalPackName] = useState<string | null>(null);
  const [newWord, setNewWord] = useState('');

  // UI States
  const [copied, setCopied] = useState(false);

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

  // Diagnostic connection on mount
  useEffect(() => {
    async function checkConnection() {
      setLoading(true);
      const connected = await isSupabaseConnected();
      setOnline(connected);

      if (connected && supabase) {
        try {
          const { data } = await supabase
            .from('categories')
            .select('id, name')
            .eq('is_active', true);
          if (data) {
            setCloudCategories(data);
            if (data.length > 0) {
              setSelectedCloudCatId(data[0].id);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Load custom local packs
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

      setLoading(false);
    }
    checkConnection();
  }, [lang]);

  // Fetch words for selected cloud category
  useEffect(() => {
    async function fetchCloudWords() {
      if (!online || !supabase || !selectedCloudCatId) return;
      setLoadingWords(true);
      try {
        const { data } = await supabase
          .from('words')
          .select('word')
          .eq('category_id', selectedCloudCatId);
        if (data) {
          setCloudWords(data.map(w => w.word));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingWords(false);
      }
    }
    fetchCloudWords();
  }, [selectedCloudCatId, online]);

  const handleCopySQL = () => {
    const sqlText = `-- Create categories table
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create words table
create table public.words (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.categories(id) on delete cascade not null,
    word text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_category_word unique(category_id, word)
);

-- Enable RLS
alter table public.categories enable row level security;
alter table public.words enable row level security;

-- Policies
create policy "Sadece aktif kategorileri herkes okuyabilir" on public.categories for select using (is_active = true);
create policy "Kelimeleri herkes okuyabilir" on public.words for select using (true);`;
    
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        if (pack.words.includes(word)) return pack; // avoid duplicate
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
      <div className="flex items-center gap-4 mb-6">
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

      {/* Diagnostic Connection Alert */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between mb-6 select-none ${
        online
          ? 'bg-brand-success/10 border-brand-success/30 text-emerald-300'
          : 'bg-brand-warning/10 border-brand-warning/20 text-amber-300'
      }`}>
        <div className="flex items-center gap-2.5">
          {online ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          <div>
            <span className="text-xs block font-bold">{t.admin_status}</span>
            <span className="text-[10px] opacity-80">
              {online ? t.admin_online : t.admin_offline}
            </span>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
          online ? 'bg-brand-success/20 text-emerald-300' : 'bg-brand-warning/20 text-amber-300'
        }`}>
          {online ? t.admin_active : t.admin_passive}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/5 border border-white/5 rounded-2xl p-1 mb-6 text-xs font-semibold select-none">
        <button
          onClick={() => setActiveTab('cloud')}
          disabled={!online}
          className={`flex-1 py-2.5 rounded-xl text-center transition-colors disabled:opacity-40 cursor-pointer ${
            activeTab === 'cloud' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.admin_tab_cloud}
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 py-2.5 rounded-xl text-center transition-colors cursor-pointer ${
            activeTab === 'local' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.admin_tab_local}
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex-1 py-2.5 rounded-xl text-center transition-colors cursor-pointer ${
            activeTab === 'sql' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t.admin_tab_sql}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* Tab 1: Cloud Categories (Supabase) */}
        {activeTab === 'cloud' && online && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                {t.admin_cloud_labels}
              </label>
              <div className="flex flex-wrap gap-2">
                {cloudCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCloudCatId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedCloudCatId === cat.id
                        ? 'bg-brand-primary/20 border-brand-primary text-brand-primary-light shadow-sm shadow-brand-primary/20'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <Card variant="glass" className="p-4 flex-1 flex flex-col min-h-[220px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-3 border-b border-white/5 pb-2">
                {lang === 'tr' ? 'Kelimeler' : 'Words'} ({cloudWords.length})
              </span>
              
              {loadingWords ? (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                  {lang === 'tr' ? 'Kelimeler yükleniyor...' : 'Loading words...'}
                </div>
              ) : cloudWords.length > 0 ? (
                <div className="flex-1 overflow-y-auto no-scrollbar max-h-[260px] grid grid-cols-2 gap-2 text-sm text-slate-300">
                  {cloudWords.map((word, idx) => (
                    <div key={idx} className="bg-white/5 px-3 py-2 rounded-xl flex items-center">
                      <span>• {word}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                  {lang === 'tr' ? 'Bu kategoride kelime bulunamadı.' : 'No words found in this category.'}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Tab 2: Custom Local Packs */}
        {activeTab === 'local' && (
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* Create Pack */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                {t.admin_local_create}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  placeholder={t.admin_local_placeholder}
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
            </div>

            {/* Custom Packs List Tabs */}
            {customPacks.length > 0 ? (
              <div className="space-y-4 flex-1 flex flex-col">
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
                          title="Delete Pack"
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
                        "{selectedLocalPack.name}" {t.admin_local_words_title}
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
                      <div className="flex-1 overflow-y-auto no-scrollbar max-h-[160px] grid grid-cols-2 gap-2 text-xs text-slate-300">
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
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                {lang === 'tr' ? 'Hiç özel paketiniz yok. Bir tane oluşturun!' : 'You have no custom packs. Create one!'}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: SQL Setup Instruction */}
        {activeTab === 'sql' && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="flex items-start gap-2.5 bg-white/5 border border-white/5 p-3.5 rounded-2xl select-none">
              <Info className="w-5 h-5 text-brand-primary-light flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.admin_sql_info}
              </p>
            </div>

            <div className="relative bg-black/40 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col font-mono text-[10px] text-slate-300 leading-normal max-h-[220px] overflow-y-auto no-scrollbar select-all">
              <button
                onClick={handleCopySQL}
                className="absolute top-2.5 right-2.5 p-2 bg-brand-surface rounded-xl border border-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="pr-6 whitespace-pre-wrap">
{`-- Create categories table
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    is_active boolean default true not null,
    created_at timestamp ...
);`}
              </pre>
            </div>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onClick={handleCopySQL}
              className="py-3 flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-brand-success" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t.admin_sql_copy}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
