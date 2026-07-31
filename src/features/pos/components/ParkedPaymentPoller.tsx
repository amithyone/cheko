import { useEffect } from "react";
import { usePaymentProvider } from "@/context/PaymentProviderContext";
import { useNotice } from "@/context/NoticeContext";
import { broadcastBridge } from "@/shared/broadcast/bridge";
import type { ParkedPayment } from "@/types";

const POLL_MS = 6000;

interface ParkedPaymentPollerProps {
  payments: ParkedPayment[];
  onComplete: (payment: ParkedPayment, method: string) => void;
}

export function ParkedPaymentPoller({ payments, onComplete }: ParkedPaymentPollerProps) {
  const { adapter } = usePaymentProvider();
  const notice = useNotice();

  useEffect(() => {
    if (payments.length === 0) return;

    let cancelled = false;

    const tick = async () => {
      for (const payment of payments) {
        if (cancelled) return;
        try {
          if (payment.method === "Bank Transfer" || payment.method === "Split") {
            const res = await adapter.verifyTransfer(payment.transferRef, payment.totalDue, {
              broadcastSessionId: payment.broadcastSessionId ?? undefined,
            });
            if (res.credited) {
              if (payment.broadcastSessionId) {
                await broadcastBridge.markSessionPaid(payment.broadcastSessionId);
              }
              notice.showToast(`${payment.label} — transfer confirmed`, "success");
              onComplete(payment, payment.method);
            } else if (res.partial) {
              notice.showToast(`${payment.label} — partial payment received`, "info");
            }
          } else if (payment.method === "NFC/Card") {
            const res = await adapter.chargeCard({
              terminalId: "TERMINAL_04",
              amount: payment.totalDue,
              reference: payment.nfcAuthRef,
            });
            if (res.approved) {
              if (payment.broadcastSessionId) {
                await broadcastBridge.markSessionPaid(payment.broadcastSessionId);
              }
              notice.showToast(`${payment.label} — card payment confirmed`, "success");
              onComplete(payment, payment.method);
            }
          }
        } catch {
          // keep polling
        }
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [payments, adapter, notice, onComplete]);

  return null;
}
