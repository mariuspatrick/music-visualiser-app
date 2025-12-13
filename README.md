# Music Visualiser UI - POC

A React-based music player with Web Audio API integration. Upload audio files and control playback with real-time volume adjustment.

## Features

- 🎵 Audio file upload and playback
- 🔊 Real-time volume control
- 🎹 Web Audio API integration
- ⚡ Built with React 19, TypeScript, and Vite
- 🔄 React Compiler enabled for optimized performance

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Web Audio API** - Audio processing
- **ESLint** - Code linting

## Getting Started

### Prerequisites

- Node.js (v22.19)
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Project Structure

```
src/
├── hooks/
│   └── useAudioPlayer.ts    # Custom hook for audio management
├── App.tsx                   # Main app component
├── MusicPlayer.tsx           # Music player UI component
└── main.tsx                  # App entry point
```

## Usage

1. Click "Initialize Audio" to start the Web Audio context
2. Use the file input to upload an audio file (MP3, WAV, etc.)
3. Adjust volume using the range slider

## Notes

- The React Compiler is enabled, which may impact build performance but optimizes runtime
- Web Audio API requires user interaction before context initialization (browser security policy)

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
