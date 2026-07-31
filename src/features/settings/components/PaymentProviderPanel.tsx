import { useEffect, useState } from "react";
import {
  CreditCard,
  Eye,
  EyeOff,
  Landmark,
  Radio,
  Shield,
  Wifi,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  PAYMENT_PROVIDERS,
  type PaymentProviderCredentials,
  type PaymentProviderId,
  type SignatureAlg,
} from "@/types/payment-provider";
import { usePaymentProvider } from "@/context/PaymentProviderContext";
import { getCapabilities } from "@/shared/payments/capabilities";
import { isElectronHardware } from "@/shared/hardware/bridge";
import { Button, Input } from "@/shared/ui";

const MANAGER_PIN = "MG-9941";

interface PaymentProviderPanelProps {
  onSaved?: (message: string) => void;
}

export function PaymentProviderPanel({ onSaved }: PaymentProviderPanelProps) {
  const { summary, credentials, saveCredentials, adapter, refresh } = usePaymentProvider();
  const [provider, setProvider] = useState<PaymentProviderId>(summary.provider);
  const [form, setForm] = useState<Partial<PaymentProviderCredentials>>({
    testMode: true,
  });
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message?: string } | null>(null);

  const meta = PAYMENT_PROVIDERS.find((p) => p.id === provider)!;
  const caps = getCapabilities(provider);

  useEffect(() => {
    setProvider(summary.provider);
    if (credentials) {
      setForm({ ...credentials, provider: credentials.provider });
    } else {
      setForm({ provider, testMode: true });
    }
  }, [summary.provider, credentials, provider]);

  const handleUnlock = () => {
    if (pin === MANAGER_PIN) {
      setUnlocked(true);
    } else {
      onSaved?.("Invalid manager PIN");
    }
  };

  const handleSave = async () => {
    if (!unlocked) {
      onSaved?.("Enter manager PIN first");
      return;
    }
    const creds: PaymentProviderCredentials = {
      provider,
      testMode: form.testMode ?? true,
      apiKey: form.apiKey,
      secretKey: form.secretKey,
      publicKey: form.publicKey,
      terminalId: form.terminalId,
      merchantId: form.merchantId,
      contractCode: form.contractCode,
      signingKey: form.signingKey,
      broadcastConnectivity:
        provider === "checkoutnow"
          ? (form.broadcastConnectivity ?? "online")
          : form.broadcastConnectivity,
      settlementAccountNumber: form.settlementAccountNumber,
      settlementBankCode: form.settlementBankCode,
      settlementAccountName: form.settlementAccountName,
      merchantBankName: form.merchantBankName,
      checkoutBroadcastApi:
        provider === "checkoutnow"
          ? (form.checkoutBroadcastApi?.trim() ||
            "https://check-outpay.com/api/v1/broadcast")
          : form.checkoutBroadcastApi,
      signatureAlg:
        provider === "checkoutnow"
          ? (form.signatureAlg ?? "ed25519")
          : form.signatureAlg,
      webhookSecret: form.webhookSecret,
    };
    if (provider === "checkoutnow") {
      const { validateCheckoutNowBroadcastCredentials } = await import(
        "@/shared/broadcast/credentials"
      );
      const check = validateCheckoutNowBroadcastCredentials(creds);
      if (!check.ok) {
        onSaved?.(check.errors[0] ?? "Invalid Pay at Shop credentials");
        return;
      }
    }
    await saveCredentials(creds);
    await refresh();
    onSaved?.(`Payment provider set to ${meta.label}`);
  };

  const handleTest = async () => {
    if (!unlocked) {
      setTestResult({ ok: false, message: "Unlock credentials before testing." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const creds: PaymentProviderCredentials = {
        provider,
        testMode: form.testMode ?? true,
        apiKey: form.apiKey,
        secretKey: form.secretKey,
        publicKey: form.publicKey,
        terminalId: form.terminalId,
        merchantId: form.merchantId,
        contractCode: form.contractCode,
        signingKey: form.signingKey,
        broadcastConnectivity:
          provider === "checkoutnow"
            ? (form.broadcastConnectivity ?? "online")
            : form.broadcastConnectivity,
        settlementAccountNumber: form.settlementAccountNumber,
        settlementBankCode: form.settlementBankCode,
        settlementAccountName: form.settlementAccountName,
        merchantBankName: form.merchantBankName,
        checkoutBroadcastApi:
          form.checkoutBroadcastApi?.trim() ||
          "https://check-outpay.com/api/v1/broadcast",
        signatureAlg:
          provider === "checkoutnow" ? "ed25519" : form.signatureAlg,
        webhookSecret: form.webhookSecret,
      };
      if (provider === "checkoutnow") {
        const { validateCheckoutNowBroadcastCredentials } = await import(
          "@/shared/broadcast/credentials"
        );
        const check = validateCheckoutNowBroadcastCredentials(creds);
        if (!check.ok) {
          setTestResult({ ok: false, message: check.errors[0] ?? "Invalid credentials" });
          return;
        }
      }
      await saveCredentials(creds);
      const { testCheckoutPayConnection } = await import("@/shared/broadcast/checkout-api");
      const result = await testCheckoutPayConnection(creds);
      setTestResult(result);
      await refresh();
    } catch (e) {
      setTestResult({ ok: false, message: e instanceof Error ? e.message : "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div>
        <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Payment Provider
        </h3>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Connect your gateway for virtual accounts, card payments, and transfer verification.
          {!isElectronHardware() && (
            <span className="text-amber-600 block mt-1">
              Web demo — keys stored in localStorage. Use the desktop app for secure storage.
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PAYMENT_PROVIDERS.map((p) => {
          const active = provider === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProvider(p.id);
                setForm((f) => ({ ...f, provider: p.id }));
              }}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                active
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{p.label}</p>
                {p.fullStack && (
                  <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                    Full
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-80 mt-1">{p.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase">
        {caps.virtualAccount && (
          <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
            <Landmark className="w-3 h-3" /> Account
          </span>
        )}
        {caps.cardCharge && (
          <span className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-lg">
            <CreditCard className="w-3 h-3" /> Card
          </span>
        )}
        {caps.transferVerify && (
          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            <Wifi className="w-3 h-3" /> Verify
          </span>
        )}
        {caps.broadcastPay && (
          <span className="flex items-center gap-1 px-2 py-1 bg-sky-50 text-sky-700 rounded-lg">
            <Radio className="w-3 h-3" /> Broadcast
          </span>
        )}
      </div>

      {!unlocked ? (
        <div className="border border-amber-100 bg-amber-50/50 rounded-xl p-4 flex flex-wrap items-end gap-3">
          <Input
            label="Manager PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={MANAGER_PIN}
            className="max-w-xs"
          />
          <Button type="button" size="sm" onClick={handleUnlock}>
            <Shield className="w-4 h-4" />
            Unlock credentials
          </Button>
        </div>
      ) : (
        <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-5 space-y-4">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
            {meta.label} credentials
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meta.fields.map((field) => (
              <div key={field.key} className="relative">
                <Input
                  label={field.label}
                  type={field.secret && !showSecrets[field.key] ? "password" : "text"}
                  value={String(form[field.key] ?? "")}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  autoComplete="off"
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowSecrets((s) => ({ ...s, [field.key]: !s[field.key] }))
                    }
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSecrets[field.key] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
            {provider === "checkoutnow" && (
              <div className="sm:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Pay at Shop mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["online", "Online (recommended)"],
                        ["offline", "Offline"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, broadcastConnectivity: value }))
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer ${
                          (form.broadcastConnectivity ?? "online") === value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-slate-200 text-slate-600"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                    <strong>Online:</strong> BLE sends terminal ID + amount only. CheckoutNow loads your
                    settlement account from CheckoutPay.
                    <br />
                    <strong>Offline:</strong> BLE also includes account saved below (no live API).
                  </p>
                </div>
                {(form.broadcastConnectivity ?? "online") === "offline" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <Input
                      label="Settlement account (10 digits)"
                      value={form.settlementAccountNumber ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, settlementAccountNumber: e.target.value }))
                      }
                      placeholder="1000004863"
                    />
                    <Input
                      label="NIP bank code"
                      value={form.settlementBankCode ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, settlementBankCode: e.target.value }))
                      }
                      placeholder="090175"
                    />
                    <Input
                      label="Bank name"
                      value={form.merchantBankName ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, merchantBankName: e.target.value }))
                      }
                      placeholder="RUBIES MFB"
                    />
                    <Input
                      label="Account name"
                      value={form.settlementAccountName ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, settlementAccountName: e.target.value }))
                      }
                      placeholder="MIDAS AGRO"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Signature algorithm
                  </label>
                  <select
                    value={form.signatureAlg ?? "ed25519"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        signatureAlg: e.target.value as SignatureAlg,
                      }))
                    }
                    className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <option value="ed25519">ed25519 — CheckoutPay Pay at Shop</option>
                    <option value="HMAC-SHA256">HMAC-SHA256 — legacy dev only</option>
                  </select>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    POS needs: <strong>Terminal ID</strong> + <strong>Ed25519 signing key</strong> from Pay at
                    shop dashboard. No bank name hash or account in BLE for online mode.
                  </p>
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 self-end pb-2">
              <input
                type="checkbox"
                checked={form.testMode ?? true}
                onChange={(e) => setForm((f) => ({ ...f, testMode: e.target.checked }))}
                className="rounded border-slate-300"
              />
              Test / sandbox mode
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void handleSave()}>
              Save provider
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={testing}
              onClick={() => void handleTest()}
            >
              {testing ? "Testing…" : "Test connection"}
            </Button>
          </div>
          {testResult && (
            <p
              className={`text-xs font-bold flex items-center gap-1.5 ${
                testResult.ok ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {testResult.message ?? (testResult.ok ? "Connected" : "Failed")}
            </p>
          )}
        </div>
      )}

      {summary.configured && (
        <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Active: <strong className="text-slate-600">{summary.provider}</strong>
          {summary.testMode && " (sandbox)"}
        </p>
      )}
    </div>
  );
}
