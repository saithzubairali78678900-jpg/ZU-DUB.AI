export type DubStyle =
  | 'colloquial_hinglish'
  | 'standard_hindi'
  | 'bollywood_dramatic'
  | 'tech_educational'
  | 'documentary';

export interface VoicePersona {
  id: string;
  name: string;
  hindiName: string;
  gender: 'female' | 'male';
  geminiVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon' | 'Aoede';
  tag: string;
  description: string;
  accent: string;
  sampleLine: string;
  sampleLineEnglish: string;
  pitch: number;
  rate: number;
}

export interface DubSegment {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  duration: number; // in seconds
  originalText: string;
  hindiText: string;
  romanizedHindi: string;
  speaker: string;
  voiceId: string;
  emotion?: string;
  syllableRating?: 'matched' | 'slightly_long' | 'slightly_short';
  lipSyncNotes?: string;
  audioUrl?: string; // base64 or blob URL
  isSynthesizing?: boolean;
}

export interface DubProject {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  defaultStyle: DubStyle;
  defaultVoiceId: string;
  segments: DubSegment[];
}

export type ActiveTab = 
  | 'studio' 
  | 'transcribe' 
  | 'livechat' 
  | 'music' 
  | 'image' 
  | 'voicelab' 
  | 'script' 
  | 'projects' 
  | 'pricing';

export type SubtitleMode = 'hindi' | 'romanized' | 'bilingual' | 'none';

export type AudioTrackMode = 'hindi_dub' | 'source_original' | 'ducked_dual';

export interface AudioMixerSettings {
  sourceVolume: number;    // 0 to 1
  hindiVolume: number;     // 0 to 1
  duckingAmount: number;   // 0 to 1 (e.g. 0.2 means source drops to 20% during speech)
  masterVolume: number;    // 0 to 1
  playbackSpeed: number;   // 0.8, 1.0, 1.25
  isSourceMuted: boolean;
  isHindiMuted: boolean;
}
