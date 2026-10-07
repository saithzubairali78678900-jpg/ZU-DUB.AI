import { HINDI_VOICES } from '../data/sampleProjects';
import { synthesizeHindiSpeech } from './api';

// Audio cache to avoid re-synthesizing unchanged text
const audioCache = new Map<string, string>(); // key -> objectUrl or dataUrl
let currentPlayingAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export async function getOrSynthesizeSegmentAudio(
  text: string,
  voiceId: string,
  styleHint?: string
): Promise<{ audioUrl: string; source: 'gemini' | 'browser' }> {
  const cacheKey = `${voiceId}_${text.trim()}`;
  if (audioCache.has(cacheKey)) {
    return { audioUrl: audioCache.get(cacheKey)!, source: 'gemini' };
  }

  const voice = HINDI_VOICES.find(v => v.id === voiceId) || HINDI_VOICES[0];

  try {
    // 1. Attempt Gemini 3.8 Flash Lite TTS via our backend endpoint
    const response = await synthesizeHindiSpeech(
      text,
      voice.geminiVoice,
      styleHint || `${voice.tag} in authentic Hindi`
    );

    if (response && response.audioBase64) {
      const audioUrl = `data:audio/wav;base64,${response.audioBase64}`;
      audioCache.set(cacheKey, audioUrl);
      return { audioUrl, source: 'gemini' };
    }
  } catch (error) {
    console.warn('[VaniSync] Gemini TTS unavailable, using browser speech engine fallback:', error);
  }

  // 2. Return fallback flag indicating browser speech
  return { audioUrl: '', source: 'browser' };
}

export function playAudioOrSpeak(
  text: string,
  voiceId: string,
  cachedAudioUrl?: string,
  onEnd?: () => void
): () => void {
  stopCurrentPlayback();

  const voice = HINDI_VOICES.find(v => v.id === voiceId) || HINDI_VOICES[0];

  if (cachedAudioUrl && cachedAudioUrl.startsWith('data:audio/')) {
    const audio = new Audio(cachedAudioUrl);
    currentPlayingAudio = audio;
    audio.playbackRate = voice.rate || 1.0;

    audio.onended = () => {
      currentPlayingAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      currentPlayingAudio = null;
      // Fallback to browser speech if audio element fails
      speakWithBrowser(text, voice, onEnd);
    };

    audio.play().catch(err => {
      console.warn('Audio play prevented or failed:', err);
      speakWithBrowser(text, voice, onEnd);
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      currentPlayingAudio = null;
    };
  } else {
    return speakWithBrowser(text, voice, onEnd);
  }
}

function speakWithBrowser(
  text: string,
  voice: (typeof HINDI_VOICES)[0],
  onEnd?: () => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return () => {};
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Find best available Hindi or Indian voice
  const availableVoices = window.speechSynthesis.getVoices();
  const hindiVoice =
    availableVoices.find(v => v.lang.toLowerCase().startsWith('hi') || v.lang.includes('IN')) ||
    availableVoices.find(v => v.name.toLowerCase().includes('hindi')) ||
    availableVoices[0];

  if (hindiVoice) {
    utterance.voice = hindiVoice;
    utterance.lang = hindiVoice.lang || 'hi-IN';
  } else {
    utterance.lang = 'hi-IN';
  }

  utterance.pitch = voice.pitch;
  utterance.rate = voice.rate;

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  };
}

export function stopCurrentPlayback() {
  if (currentPlayingAudio) {
    currentPlayingAudio.pause();
    currentPlayingAudio.currentTime = 0;
    currentPlayingAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}
