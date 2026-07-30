import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type InteractionMode = "mouse" | "touch";

const STORAGE_KEY = "cheko-interaction-mode";

interface InteractionModeContextValue {
  mode: InteractionMode;
  isTouch: boolean;
  setMode: (mode: InteractionMode) => void;
  toggleMode: () => void;
}

const InteractionModeContext = createContext<InteractionModeContextValue | null>(null);

function readStoredMode(): InteractionMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "touch" || stored === "mouse") return stored;
  } catch {
    /* ignore */
  }
  return "mouse";
}

export function InteractionModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<InteractionMode>(readStoredMode);

  const setMode = useCallback((next: InteractionMode) => {
    setModeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "touch" ? "mouse" : "touch");
  }, [mode, setMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-interaction-mode", mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      isTouch: mode === "touch",
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode]
  );

  return (
    <InteractionModeContext.Provider value={value}>{children}</InteractionModeContext.Provider>
  );
}

export function useInteractionMode() {
  const ctx = useContext(InteractionModeContext);
  if (!ctx) {
    throw new Error("useInteractionMode must be used within InteractionModeProvider");
  }
  return ctx;
}

export function useInteractionModeOptional() {
  return useContext(InteractionModeContext);
}
