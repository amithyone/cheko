import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useMemo,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  X,
} from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";

export type NoticeVariant = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: string;
  message: string;
  variant: NoticeVariant;
}

interface AlertState {
  title: string;
  message: string;
  variant: NoticeVariant;
  buttonLabel: string;
}

interface ConfirmState {
  title: string;
  message: string;
  variant: "danger" | "default";
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

interface NoticeContextValue {
  showToast: (message: string, variant?: NoticeVariant) => void;
  showSuccess: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
  }) => void;
}

const NoticeContext = createContext<NoticeContextValue | null>(null);

const variantMeta: Record<
  NoticeVariant,
  { icon: typeof CheckCircle2; toastBg: string; modalRing: string; badge: string }
> = {
  success: {
    icon: CheckCircle2,
    toastBg: "bg-emerald-600 border-emerald-500",
    modalRing: "bg-emerald-100 ring-emerald-50",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  info: {
    icon: Info,
    toastBg: "bg-indigo-600 border-indigo-500",
    modalRing: "bg-indigo-100 ring-indigo-50",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  warning: {
    icon: AlertTriangle,
    toastBg: "bg-amber-500 border-amber-400",
    modalRing: "bg-amber-100 ring-amber-50",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
  },
  error: {
    icon: AlertTriangle,
    toastBg: "bg-rose-600 border-rose-500",
    modalRing: "bg-rose-100 ring-rose-50",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

function defaultTitle(variant: NoticeVariant): string {
  switch (variant) {
    case "success":
      return "Success";
    case "warning":
      return "Attention";
    case "error":
      return "Something went wrong";
    default:
      return "Notice";
  }
}

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const showToast = useCallback((message: string, variant: NoticeVariant = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const showModal = useCallback(
    (message: string, variant: NoticeVariant, title?: string) => {
      setAlert({
        title: title ?? defaultTitle(variant),
        message,
        variant,
        buttonLabel: "OK",
      });
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      if (!title && message.length < 100) {
        showToast(message, "success");
      } else {
        showModal(message, "success", title);
      }
    },
    [showModal, showToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      if (!title && message.length < 100) {
        showToast(message, "info");
      } else {
        showModal(message, "info", title);
      }
    },
    [showModal, showToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showModal(message, "warning", title ?? "Attention");
    },
    [showModal]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showModal(message, "error", title ?? "Action required");
    },
    [showModal]
  );

  const showConfirm = useCallback(
    (options: {
      title: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "danger" | "default";
      onConfirm: () => void;
    }) => {
      setConfirm({
        title: options.title,
        message: options.message,
        variant: options.variant ?? "default",
        confirmLabel: options.confirmLabel ?? "Confirm",
        cancelLabel: options.cancelLabel ?? "Cancel",
        onConfirm: options.onConfirm,
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      showToast,
      showSuccess,
      showInfo,
      showWarning,
      showError,
      showConfirm,
    }),
    [showToast, showSuccess, showInfo, showWarning, showError, showConfirm]
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NoticeContext.Provider value={value}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        {toasts.map((t) => {
          const meta = variantMeta[t.variant];
          const Icon = meta.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-white text-xs font-bold font-sans tracking-wide animate-in slide-in-from-top-2 ${meta.toastBg}`}
              role="status"
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1 leading-relaxed">{t.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="p-0.5 rounded hover:bg-white/20 cursor-pointer shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Alert modal */}
      {alert && (
        <Modal
          open
          onClose={() => setAlert(null)}
          zIndex={190}
          panelClassName="max-w-md p-8 text-center"
        >
            {(() => {
              const meta = variantMeta[alert.variant];
              const Icon = meta.icon;
              const btnVariant =
                alert.variant === "success"
                  ? "success"
                  : alert.variant === "error"
                    ? "danger"
                    : alert.variant === "warning"
                      ? "primary"
                      : "primary";
              return (
                <>
                  <div
                    className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-4 ${meta.modalRing}`}
                  >
                    <Icon
                      className={`w-9 h-9 ${
                        alert.variant === "success"
                          ? "text-emerald-500"
                          : alert.variant === "error"
                            ? "text-rose-500"
                            : alert.variant === "warning"
                              ? "text-amber-500"
                              : "text-indigo-500"
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest mb-2 border ${meta.badge}`}
                  >
                    {alert.title}
                  </span>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6 px-1">
                    {alert.message}
                  </p>
                  <Button
                    type="button"
                    variant={btnVariant as "success" | "danger" | "primary"}
                    fullWidth
                    onClick={() => setAlert(null)}
                  >
                    {alert.buttonLabel}
                  </Button>
                </>
              );
            })()}
        </Modal>
      )}

      {/* Confirm modal */}
      {confirm && (
        <Modal open zIndex={195} panelClassName="max-w-md p-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 ring-4 ring-slate-50">
              <ShieldCheck className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="font-display font-black text-lg text-slate-900 text-center mb-2">
              {confirm.title}
            </h3>
            <p className="text-sm text-slate-500 font-medium text-center leading-relaxed mb-6">
              {confirm.message}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
                {confirm.cancelLabel}
              </Button>
              <Button
                type="button"
                variant={confirm.variant === "danger" ? "danger" : "primary"}
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
              >
                {confirm.confirmLabel}
              </Button>
            </div>
        </Modal>
      )}
    </NoticeContext.Provider>
  );
}

export function useNotice(): NoticeContextValue {
  const ctx = useContext(NoticeContext);
  if (!ctx) {
    throw new Error("useNotice must be used within NoticeProvider");
  }
  return ctx;
}
