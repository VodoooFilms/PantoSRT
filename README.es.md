<p align="center">
  <img src="assets/icons/panto-srt.png" width="110" alt="Panto SRT">
</p>

<h1 align="center">Panto SRT</h1>

<p align="center">
  <b>Subtítulos privados y offline a partir de tu voz</b><br>
  Transcribe audio y video → subtítulos limpios y sincronizados para DaVinci Resolve.
  <br>Sin nube. Sin cuentas. Tu audio nunca sale de tu máquina.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT"></a>
  <img src="https://img.shields.io/badge/macOS-13.4%2B-lightgrey.svg" alt="macOS 13.4+">
  <img src="https://img.shields.io/badge/Windows-10%2B-0078D6.svg" alt="Windows 10+">
  <img src="https://img.shields.io/badge/electron-43-blueviolet.svg" alt="Electron">
  <img src="https://img.shields.io/badge/language-es%20%2F%20en-brightgreen.svg" alt="Español / Inglés">
</p>

<p align="center">
  <a href="README.md">English</a>
</p>

---

## Por qué Panto SRT

Repasar audio y escribir subtítulos a mano es lento. Panto SRT ejecuta el motor
open-source [whisper.cpp](https://github.com/ggml-org/whisper.cpp) **en local**,
lee los timestamps reales a nivel de palabra y los reagrupa en clips de
subtítulos limpios, listos para DaVinci Resolve.

- **100 % local y privado** — sin cuentas, sin nube, sin subidas
- **Español e inglés** desde el primer día (detección automática)
- **Tiempos precisos** desde los timestamps reales de whisper
- **Clips limpios** — longitud de caracteres, duración máxima y pausa mínima se equilibran solas
- **Reagrupar al vuelo** tras corregir el texto
- **Exporta SRT** (arrástralo a una pista de subtítulos de Resolve) o **FCPXML**
  (impórtalo como timeline de títulos), 25 fps / timecode desde cero
- Interfaz mínima estilo Pantoraya con modo **claro / oscuro**

> ☕ Panto SRT es gratuito y open source. Si te ahorra tiempo, considera
> [invitarme un café por PayPal](https://paypal.me/antoniomartinez75)
> (`@antoniomartinez75`). Totalmente opcional — ¡pero muy apreciado!

---

## Empezar

```bash
# 1. Instala dependencias
npm install

# 2. Compila el motor whisper.cpp (solo la primera vez — autocontenido, ~0,1 s si ya existe)
npm run prepare:whisper

# 3. Ejecuta en modo desarrollo
npm start
```

Verifica y prueba:

```bash
npm run check   # sintaxis de todos los módulos
npm test        # tests del motor de subtítulos (grouping, SRT, FCPXML)
```

Requisitos: **macOS 13.4+ (Apple Silicon)** o **Windows 10/11 x64**,
~2–6 GB de RAM libre según el modelo, e internet solo la primera vez
(el modelo Whisper se descarga bajo demanda a la carpeta de datos de la app).

---

## Generar subtítulos

1. Arrastra un audio o video (MP3, M4A, WAV, MP4, MOV…).
2. La transcripción arranca automáticamente con el modelo **Turbo** y
   **detección automática de idioma**, agrupando clips con los límites por
   defecto (42 caracteres, 3,5 s máx, 0,2 s de pausa mínima).
3. Revisa y corrige el texto en el editor; usa **Reagrupar** si ajustaste los
   tiempos manualmente.
4. **Exporta SRT** o **Exporta FCPXML**.

En Resolve: `File > Import > Subtitle…` (SRT) o
`File > Import > Timeline > FCP XML…`. Los clips siempre parten de
`00:00:00,000`, por lo que se importan sincronizados sobre una timeline que
empieza en cero.

---

## Modelos

El modelo Whisper se descarga bajo demanda la primera vez que generas
subtítulos. Tamaños recomendados:

| Modelo   | RAM/VRAM | Notas                         |
|----------|----------|-------------------------------|
| `turbo`  | ~1,6 GB  | Por defecto, mejor equilibrio |
| `medium` | ~1,5 GB  | Más exacto, más lento         |
| `small`  | ~466 MB  | Equipos modestos              |

---

## Estructura del proyecto

```
src/
  main/
    main.js            ventana + IPC
    lib/
      whisper.js       motor whisper.cpp (spawn, parseo, progreso)
      media.js         inspección de archivos de audio/video
      grouping.js      timestamps por palabra → clips de subtítulos
      formats/
        srt.js         exportador SubRip
        fcpxml.js      exportador Final Cut Pro XML
  preload/
    preload.js         puente seguro (contextBridge)
  renderer/
    index.html         interfaz mínima
    styles.css
    app.js
scripts/
  prepare-whisper.js   compila motor + (opcional) modelos
tests/                 node --test del motor de subtítulos
```

---

## Licencias

- Código: [MIT](./LICENSE)
- Motor: [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (MIT)
- Modelos Whisper: [OpenAI](https://github.com/openai/whisper) (MIT)
- Ver [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)