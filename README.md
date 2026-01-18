# AI Coding Mentor Extension

## Troubleshooting: "Chrome AI is not available"

If you see an error saying **"Chrome AI is not available"**, follow these steps to enable the built-in AI model in Google Chrome:

1.  **Use Chrome Canary or Dev Channel**:
    - This feature is currently experimental. Ensure you are using Chrome version **127+** (Canary recommended).

2.  **Enable Flags**:
    - Open `chrome://flags` in a new tab.
    - Search for **"Prompt API for Gemini Nano"**.
    - Set it to **"Enabled"**.
    - Search for **"Optimization Guide On Device Model"**.
    - Set it to **"Enabled BypassPerfRequirement"**.

3.  **Download the Model**:
    - After enabling flags, relaunch Chrome.
    - Go to `chrome://components`.
    - Find **"Optimization Guide On Device Model"**.
    - Click **"Check for update"** to trigger the download.
    - Wait until it says "Up-to-date" or shows a version number.

4.  **Restart Chrome**:
    - A full restart is often required after the model downloads.

5.  **Start Extension**:
    - Install dependencies and build the app. 
    - Run: `npm run build`
    - Enable **Developer Mode** in your browser’s extensions page.
    - Click **Load unpacked** and select the `dist` folder.

## Development

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

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
