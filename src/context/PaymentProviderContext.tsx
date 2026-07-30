import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  PaymentConfigSummary,
  PaymentProviderCapabilities,
  PaymentProviderCredentials,
  PaymentProviderId,
} from "@/types/payment-provider";
import { getCapabilities } from "@/shared/payments/capabilities";
import { resolveAdapter, type PaymentAdapter } from "@/shared/payments";
import { isElectronHardware } from "@/shared/hardware/bridge";
import { loadWebPaymentCredentials, saveWebPaymentCredentials } from "@/shared/utils/payment-storage";

interface PaymentProviderContextValue {
  summary: PaymentConfigSummary;
  credentials: PaymentProviderCredentials | null;
  capabilities: PaymentProviderCapabilities;
  adapter: PaymentAdapter;
  isLoading: boolean;
  refresh: () => Promise<void>;
  saveCredentials: (creds: PaymentProviderCredentials) => Promise<PaymentConfigSummary>;
}

const defaultSummary: PaymentConfigSummary = {
  configured: false,
  provider: "checkoutnow",
  testMode: true,
};

const PaymentProviderContext = createContext<PaymentProviderContextValue | null>(null);

export function PaymentProviderProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<PaymentConfigSummary>(defaultSummary);
  const [credentials, setCredentials] = useState<PaymentProviderCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isElectronHardware() && window.chekoHardware?.getPaymentConfig) {
        const [s, c] = await Promise.all([
          window.chekoHardware.getPaymentConfig(),
          window.chekoHardware.getPaymentCredentials?.() ?? null,
        ]);
        setSummary(s);
        setCredentials(c);
      } else {
        const c = loadWebPaymentCredentials();
        setCredentials(c);
        setSummary({
          configured: Boolean(c?.apiKey || c?.secretKey || c?.publicKey),
          provider: c?.provider ?? "checkoutnow",
          testMode: c?.testMode ?? true,
          terminalId: c?.terminalId,
          merchantId: c?.merchantId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveCredentials = useCallback(
    async (creds: PaymentProviderCredentials) => {
      if (isElectronHardware() && window.chekoHardware?.savePaymentConfig) {
        const s = await window.chekoHardware.savePaymentConfig(creds);
        setSummary(s);
        setCredentials(creds);
        return s;
      }
      saveWebPaymentCredentials(creds);
      const s: PaymentConfigSummary = {
        configured: Boolean(creds.apiKey || creds.secretKey || creds.publicKey),
        provider: creds.provider,
        testMode: creds.testMode ?? true,
        terminalId: creds.terminalId,
        merchantId: creds.merchantId,
      };
      setSummary(s);
      setCredentials(creds);
      return s;
    },
    []
  );

  const provider = summary.provider;
  const capabilities = getCapabilities(provider);
  const adapter = useMemo(
    () => resolveAdapter(provider, credentials),
    [provider, credentials]
  );

  const value: PaymentProviderContextValue = {
    summary,
    credentials,
    capabilities,
    adapter,
    isLoading,
    refresh,
    saveCredentials,
  };

  return (
    <PaymentProviderContext.Provider value={value}>{children}</PaymentProviderContext.Provider>
  );
}

export function usePaymentProvider(): PaymentProviderContextValue {
  const ctx = useContext(PaymentProviderContext);
  if (!ctx) {
    throw new Error("usePaymentProvider must be used within PaymentProviderProvider");
  }
  return ctx;
}

export function usePaymentCapabilities(): PaymentProviderCapabilities {
  return usePaymentProvider().capabilities;
}

export function providerSupportsMethod(
  capabilities: PaymentProviderCapabilities,
  method: "NFC/Card" | "Cash" | "Bank Transfer" | "Split"
): boolean {
  switch (method) {
    case "Cash":
      return true;
    case "NFC/Card":
      return capabilities.cardCharge;
    case "Bank Transfer":
      return capabilities.virtualAccount;
    case "Split":
      return capabilities.virtualAccount && capabilities.cardCharge;
    default:
      return true;
  }
}
