import { useCallback, useState } from "react";
import type { ParkedPayment, ParkedPaymentSnapshot } from "@/types";

export function useParkedPayments() {
  const [parkedPayments, setParkedPayments] = useState<ParkedPayment[]>([]);
  const [resumePaymentId, setResumePaymentId] = useState<string | null>(null);

  const parkPayment = useCallback((snapshot: ParkedPaymentSnapshot) => {
    const entry: ParkedPayment = {
      ...snapshot,
      id: `pay-parked-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "awaiting_webhook",
    };
    setParkedPayments((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const resumePayment = useCallback((payment: ParkedPayment) => {
    setResumePaymentId(payment.id);
    return payment;
  }, []);

  const takeResumeById = useCallback((id: string | null): ParkedPayment | null => {
    if (!id) return null;
    let taken: ParkedPayment | null = null;
    setParkedPayments((prev) => {
      const match = prev.find((p) => p.id === id);
      taken = match ?? null;
      return prev.filter((p) => p.id !== id);
    });
    setResumePaymentId(null);
    return taken;
  }, []);

  const dismissParkedPayment = useCallback((id: string) => {
    setParkedPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const completeParkedPayment = useCallback((id: string) => {
    setParkedPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    parkedPayments,
    resumePaymentId,
    parkPayment,
    resumePayment,
    takeResumeById,
    dismissParkedPayment,
    completeParkedPayment,
  };
}
