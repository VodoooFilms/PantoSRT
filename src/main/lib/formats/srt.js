'use strict';

/**
 * SubRip (.srt) exporter.
 *
 * Clips are `{ start, end, text }` in seconds. An offset (seconds) is added to
 * every cue so timelines that do not start at 00:00:00,000 line up correctly.
 */

function secondsToSrt(seconds) {
  const total = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(total / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const secs = Math.floor((total % 60000) / 1000);
  const millis = total % 1000;
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
}

function escapeLine(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

function buildSrt(clips, offset = 0) {
  const body = (Array.isArray(clips) ? clips : [])
    .filter((clip) => clip && clip.text && String(clip.text).trim())
    .map((clip, index) => {
      const start = (Number(clip.start) || 0) + (Number(offset) || 0);
      const end = (Number(clip.end) || 0) + (Number(offset) || 0);
      return `${index + 1}\n${secondsToSrt(start)} --> ${secondsToSrt(end)}\n${escapeLine(clip.text)}\n`;
    })
    .join('\n');
  return `${body.trimEnd()}\n`;
}

module.exports = { buildSrt, secondsToSrt };