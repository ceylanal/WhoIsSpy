export type GamePhase = 'LOBBY' | 'REVEAL' | 'PLAY' | 'VOTE' | 'RESULT';

export interface Player {
  id: string;
  name: string;
  role: 'spy' | 'player';
  isSpy: boolean;
  secretWord: string; // "CASUS" or the actual secret word
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  spyCount: number;
  durationMinutes: number;
  timeRemaining: number; // in seconds
  timerActive: boolean;
  category: string; // category name (e.g. "Mekanlar" or "Rastgele")
  secretWord: string;
  currentRevealIndex: number; // Index in the players array for who is revealing
  isCardRevealed: boolean; // Has the current player clicked to see their card?
  votedPlayerId: string | null;
  spyGuessedWord: string | null;
  spyGuessCorrect: boolean | null; // null: not guessed yet, true: guessed correctly, false: guessed wrong
  winner: 'spies' | 'players' | null;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export interface Word {
  id: string;
  category_id: string;
  word: string;
}

export interface DbCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface DbWord {
  id: string;
  category_id: string;
  word: string;
  created_at?: string;
}
