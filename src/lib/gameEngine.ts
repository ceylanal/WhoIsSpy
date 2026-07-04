import { GameState, Player } from '../types/game';

// Helper to normalize Turkish strings for comparison
export function normalizeTurkish(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

// Compare two words using Turkish normalization
export function compareWords(word1: string, word2: string): boolean {
  return normalizeTurkish(word1) === normalizeTurkish(word2);
}

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Initialize a new game state
export function initializeGame(
  playerNames: string[],
  spyCount: number,
  durationMinutes: number,
  categoryName: string,
  words: string[]
): GameState {
  if (playerNames.length < 3 || playerNames.length > 12) {
    throw new Error('Oyuncu sayısı en az 3, en fazla 12 olabilir.');
  }
  if (spyCount < 1 || spyCount > playerNames.length - 2) {
    throw new Error('Casus sayısı geçersiz.');
  }
  if (words.length === 0) {
    throw new Error('Seçilen kategoride kelime bulunamadı.');
  }

  // Pick a random secret word
  const randomIndex = Math.floor(Math.random() * words.length);
  const secretWord = words[randomIndex];

  // Distribute roles
  // Create array of indices and shuffle
  const indices = playerNames.map((_, index) => index);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Select first spyCount indices as spies
  const spyIndices = new Set(indices.slice(0, spyCount));

  const players: Player[] = playerNames.map((name, index) => {
    const isSpy = spyIndices.has(index);
    return {
      id: generateId(),
      name: name.trim() || `Oyuncu ${index + 1}`,
      role: isSpy ? 'spy' : 'player',
      isSpy,
      secretWord: isSpy ? 'CASUS' : secretWord,
    };
  });

  return {
    phase: 'REVEAL',
    players,
    spyCount,
    durationMinutes,
    timeRemaining: durationMinutes * 60,
    timerActive: false,
    category: categoryName,
    secretWord,
    currentRevealIndex: 0,
    isCardRevealed: false,
    votedPlayerId: null,
    spyGuessedWord: null,
    spyGuessCorrect: null,
    winner: null,
  };
}

// Proceed in reveal phase
export function proceedReveal(state: GameState): GameState {
  const nextIndex = state.currentRevealIndex + 1;
  
  if (nextIndex >= state.players.length) {
    // All cards revealed, start the game
    return {
      ...state,
      phase: 'PLAY',
      currentRevealIndex: 0,
      isCardRevealed: false,
      timerActive: true,
    };
  }

  return {
    ...state,
    currentRevealIndex: nextIndex,
    isCardRevealed: false,
  };
}

// Reveal current card
export function revealCard(state: GameState): GameState {
  return {
    ...state,
    isCardRevealed: true,
  };
}

// Hide current card
export function hideCard(state: GameState): GameState {
  return {
    ...state,
    isCardRevealed: false,
  };
}

// Tick timer by 1 second
export function tickTimer(state: GameState): GameState {
  if (!state.timerActive) return state;

  const nextTime = state.timeRemaining - 1;
  if (nextTime <= 0) {
    return {
      ...state,
      timeRemaining: 0,
      timerActive: false,
      phase: 'VOTE',
    };
  }

  return {
    ...state,
    timeRemaining: nextTime,
  };
}

// Submit voting results
export function submitVote(state: GameState, votedPlayerId: string): GameState {
  const votedPlayer = state.players.find((p) => p.id === votedPlayerId);
  if (!votedPlayer) return state;

  if (!votedPlayer.isSpy) {
    // Innocent player voted out -> Spies win immediately
    return {
      ...state,
      votedPlayerId,
      winner: 'spies',
      phase: 'RESULT',
    };
  }

  // Spy voted out -> Spy gets a chance to guess the secret word
  return {
    ...state,
    votedPlayerId,
    phase: 'RESULT', // Go to result screen to let them guess or display status
    spyGuessCorrect: null,
  };
}

// Submit spy's guess for the secret word
export function submitSpyGuess(state: GameState, guess: string): GameState {
  const isCorrect = compareWords(guess, state.secretWord);

  return {
    ...state,
    spyGuessedWord: guess,
    spyGuessCorrect: isCorrect,
    winner: isCorrect ? 'spies' : 'players',
  };
}

// Manually override the spy's guess result (e.g. if spelling was slightly off but players accepted it)
export function overrideSpyGuess(state: GameState, isCorrect: boolean): GameState {
  return {
    ...state,
    spyGuessCorrect: isCorrect,
    winner: isCorrect ? 'spies' : 'players',
  };
}
