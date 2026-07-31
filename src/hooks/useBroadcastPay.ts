import { useCallback, useEffect, useRef, useState } from "react";

import { broadcastBridge } from "@/shared/broadcast/bridge";
import { notifyBroadcastPresenceNudge } from "@/shared/broadcast/checkout-api";
import { validateCheckoutNowBroadcastCredentials } from "@/shared/broadcast/credentials";
import { usePaymentProvider } from "@/context/PaymentProviderContext";
import { roundMoney } from "@/shared/utils/money";

import type { BroadcastMode, BroadcastStatus } from "@/shared/broadcast/types";



interface UseBroadcastPayOptions {

  enabled: boolean;

  mode: BroadcastMode;

  amountNgn: number;

  itemCount: number;

}



/** Refresh BLE packet timestamp while keeping the same session_uuid_v4 (open session). */

const SESSION_REFRESH_MS = 90_000;



export function useBroadcastPay({ enabled, mode, amountNgn, itemCount }: UseBroadcastPayOptions) {

  const { credentials, summary } = usePaymentProvider();
  const [status, setStatus] = useState<BroadcastStatus>("idle");

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [transport, setTransport] = useState<string>("unknown");

  const [activeMode, setActiveMode] = useState<BroadcastMode | null>(null);

  const [error, setError] = useState<string | null>(null);

  const activeRef = useRef(false);

  const amountsRef = useRef({ amountNgn, itemCount, mode, sessionId: null as string | null });
  const sessionIdRef = useRef<string | null>(null);

  amountsRef.current = { amountNgn, itemCount, mode, sessionId: sessionIdRef.current };

  const maybePresencePush = useCallback(async (m: BroadcastMode) => {
    if (m !== "public" || summary.provider !== "checkoutnow") {
      return;
    }
    const terminalId = credentials?.terminalId?.trim();
    const apiKey = credentials?.apiKey?.trim();
    if (!terminalId || !apiKey) {
      return;
    }
    await notifyBroadcastPresenceNudge(terminalId, apiKey, "presence").catch(() => {});
  }, [credentials?.apiKey, credentials?.terminalId, summary.provider]);



  const runStart = useCallback(async () => {

    const { amountNgn: amt, itemCount: items, mode: m } = amountsRef.current;

    if (m === "checkout" && (amt <= 0 || items <= 0)) return;

    if (summary.provider === "checkoutnow") {
      const check = validateCheckoutNowBroadcastCredentials(credentials);
      if (!check.ok) {
        setError(check.errors[0] ?? "Configure Pay at Shop in Settings → Payment Provider");
        setStatus("error");
        return;
      }
    }

    setStatus("starting");

    setError(null);



    const result = await broadcastBridge.start({

      mode: m,

      amountNgn: m === "public" ? 0 : roundMoney(amt),

      itemCount: m === "public" ? 0 : items,

    });



    if (result.ok && result.sessionId) {

      activeRef.current = true;

      sessionIdRef.current = result.sessionId;
      setSessionId(result.sessionId);

      setTransport(result.transport ?? "unknown");

      setActiveMode(result.mode ?? m);

      setStatus("broadcasting");

      void maybePresencePush(m);
    } else {

      setError(result.error ?? "Broadcast failed to start");

      setStatus("error");

    }

  }, [credentials, summary.provider, maybePresencePush]);



  const stop = useCallback(async () => {

    if (!activeRef.current && status === "idle") return;

    await broadcastBridge.stop();

    activeRef.current = false;

    sessionIdRef.current = null;
    setStatus("stopped");

    setSessionId(null);

    setActiveMode(null);

  }, [status]);



  const markPaid = useCallback(async () => {
    if (!sessionId) return;
    await broadcastBridge.markSessionPaid(sessionId);
  }, [sessionId]);

  const handOff = useCallback(async () => {
    if (sessionId) {
      await broadcastBridge.parkSession(sessionId);
    }
    activeRef.current = false;
    sessionIdRef.current = null;
    setStatus("stopped");
    setSessionId(null);
    setActiveMode(null);
  }, [sessionId]);

  useEffect(() => {

    if (!enabled) {

      void broadcastBridge.stop();

      activeRef.current = false;
      sessionIdRef.current = null;

      setStatus("idle");

      setSessionId(null);

      setActiveMode(null);

      return;

    }



    void runStart();

    return () => {

      void broadcastBridge.stop();

      activeRef.current = false;

    };

  }, [enabled, mode, amountNgn, itemCount, runStart]);



  useEffect(() => {

    if (status !== "broadcasting" || !enabled) return;

    const tick = () => {
      const { amountNgn: amt, itemCount: items, mode: m, sessionId: sid } = amountsRef.current;
      void broadcastBridge.refresh({
        mode: m,
        amountNgn: m === "public" ? 0 : roundMoney(amt),
        itemCount: m === "public" ? 0 : items,
        sessionId: sid,
      });
      if (m === "public") {
        void maybePresencePush("public");
      }
    };

    const id = window.setInterval(tick, SESSION_REFRESH_MS);

    return () => window.clearInterval(id);

  }, [status, enabled, maybePresencePush]);



  return { status, sessionId, transport, activeMode, error, start: runStart, stop, handOff, markPaid };
}

