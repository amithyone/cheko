import { cn } from "@/shared/utils/cn";

export const DESIGNER_NAME = "Innocent Amithy Solomon";
export const DESIGNER_SHORT = "Amithy";
export const DESIGNER_URL = "https://profile.amithyone.com/";
export const DESIGNER_TAGLINE = "Founder · Engineer · Creative Media";

interface DesignerCreditProps {
  className?: string;
  variant?: "inline" | "block" | "footer";
}

export function DesignerCredit({ className, variant = "inline" }: DesignerCreditProps) {
  if (variant === "block") {
    return (
      <div className={cn("rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center", className)}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">UI / UX design</p>
        <a
          href={DESIGNER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-display font-bold text-base text-primary hover:underline"
        >
          {DESIGNER_NAME}
        </a>
        <p className="text-xs text-slate-500 mt-1">{DESIGNER_TAGLINE}</p>
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <footer className={cn("text-center py-4 px-6 border-t border-slate-100 bg-white/80", className)}>
        <p className="text-[10px] text-slate-400 font-medium">
          Cheko POS interface designed by{" "}
          <a
            href={DESIGNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-primary hover:underline"
          >
            {DESIGNER_SHORT}
          </a>
          {" · "}
          <a
            href={DESIGNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-primary"
          >
            {DESIGNER_URL.replace(/^https:\/\//, "")}
          </a>
        </p>
      </footer>
    );
  }

  return (
    <p className={cn("text-[10px] text-slate-400", className)}>
      Designed by{" "}
      <a
        href={DESIGNER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-primary hover:underline"
      >
        {DESIGNER_SHORT}
      </a>
    </p>
  );
}
