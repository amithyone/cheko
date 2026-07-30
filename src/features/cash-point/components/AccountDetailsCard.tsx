import { Building2, Copy } from "lucide-react";
import { CashPointReceiveAccount } from "@/types";
import { useNotice } from "@/context/NoticeContext";

interface AccountDetailsCardProps {
  receiveAccount: CashPointReceiveAccount;
  compact?: boolean;
}

export default function AccountDetailsCard({ receiveAccount, compact = false }: AccountDetailsCardProps) {
  const notice = useNotice();

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(receiveAccount.accountNumber);
      notice.showToast("Account number copied", "success");
    } catch {
      notice.showWarning("Could not copy — select the number manually.", "Copy failed");
    }
  };

  return (
    <div className={`bg-indigo-50 border border-indigo-100 rounded-2xl ${compact ? "p-4" : "p-5"} space-y-3`}>
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
        <p className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">
          Send transfer to this account
        </p>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-2">
          <span className="text-slate-500 text-xs">Bank</span>
          <span className="font-bold text-slate-800">{receiveAccount.bankName}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-slate-500 text-xs">Account name</span>
          <span className="font-bold text-slate-800 text-right">{receiveAccount.accountName}</span>
        </div>
        <div className="flex justify-between items-center gap-2 pt-2 border-t border-indigo-100">
          <span className="text-slate-500 text-xs">Account number</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-indigo-900 tracking-wide select-all">
              {receiveAccount.accountNumber}
            </span>
            <button
              type="button"
              onClick={copyAccountNumber}
              className="p-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 cursor-pointer"
              title="Copy account number"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {!compact && (
        <p className="text-[10px] text-indigo-600/80 leading-relaxed">
          When the transfer lands, the bank API attaches sender details and amount — no manual entry needed.
        </p>
      )}
    </div>
  );
}
