import { invoke } from "@tauri-apps/api/core";

export type UltronActionResult = string;

export const ultron = {
  health: () => invoke<string>("health_check"),
  open: (target: string) => invoke<UltronActionResult>("ultron_open", { target }),
  openUrl: (url: string) => invoke<UltronActionResult>("ultron_open_url", { url }),
};
