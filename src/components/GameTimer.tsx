import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { Button } from './ui/Button';
import { Language, translations } from '@/lib/translations';

interface GameTimerProps {
  timeRemaining: number;
  durationMinutes: number;
  timerActive: boolean;
  onToggleTimer: () => void;
  onSkip: () => void;
  lang?: Language;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  timeRemaining,
  durationMinutes,
  timerActive,
  onToggleTimer,
  onSkip,
  lang = 'tr',
}) => {
  const totalSeconds = durationMinutes * 60;
  const progressPercent = (timeRemaining / totalSeconds) * 100;
  const t = translations[lang];

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color theme based on time remaining
  const isUrgent = timeRemaining <= 15;
  const isWarning = timeRemaining > 15 && timeRemaining <= 45;
  
  let strokeColor = 'stroke-brand-accent';
  let textColor = 'text-brand-accent';
  let glowColor = 'shadow-brand-accent/20';

  if (isUrgent) {
    strokeColor = 'stroke-brand-danger';
    textColor = 'text-brand-danger animate-pulse';
    glowColor = 'shadow-brand-danger/40 animate-pulse-secondary-glow';
  } else if (isWarning) {
    strokeColor = 'stroke-brand-warning';
    textColor = 'text-brand-warning';
    glowColor = 'shadow-brand-warning/20';
  }

  // SVG Circle Calculations
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Circular Timer Display */}
      <div className={`relative w-64 h-64 flex items-center justify-center rounded-full glass bg-brand-surface/80 shadow-2xl ${glowColor}`}>
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className="stroke-white/5 fill-transparent"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            className={`${strokeColor} fill-transparent transition-all duration-1000 ease-linear`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Time Text */}
        <div className="text-center z-10 select-none">
          <span className={`text-5xl font-mono font-bold tracking-wider ${textColor}`}>
            {formatTime(timeRemaining)}
          </span>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {t.kalan_sure}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        <Button
          variant={timerActive ? 'outline' : 'accent'}
          size="md"
          onClick={onToggleTimer}
          className="w-40 flex items-center justify-center gap-2"
        >
          {timerActive ? (
            <>
              <Pause className="w-5 h-5" />
              <span>{t.durdur}</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>{t.baslat}</span>
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="md"
          onClick={onSkip}
          className="border border-white/5 hover:border-white/10"
          title={lang === 'tr' ? 'Süreyi Atla ve Oylamaya Geç' : 'Skip Timer and Go to Voting'}
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
export default GameTimer;
