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
  coin: require('@/assets/audio/sfx-coin.mp3'),
  buy: require('@/assets/audio/sfx-buy.mp3'),
  capture: require('@/assets/audio/sfx-capture.mp3'),
  evolve: require('@/assets/audio/sfx-evolve.mp3'),
  soup: require('@/assets/audio/sfx-soup.mp3'),
  unlock: require('@/assets/audio/sfx-unlock.mp3'),
  invade: require('@/assets/audio/sfx-invade.mp3'),
} as const;
const BGM = { hall: require('@/assets/audio/bgm-hall.mp3'), battle: require('@/assets/audio/bgm-battle.mp3') } as const;
export type Bgm = keyof typeof BGM;
export type Sfx = keyof typeof SFX;

const KEY = 'sound-prefs-v1';
let prefs = { sfx: true, bgm: true };
const listeners = new Set<() => void>();
const players: Partial<Record<Sfx, AudioPlayer>> = {};
const bgms: Partial<Record<Bgm, AudioPlayer>> = {};
let bgmTrack: Bgm = 'hall';
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

/** 背景音樂：hall 大廳、battle 世界地圖與戰鬥。換曲時會先停掉另一首 */
export function startBgm(track: Bgm = bgmTrack) {
  if (track !== bgmTrack) { try { bgms[bgmTrack]?.pause(); } catch { /* 忽略 */ } }
  bgmTrack = track;
  bgmWanted = true;
  if (!prefs.bgm || !ready) return;
  try {
    let p = bgms[track];
    if (!p) { p = bgms[track] = createAudioPlayer(BGM[track]); p.loop = true; p.volume = track === 'battle' ? 0.22 : 0.3; }
    start(p);
  } catch { /* 忽略 */ }
}

export function stopBgm() {
  bgmWanted = false;
  try { bgms[bgmTrack]?.pause(); } catch { /* 忽略 */ }
}

export function setSoundPrefs(next: Partial<typeof prefs>) {
  prefs = { ...prefs, ...next };
  AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => {});
  if (!prefs.bgm) { try { bgms[bgmTrack]?.pause(); } catch { /* 忽略 */ } }
  else if (bgmWanted) startBgm();
  listeners.forEach((l) => l());
}

export function useSoundPrefs() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => prefs);
}
