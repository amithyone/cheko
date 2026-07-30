import { Search, Bell } from "lucide-react";
import { useNotice } from "@/context/NoticeContext";
import { InteractionModeToggle } from "@/shared/ui";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  title: string;
  userRole?: string;
}

export default function Header({ searchQuery, setSearchQuery, title, userRole = "Store Manager" }: HeaderProps) {
  const notice = useNotice();

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-8 py-4 h-20 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-6">
        <h1 className="font-display text-xl font-bold tracking-tight text-slate-800 lg:block hidden">
          {title}
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg w-72 lg:w-96 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all focus:outline-none"
            placeholder="Search items, SKU, transactions..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-sans text-xs font-semibold text-slate-600 tracking-wider">
            TERMINAL_04 ONLINE
          </span>
        </div>

        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

        <InteractionModeToggle compact />

        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

        <button
          onClick={() =>
            notice.showInfo(
              "All terminals operating within 15ms latency parameters.",
              "Broadcast alerts"
            )
          }
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Alex Rivera</p>
            <p className="text-xs text-slate-500 font-medium">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:scale-105 transition-transform duration-200">
            <img
              alt="Manager Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx8MgcpW1vhzwnVeCzbbKkobYypchFMDuQv1XXGY8_vAXtd4wNg7m2Z5pW4autjcnWbVEcQGQD_iUuF9YFIFaRpErTERHCumMFngeNgl38j2SUWCkZ7OJ5cD_kxihThEKnszyVUk-RYoBPp61NCL7s3qNEOloj2H2nkXUoneV2AgC0YXUYFA-dXyJ05dQUWGfBZ0Ae1JX9oDhkBPBe2cSBcdbBlBuDIw0bSi21mzALXwH1Q4oW-G1iXGXtcxlirPKfisWDQClXPdI"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
