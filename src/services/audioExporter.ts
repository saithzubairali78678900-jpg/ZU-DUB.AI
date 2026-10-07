import { DubSegment } from '../types/dubbing';

// Format seconds into SRT timestamp: HH:MM:SS,mmm
export function formatSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds % 1) * 1000);

  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

// Format seconds into WebVTT timestamp: HH:MM:SS.mmm
export function formatVttTime(totalSeconds: number): string {
  return formatSrtTime(totalSeconds).replace(',', '.');
}

// Generate SubRip Subtitle (SRT) format in Devanagari Hindi
export function generateHindiSrt(segments: DubSegment[], mode: 'hindi' | 'romanized' | 'bilingual' = 'hindi'): string {
  return segments
    .sort((a, b) => a.start - b.end)
    .map((seg, index) => {
      let text = seg.hindiText;
      if (mode === 'romanized') {
        text = seg.romanizedHindi;
      } else if (mode === 'bilingual') {
        text = `${seg.hindiText}\n${seg.originalText}`;
      }
      return `${index + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${text}\n`;
    })
    .join('\n');
}

// Generate WebVTT format
export function generateHindiVtt(segments: DubSegment[], mode: 'hindi' | 'romanized' | 'bilingual' = 'hindi'): string {
  const body = segments
    .sort((a, b) => a.start - b.end)
    .map((seg, index) => {
      let text = seg.hindiText;
      if (mode === 'romanized') {
        text = seg.romanizedHindi;
      } else if (mode === 'bilingual') {
        text = `${seg.hindiText}\n${seg.originalText}`;
      }
      return `${index + 1}\n${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n${text}\n`;
    })
    .join('\n');
  return `WEBVTT - VaniSync AI Free Hindi Dubbing\n\n${body}`;
}

// Generate Dubbing Cue Sheet in CSV format
export function generateCueSheetCsv(segments: DubSegment[]): string {
  const header = ['Segment #', 'Start Time (s)', 'End Time (s)', 'Duration (s)', 'Speaker', 'Hindi Dialogue (Devanagari)', 'Romanized Hindi (Hinglish)', 'Original English', 'Voice ID', 'Lip-Sync Match'];
  const rows = segments.map((s, idx) => [
    idx + 1,
    s.start.toFixed(2),
    s.end.toFixed(2),
    s.duration.toFixed(2),
    `"${s.speaker.replace(/"/g, '""')}"`,
    `"${s.hindiText.replace(/"/g, '""')}"`,
    `"${s.romanizedHindi.replace(/"/g, '""')}"`,
    `"${s.originalText.replace(/"/g, '""')}"`,
    s.voiceId,
    s.syllableRating || 'matched',
  ]);

  return [header.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Helper to trigger browser file download
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Synthesize audio track into WAV buffer using Web Audio API OfflineAudioContext
export async function exportCombinedWavAudio(
  segments: DubSegment[],
  totalDuration: number
): Promise<Blob> {
  const sampleRate = 44100;
  const duration = Math.max(totalDuration, 5);
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate);

  // Decode each segment audio if available
  for (const seg of segments) {
    if (seg.audioUrl && seg.audioUrl.startsWith('data:audio/')) {
      try {
        const base64Data = seg.audioUrl.split(',')[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBuffer = await offlineCtx.decodeAudioData(bytes.buffer.slice(0));
        const sourceNode = offlineCtx.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(offlineCtx.destination);
        sourceNode.start(seg.start);
      } catch (e) {
        console.warn('Could not decode segment audio for export:', seg.id, e);
      }
    }
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWav(renderedBuffer);
}

// Convert AudioBuffer to WAV format Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);  // file length - 8
  setUint32(0x45564157); // "WAVE"

  // fmt sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16);         // 16 for PCM
  setUint16(1);          // Linear PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2);              // block align
  setUint16(16);                         // 16 bits per sample

  // data sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });
}
