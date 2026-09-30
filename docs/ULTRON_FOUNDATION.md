# ULTRON Foundation

## Goal

Build a Windows-first, voice-first personal AI assistant from scratch that can reason, use tools, control the computer, access approved devices/services, remember user-approved information, and report the result of actions.

## Hardware target

Primary development target: Windows 11 Pro, Intel Core i5-8365U, 16 GB RAM, Intel UHD 620, no dedicated GPU.

Design principles:
- CPU-efficient by default.
- Keep heavy vision/reasoning models off the resident path unless requested.
- Prefer small local models for wake word, routing, and simple tasks.
- Allow optional cloud models for difficult reasoning.
- Keep camera, microphone, screen, communication, and device controls permission-gated.

## Runtime layers

1. Audio: wake word -> VAD -> STT -> conversation -> TTS.
2. Brain: intent detection, planning, tool selection, execution loop, verification.
3. Memory: short-term conversation, explicit long-term memories, people/preferences, task history.
4. Tools: Windows apps, files, browser, shell, screenshots, camera, notifications, timers, web search.
5. Integrations: calls/messages and smart-home/TV/device APIs only through explicit supported integrations and permissions.
6. UI: ULTRON HUD/orb, status, transcript, tool activity, permissions, emergency stop.

## Safety model

Actions are classified before execution:
- Read-only: may run automatically.
- Low-impact: may run after normal confirmation policy.
- External communication / purchases / destructive operations: explicit confirmation required.
- High-risk system operations: blocked unless deliberately enabled by the user.

Every tool invocation should be logged locally with intent, tool, parameters summary, result, and timestamp.

## Engineering rule

Open-source repositories may be inspected for architecture, compatibility, and reusable ideas. Code is not copied blindly. Every dependency must be checked for license, Windows compatibility, CPU/RAM cost, maintenance status, and security implications before adoption.

## Initial reference projects

- PersonalJarvis/PersonalJarvis: agentic voice + computer/app control architecture.
- aviarytech/jarvis (OpenDex): permission-gated computer use and pluggable voice stack.
- cachenetworks/Jarvis: lower-end local-first stack using small Ollama models, CPU Whisper, and optional vision.

These are references, not dependencies of ULTRON.
