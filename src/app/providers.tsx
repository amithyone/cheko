import React from "react";
import { NoticeProvider } from "@/context/NoticeContext";
import { InteractionModeProvider } from "@/context/InteractionModeContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <InteractionModeProvider>
      <NoticeProvider>{children}</NoticeProvider>
    </InteractionModeProvider>
  );
}
