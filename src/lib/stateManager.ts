import { GameState } from '../types/game';

const STORAGE_KEY = 'whoisspy_game_state';

// Safe check if we are in client browser
const isClient = () => typeof window !== 'undefined';

export function getStoredState(): GameState | null {
  if (!isClient()) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch (e) {
    console.error('Oyun durumu yuklenirken hata olustu:', e);
    return null;
  }
}

export function saveStoredState(state: GameState): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Oyun durumu kaydedilirken hata olustu:', e);
  }
}

export function clearStoredState(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Oyun durumu silinirken hata olustu:', e);
  }
}
