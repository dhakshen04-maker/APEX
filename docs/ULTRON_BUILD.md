# ULTRON build plan

ULTRON is being built as a modular desktop agent rather than a chatbot wrapper.

## Core loop

`input -> intent -> plan -> permission check -> tool -> verification -> response`

## Modules

- Voice: browser/WebView speech recognition and speech synthesis initially; dedicated local STT/TTS can replace this later.
- Orchestrator: classifies requests and routes them to explicit tools.
- Desktop bridge: Tauri commands provide a narrow, allowlisted Windows action surface.
- Memory: user-controlled local memory with list, update, delete, and clear operations.
- Vision: camera access and low-resolution snapshots; vision models are intentionally optional.
- Web: browser/API tools will be added behind explicit tool definitions.
- Communications: phone/SMS/messaging providers will be adapters with permission checks; no provider is assumed.
- Home/TV: Home Assistant is the preferred local integration boundary when available. Its REST API supports authenticated service calls and device integrations.

## Hardware target

Primary target is the user's Windows 11 laptop with Intel i5-8365U, 16 GB RAM and Intel UHD 620. Heavy continuous local inference is avoided. Components should have graceful CPU-only fallbacks.

## Safety model

Destructive actions, messages, calls, purchases, account changes, and actions affecting third parties require explicit confirmation until the permission policy is deliberately configured. Secrets never belong in the frontend bundle.

## External integration notes

Home Assistant exposes an authenticated REST API for service calls. Windows UI Automation is available through native Windows UI Automation and projects such as pywinauto, but automation should remain scoped to explicit tools rather than arbitrary shell execution.
