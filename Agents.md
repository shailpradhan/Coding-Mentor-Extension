# Project Instructions

## Project overview

AI Code Mentor is a Manifest V3 Chrome extension built with React, TypeScript, and Vite. Its popup provides a coding-mentor chat, reads LeetCode problem context from matching pages, and uses Chrome's built-in language model where available.

## Project structure

- `src/background.ts` — extension service worker, Chrome AI session, and runtime message handling.
- `src/content_scripts/` — LeetCode page integration and page-data helpers.
- `src/services/leetcode.ts` — LeetCode GraphQL request and problem-slug parsing.
- `src/components/` — popup layout, chat, saved chats, and shared UI.
- `src/routes/` — popup routes.
- `src/types/types.ts` — shared data and extension-message types.
- `manifest.json` and `vite.config.ts` — extension configuration and build integration.

## Development and validation

- Install dependencies with `npm ci`.
- Start the Vite development server with `npm run dev`.
- Run lint checks with `npm run lint`.
- Type-check the project with `npx tsc -b`.
- Build the extension with `npm run build`; load the generated `dist` directory as an unpacked extension in Chrome.

There is currently no test script in `package.json`. Run the relevant lint, type-check, and build commands after changes.

## Implementation guidance

- Follow the existing TypeScript and React patterns. Keep types strict; update shared message and data definitions in `src/types/types.ts` when changing the extension message contract.
- Keep Chrome runtime, storage, and extension-window behavior consistent across the service worker, content script, and popup. Use the existing `Message` constants rather than introducing duplicate message strings.
- Preserve the manifest's least-required permissions and LeetCode URL scope when changing extension capabilities.
- Treat Chrome's built-in AI API as optional and browser-dependent. Preserve clear handling for unavailable models and failed requests.
- Keep LeetCode fetching and URL parsing in `src/services/leetcode.ts`; do not move page-specific scraping or extension messaging into UI components.
- Use the existing Material UI theme and component patterns for popup UI changes.
- Do not commit credentials or other secrets. Keep environment-specific configuration out of source control.
