/// <reference types="vite/client" />

import type { ChekoHardwareBridge } from "@/shared/hardware/types";

declare global {
  interface Window {
    chekoHardware?: ChekoHardwareBridge;
  }
}

export {};
