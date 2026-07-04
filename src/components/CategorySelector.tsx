import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fallbackCategoriesTr, fallbackCategoriesEn } from '@/data/fallbackWords';
import { MapPin, Briefcase, PawPrint, Utensils, Box, Shuffle, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Card } from './ui/Card';
import { Language, translations } from '@/lib/translations';

interface CategorySelectorProps {
  selectedCategoryName: string;
  onSelectCategory: (name: string, words: string[]) => void;
}

interface CategoryOption {
  name: string;
  wordCount: number;
  words: string[];
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryName,
  onSelectCategory,
}) => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDb, setIsDb] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('tr');

  // Load language preference
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

  // Reload categories when language or connection changes
  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      
      // 1. Try Supabase first
      if (supabase) {
        try {
          const { data: catData, error: catError } = await supabase
            .from('categories')
            .select('id, name')
            .eq('is_active', true);

          if (!catError && catData && catData.length > 0) {
            // Fetch words
            const { data: wordsData, error: wordsError } = await supabase
              .from('words')
              .select('word, category_id');

            if (!wordsError && wordsData) {
              const options: CategoryOption[] = catData.map((cat) => {
                const catWords = wordsData
                  .filter((w) => w.category_id === cat.id)
                  .map((w) => w.word);
                return {
                  name: cat.name,
                  wordCount: catWords.length,
                  words: catWords,
                };
              });

              setCategories(options);
              setIsDb(true);
              
              // Set default
              const allWords = wordsData.map((w) => w.word);
              onSelectCategory(lang === 'tr' ? 'Karışık' : 'Mixed', allWords);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Supabase fetch failed, using fallback data.', e);
        }
      }

      // 2. Fallback to Local Data (Filtered by language)
      const currentFallback = lang === 'tr' ? fallbackCategoriesTr : fallbackCategoriesEn;
      const fallbackOptions: CategoryOption[] = currentFallback.map((cat) => ({
        name: cat.name,
        wordCount: cat.words.length,
        words: cat.words,
      }));
      
      setCategories(fallbackOptions);
      setIsDb(false);
      
      // Select first category default
      const defaultName = lang === 'tr' ? 'Karışık' : 'Mixed';
      const allFallbackWords = fallbackOptions.flatMap((c) => c.words);
      onSelectCategory(defaultName, allFallbackWords);
      
      setLoading(false);
    }

    loadCategories();
  }, [lang]);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Mekanlar':
      case 'Locations':
        return <MapPin className="w-6 h-6 text-brand-primary" />;
      case 'Meslekler':
      case 'Occupations':
        return <Briefcase className="w-6 h-6 text-brand-secondary" />;
      case 'Hayvanlar':
      case 'Animals':
        return <PawPrint className="w-6 h-6 text-brand-accent" />;
      case 'Yemekler':
      case 'Food':
        return <Utensils className="w-6 h-6 text-emerald-400" />;
      case 'Eşyalar':
      case 'Objects':
        return <Box className="w-6 h-6 text-amber-400" />;
      case 'Popüler Kültür':
      case 'Pop Culture':
        return <Sparkles className="w-6 h-6 text-fuchsia-400" fill="currentColor" />;
      case 'Tarihi Kişiler':
      case 'Historical Figures':
        return <BookOpen className="w-6 h-6 text-orange-400" />;
      default:
        return <Shuffle className="w-6 h-6 text-indigo-400" />;
    }
  };

  const handleSelect = (name: string, words: string[]) => {
    onSelectCategory(name, words);
  };

  const handleSelectMixed = () => {
    const allWords = categories.flatMap((c) => c.words);
    onSelectCategory(lang === 'tr' ? 'Karışık' : 'Mixed', allWords);
  };

  const t = translations[lang];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary mb-3" />
        <span>{t.loading}</span>
      </div>
    );
  }

  const mixedWordCount = categories.reduce((sum, c) => sum + c.wordCount, 0);
  const mixedLabel = lang === 'tr' ? 'Karışık' : 'Mixed';
  const isMixedSelected = selectedCategoryName === 'Karışık' || selectedCategoryName === 'Mixed';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>{t.category_selection}</span>
        <span>{isDb ? t.online_db : t.offline_db}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Karışık Category Card */}
        <Card
          variant={isMixedSelected ? 'glow' : 'glass'}
          onClick={handleSelectMixed}
          className={`cursor-pointer border-2 ${
            isMixedSelected
              ? 'border-brand-primary bg-brand-surface-light shadow-brand-primary/10'
              : 'border-white/5 hover:border-white/10'
          } p-4 flex flex-col items-center justify-center text-center`}
        >
          <div className="p-3 bg-white/5 rounded-2xl mb-2">
            <Shuffle className="w-6 h-6 text-brand-primary-light" />
          </div>
          <span className="font-bold text-sm">{mixedLabel}</span>
          <span className="text-[10px] text-slate-400 mt-1">{mixedWordCount} {t.words_suffix}</span>
        </Card>

        {/* Individual Category Cards */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryName === cat.name;
          return (
            <Card
              key={cat.name}
              variant={isSelected ? 'glow' : 'glass'}
              onClick={() => handleSelect(cat.name, cat.words)}
              className={`cursor-pointer border-2 ${
                isSelected
                  ? 'border-brand-primary bg-brand-surface-light shadow-brand-primary/10'
                  : 'border-white/5 hover:border-white/10'
              } p-4 flex flex-col items-center justify-center text-center`}
            >
              <div className="p-3 bg-white/5 rounded-2xl mb-2">
                {getIcon(cat.name)}
              </div>
              <span className="font-bold text-sm">{cat.name}</span>
              <span className="text-[10px] text-slate-400 mt-1">{cat.wordCount} {t.words_suffix}</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default CategorySelector;
