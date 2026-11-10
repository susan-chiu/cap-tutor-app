import AsyncStorage from '@react-native-async-storage/async-storage';
import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/** 音效與大廳音樂：預設開音效、音樂小聲；設定存在手機上 */
const SFX = {
  correct: require('@/assets/audio/sfx-correct.mp3'),
  wrong: require('@/assets/audio/sfx-wrong.mp3'),
  slash: require('@/assets/audio/sfx-slash.mp3'),
  hit: require('@/assets/audio/sfx-hit.mp3'),
  combo: require('@/assets/audio/sfx-combo.mp3'),
  eye: require('@/assets/audio/sfx-eye.mp3'),
  bossAppear: require('@/assets/audio/sfx-boss-appear.mp3'),
  bossDown: require('@/assets/audio/sfx-boss-down.mp3'),
  levelup: require('@/assets/audio/sfx-levelup.mp3'),
  chest: require('@/assets/audio/sfx-chest.mp3'),
  tap: require('@/assets/audio/sfx-tap.mp3'),
  star: require('@/assets/audio/sfx-star.mp3'),
} as const;
const BGM = require('@/assets/audio/bgm-hall.mp3');
export type Sfx = keyof typeof SFX;

const KEY = 'sound-prefs-v1';
let prefs = { sfx: true, bgm: true };
const listeners = new Set<() => void>();
const players: Partial<Record<Sfx, AudioPlayer>> = {};
let bgm: AudioPlayer | null = null;
let bgmWanted = false;
let ready = false;

/** 網頁版：瀏覽器擋自動播放時不要報錯 */
function start(p: AudioPlayer) {
  const media = Platform.OS === 'web' ? (p as unknown as { media?: HTMLAudioElement }).media : undefined;
  if (media) { media.play().catch(() => {}); return; }
  try { p.play(); } catch { /* 忽略 */ }
}

export async function initSound() {
  if (ready) return;
  ready = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) prefs = { ...prefs, ...JSON.parse(raw) };
  } catch { /* 用預設 */ }
  listeners.forEach((l) => l());
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  if (bgmWanted) startBgm();
}

export function play(name: Sfx, volume = 0.7) {
  if (!prefs.sfx) return;
  try {
    const p = players[name] ?? (players[name] = createAudioPlayer(SFX[name]));
    p.volume = volume;
    p.seekTo(0).catch(() => {});
    start(p);
  } catch { /* 沒有聲音也不影響練習 */ }
}

export function startBgm() {
  bgmWanted = true;
  if (!prefs.bgm || !ready) return;
  try {
    if (!bgm) { bgm = createAudioPlayer(BGM); bgm.loop = true; bgm.volume = 0.3; }
    start(bgm);
  } catch { /* 忽略 */ }
}

export function stopBgm() {
  bgmWanted = false;
  try { bgm?.pause(); } catch { /* 忽略 */ }
}

export function setSoundPrefs(next: Partial<typeof prefs>) {
  prefs = { ...prefs, ...next };
  AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => {});
  if (!prefs.bgm) { try { bgm?.pause(); } catch { /* 忽略 */ } }
  else if (bgmWanted) startBgm();
  listeners.forEach((l) => l());
}

export function useSoundPrefs() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => prefs);
}
