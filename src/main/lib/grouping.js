'use strict';

/**
 * Subtitle grouping engine.
 *
 * Turns word-level timestamps produced by Whisper into clean subtitle clips,
 * following standard subtitling rules:
 *   - a maximum number of characters per line,
 *   - a maximum duration per clip,
 *   - a minimum pause between words (a longer pause is a natural boundary),
 *   - prefer sentence boundaries when the clip is already "mature".
 *
 * Words are expected as `{ text, start, end }` with time in seconds.
 * Produces clips as `{ index, start, end, text }`.
 */

const SENTENCE_END = /[.!?…;]$/;

const DEFAULTS = {
  maxChars: 42,
  maxDuration: 3.5,
  minGap: 0.2,
  minSentenceBreak: 12
};

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Normalize raw words: drop empty tokens, attach standalone punctuation to the
 * previous word (Whisper sometimes emits ",", "." and "-" as tokens), and
 * repair degenerate timestamps.
 */
function normalizeWords(input) {
  const raw = Array.isArray(input) ? input : [];
  const words = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const trimmed = String(item.text || item.word || '').trim();
    if (!trimmed) continue;
    const isPunctuation = trimmed.length <= 3 && /^[\.,;:!?…\u00a0"'\-–-]+$/.test(trimmed);
    if (isPunctuation && words.length) {
      words[words.length - 1].text += trimmed;
      continue;
    }
    if (isPunctuation) continue;
    let text = sanitize(trimmed);
    let start = Number(item.start);
    let end = Number(item.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (end < start) [start, end] = [end, start];
    if (start < 0) { end -= start; start = 0; }
    words.push({ text, start, end });
  }

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (word.end <= word.start) {
      const prev = words[i - 1];
      const next = words[i + 1];
      word.start = prev ? Math.max(prev.end, word.start) : 0;
      word.end = next ? Math.min(next.start, word.start + 1) : word.start + Math.max(0.25, word.text.length / 12);
      if (word.end <= word.start) word.end = word.start + 0.25;
    }
  }
  return words;
}

/**
 * Build subtitle clips from a word stream.
 */
function buildClips(inputWords, options = {}) {
  const opts = { ...DEFAULTS, ...(options || {}) };
  const words = normalizeWords(inputWords);
  const clips = [];
  let bucket = [];

  const pushBucket = () => {
    if (!bucket.length) return;
    const start = bucket[0].start;
    const end = bucket[bucket.length - 1].end;
    const text = bucket.map((word) => word.text).join(' ').replace(/\s+([,.;:!?…])/g, '$1').trim();
    if (text) clips.push({ start, end, text });
    bucket = [];
  };

  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (!bucket.length) {
      bucket.push(word);
      continue;
    }
    const previous = bucket[bucket.length - 1];
    const prevEnd = previous.end;
    const gap = word.start - prevEnd;
    const clipStart = bucket[0].start;
    const clipText = bucket.map((w) => w.text).join(' ').trim();
    const candidateText = (clipText + ' ' + word.text).trim();

    const wouldOverflow = candidateText.length > opts.maxChars;
    const wouldOverrun = word.end - clipStart > opts.maxDuration;
    const mature = word.end - clipStart >= 0.5;
    const hasClearPause = gap >= opts.minGap && mature;
    const sentenceEnded = SENTENCE_END.test(sanitize(previous.text));
    const matureSentence = sentenceEnded && clipText.length >= opts.minSentenceBreak;

    if (wouldOverflow || wouldOverrun || hasClearPause || matureSentence) pushBucket();
    bucket.push(word);
  }
  pushBucket();

  clips.forEach((clip, index) => { clip.index = index + 1; });
  return clips;
}

module.exports = { buildClips, normalizeWords, sanitize, DEFAULTS };