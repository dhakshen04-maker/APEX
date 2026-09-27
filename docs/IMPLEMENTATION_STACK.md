# APEX Implementation Stack

## Verified foundation

APEX uses a desktop-first TypeScript/React frontend with Tauri 2 as the native desktop shell.

- Frontend: React + TypeScript
- Build tool: Vite
- Desktop shell: Tauri 2
- Native layer: Rust
- Package manager: npm
- Windows distribution target: NSIS installer initially

## Verified package versions

The initial scaffold pins these versions:

- React 19.3.0
- React DOM 19.3.0
- Vite 8.3.1
- @vitejs/plugin-react 6.1.1
- TypeScript 6.0.3
- @tauri-apps/cli 2.11.5
- @tauri-apps/api 2.11.1
- @tauri-apps/plugin-opener 2.5.5

These versions were checked against current package/documentation sources on 2026-09-27.

## Why this foundation

Tauri's official documentation supports React templates and Vite-based frontends. Tauri uses the operating system web renderer rather than bundling a separate browser runtime, which is appropriate for a resource-conscious Windows desktop application.

## Intentionally not selected yet

Do not add implementation dependencies for these areas until the corresponding provider/API is verified:

- authentication
- database
- spreadsheet provider
- messaging provider / WhatsApp
- AI provider
- file storage
- QR signing/encoding
- report generation

The domain model remains the source of truth for the logical entities while these implementation decisions are researched.

## Desktop shortcut

The production Windows installer must create an APEX Desktop shortcut as part of the installation flow. This is an installer requirement, not a development-time script.

## Scaffold status

This commit creates the application shell and a minimal dashboard only. It is not a complete APEX product and must not be described as such.
