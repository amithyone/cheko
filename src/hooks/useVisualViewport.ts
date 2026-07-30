import { useEffect, useState } from "react";

export interface VisualViewportState {
  offsetTop: number;
  offsetLeft: number;
  height: number;
  width: number;
  keyboardOpen: boolean;
  keyboardHeight: number;
}

const KEYBOARD_THRESHOLD_PX = 60;

function readVisualViewportState(): VisualViewportState {
  const vv = window.visualViewport;
  if (!vv) {
    return {
      offsetTop: 0,
      offsetLeft: 0,
      height: window.innerHeight,
      width: window.innerWidth,
      keyboardOpen: false,
      keyboardHeight: 0,
    };
  }

  const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  return {
    offsetTop: vv.offsetTop,
    offsetLeft: vv.offsetLeft,
    height: vv.height,
    width: vv.width,
    keyboardOpen: keyboardHeight > KEYBOARD_THRESHOLD_PX,
    keyboardHeight,
  };
}

export function useVisualViewport(enabled = true): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(() =>
    enabled ? readVisualViewportState() : readVisualViewportState()
  );

  useEffect(() => {
    if (!enabled) return;

    const update = () => setState(readVisualViewportState());
    update();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled]);

  return state;
}
