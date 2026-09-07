'use strict';

/**
 * Final Cut Pro XML exporter for DaVinci Resolve.
 *
 * Produces a timeline (sequence) whose spine contains one `title` clip per
 * subtitle cue. Resolve imports it with File > Import > Timeline > FCP XML…
 * and rebuilds the pista with the exact timings. The timecode base is encoded
 * in `tcStart`, so offsets stay relative to zero and land in sync on a
 * timeline that starts at the base.
 */

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rational(seconds, fps) {
  const ticks = Math.max(0, Math.round((Number(seconds) || 0) * fps));
  return `${ticks}/${fps}s`;
}

function projectNameFromPath(filePath) {
  const base = String(filePath || '').split(/[\\/]/).pop();
  const stem = base.replace(/\.[^.]+$/, '') || 'Subtítulos';
  return `Panto SRT · ${stem}`;
}

function buildFcpxml(clips, options = {}) {
  const fps = Math.min(120, Math.max(1, Number(options.fps) || 25));
  const timecodeBase = Number(options.timecodeBase) || 0;

  const cues = (Array.isArray(clips) ? clips : [])
    .filter((clip) => clip && clip.text && String(clip.text).trim())
    .map((clip, index) => {
      const start = Number(clip.start) || 0;
      const end = Number(clip.end) || 0;
      const duration = Math.max(0.1, end - start);
      const text = String(clip.text).trim().replace(/\n/g, '<br/>');
      return { duration, text, start };
    });

  const lastCue = cues[cues.length - 1];
  const sequenceDuration = lastCue ? lastCue.start + lastCue.duration : 0;
  const project = projectNameFromPath(options.sourcePath);
  const projectName = escapeXml(project);

  const spine = cues.map((cue, index) => {
    const title = `Subtítulo ${index + 1}`;
    return [
      `            <title name="${escapeXml(title)}" lane="1" offset="${rational(cue.start, fps)}" duration="${rational(cue.duration, fps)}">`,
      `              <text>`,
      `                <text-style-def id="sts-${index}"><text-style font-family="Helvetica Neue" font-size="42" alignment="center" fillColor="1 1 1 1"><stroke width="3" color="0 0 0 1"/></text-style></text-style-def>`,
      `                <text-style ref="sts-${index}">${escapeXml(cue.text)}</text-style>`,
      `              </text>`,
      `            </title>`
    ].join('\n');
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!DOCTYPE fcpxml SYSTEM "https://developer.apple.com/DTDs/fcpxml-1.9.dtd">`,
    `<fcpxml version="1.9">`,
    `  <resources>`,
    `    <format id="r1" name="FFVideoFormat1080p${fps}" frameDuration="${rational(1, fps)}" width="1920" height="1080"/>`,
    `  </resources>`,
    `  <library>`,
    `    <event name="Panto SRT">`,
    `      <project name="${projectName}">`,
    `        <sequence duration="${rational(sequenceDuration, fps)}" format="r1" tcStart="${rational(timecodeBase, fps)}" tcFormat="NDF">`,
    `          <spine>`,
    ...spine,
    `          </spine>`,
    `        </sequence>`,
    `      </project>`,
    `    </event>`,
    `  </library>`,
    `</fcpxml>`,
    ``
  ].join('\n');
}

module.exports = { buildFcpxml, escapeXml };