# Panto SRT

Private, offline transcription: turn voice recordings into timed subtitles for
DaVinci Resolve. Audio never leaves your machine.

<p align="center">
  <img src="assets/icons/panto-srt.png" width="96" alt="Panto SRT">
</p>

Panto SRT transcribes audio (or the audio track of a video) locally using the
open-source [whisper.cpp](https://github.com/ggml-org/whisper.cpp) engine, then
regroups Whisper's word-level timestamps into clean subtitle clips and exports
them as **SRT** (drag straight into Resolve as a subtitle track) or **FCPXML**
(import as a title-generator timeline).

- 100% local and private — no accounts, no cloud, no audio uploads
- English and Spanish out of the box (`Auto` detects either)
- Clip timing from real word timestamps: no screenshots, no timeline peeking
- Default 25 fps + 00:00:00 timecode; regroup clips on the fly
- Minimalist Pantoraya-style UI with light/dark toggle

> ☕ Panto SRT is free and open source. If it saves you time, consider
> [inviting me a coffee on PayPal](https://paypal.me/antoniomartinez75)
> (`@antoniomartinez75`). It's optional — but deeply appreciated!

## Requisitos

- macOS 13.4+ (Apple Silicon) o Windows 10/11 x64
- ~2–6 GB de RAM libre según el modelo elegido
- Conexión a internet solo la primera vez (descarga del modelo Whisper)

## Desarrollo

```bash
npm install
npm run prepare:whisper   # compila el motor whisper.cpp (solo la primera vez)
npm start                 # lanza la app en modo desarrollo
```

Verificación y pruebas:

```bash
npm run check   # sintaxis de todos los módulos
npm test        # tests del motor de subtítulos (grouping, SRT, FCPXML)
```

## Modelos

El modelo se descarga bajo demanda a la carpeta de datos de la app la primera
vez que generas subtítulos. Tamaño recomendado:

| Modelo      | RAM/VRAM | Notas                         |
|-------------|----------|-------------------------------|
| `turbo`     | ~1.6 GB  | Por defecto, mejor equilibrio |
| `medium`    | ~1.5 GB  | Más exacto, más lento         |
| `small`     | ~466 MB  | Equipos modestos              |

## Generar subtítulos

1. Arrastra un audio o video (MP3, M4A, WAV, MP4, MOV…).
2. La transcripción arranca automáticamente con el modelo Turbo y detección
   automática de idioma. Se agrupan los clips con los límites por defecto
   (42 caracteres, 3.5 s, pausa mínima 0.2 s).
3. Revisa y corrige el texto en el editor; usa **Reagrupar** si ajustaste
   los tiempos manualmente.
4. **Exportar SRT** o **Exportar FCPXML**.

En Resolve: `File > Import > Subtitle…` (SRT) o `File > Import > Timeline > FCP XML…`.
Los clips siempre parten de 00:00:00,000; si tu timeline comienza en ese
punto se importan sincronizados directamente.

## Estructura

```
src/
  main/
    main.js            ventana + IPC
    lib/
      whisper.js       motor whisper.cpp (spawn, parseo, progreso)
      media.js         explorar archivos de audio/video
      grouping.js      word-timestamps → clips de subtítulos
      formats/
        srt.js         exportador SubRip
        fcpxml.js      exportador Final Cut Pro XML
  preload/
    preload.js         puente seguro (contextBridge)
  renderer/
    index.html         interfaz (dark minimalista)
    styles.css
    app.js
scripts/
  prepare-whisper.js   prepara motor + modelos
tests/                 node --test del motor de subtítulos
```

## Licencias

- Código: [MIT](./LICENSE)
- Motor: [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (MIT)
- Modelos Whisper: [OpenAI](https://github.com/openai/whisper) (MIT)
- Ver `THIRD_PARTY_NOTICES.md`