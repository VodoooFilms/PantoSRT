'use strict';

/**
 * Media file helpers: recognize supported audio/video and best-effort duration
 * probing via a system FFmpeg (optional — Panto SRT does not depend on it).
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.opus', '.wma', '.aiff', '.aif', '.caf']);
const VIDEO_EXTENSIONS = new Set(['.mov', '.mp4', '.m4v', '.avi', '.mkv', '.webm', '.mpg', '.mpeg', '.m2ts', '.ts']);

function mediaTypeForFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  return null;
}

function isSupported(filePath) {
  return typeof filePath === 'string' && mediaTypeForFile(filePath) !== null;
}

function parseTimestamp(value) {
  const match = value.match(/(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function findFfmpeg() {
  if (process.platform === 'win32') return 'ffmpeg.exe';
  const candidates = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg'];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function probeDuration(filePath) {
  const ffmpeg = findFfmpeg();
  if (!ffmpeg) return Promise.resolve(0);
  return new Promise((resolve) => {
    let stderr = '';
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      const match = stderr.match(/Duration:\s*(\d+:\d+:\d+(?:\.\d+)?)/);
      resolve(match ? parseTimestamp(match[1]) : 0);
    };
    const child = spawn(ffmpeg, ['-hide_banner', '-i', filePath], { stdio: ['ignore', 'ignore', 'pipe'] });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => { stderr = (stderr + chunk).slice(-16000); });
    child.on('error', finish);
    child.on('close', finish);
  });
}

async function fileDetails(filePath) {
  const stats = await fs.promises.stat(filePath);
  const [duration] = await Promise.all([probeDuration(filePath)]);
  return {
    path: filePath,
    name: path.basename(filePath),
    size: stats.size,
    mediaType: mediaTypeForFile(filePath),
    duration
  };
}

module.exports = { fileDetails, isSupported, mediaTypeForFile, AUDIO_EXTENSIONS, VIDEO_EXTENSIONS };