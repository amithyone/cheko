import React from "react";
import { NoticeProvider } from "@/context/NoticeContext";
import { InteractionModeProvider } from "@/context/InteractionModeContext";
import { PaymentProviderProvider } from "@/context/PaymentProviderContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <InteractionModeProvider>
      <NoticeProvider>
        <PaymentProviderProvider>{children}</PaymentProviderProvider>
      </NoticeProvider>
    </InteractionModeProvider>
  );
}
