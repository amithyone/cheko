import { useState, type Dispatch, type SetStateAction, type FormEvent } from "react";
import {
  UserPlus,
  Users,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  Terminal,
  Shield,
} from "lucide-react";
import type { StaffAccount, TerminalAccountType, TerminalAudit, UserRole } from "@/types";
import { ROLE_TERMINAL_TYPE } from "@/types";
import { useNotice } from "@/context/NoticeContext";
import { Button, Input, Select, Badge } from "@/shared/ui";

const ROLES: UserRole[] = [
  "Store Manager",
  "Sales Rep",
  "Online Sales Dispatcher",
  "Cash Point Officer",
];

const TERMINAL_TYPES: TerminalAccountType[] = [
  "POS Terminal",
  "Cash Point Terminal",
  "Online Dispatch Station",
  "Manager Console",
];

interface AccountManagerPanelProps {
  accounts: StaffAccount[];
  setAccounts: Dispatch<SetStateAction<StaffAccount[]>>;
  terminalAudits: TerminalAudit[];
  setTerminalAudits: Dispatch<SetStateAction<TerminalAudit[]>>;
  onSaved?: (message: string) => void;
}

const emptyForm = {
  username: "",
  password: "",
  confirmPassword: "",
  displayName: "",
  role: "Sales Rep" as UserRole,
  terminalType: "POS Terminal" as TerminalAccountType,
  terminalId: "",
  status: "active" as StaffAccount["status"],
};

export function AccountManagerPanel({
  accounts,
  setAccounts,
  terminalAudits,
  setTerminalAudits,
  onSaved,
}: AccountManagerPanelProps) {
  const notice = useNotice();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleRoleChange = (role: UserRole) => {
    setForm((f) => ({
      ...f,
      role,
      terminalType: ROLE_TERMINAL_TYPE[role],
    }));
  };

  const suggestTerminalId = (type: TerminalAccountType) => {
    if (type === "POS Terminal") {
      const nums = terminalAudits
        .map((t) => parseInt(t.id.replace("term-", ""), 10))
        .filter((n) => !Number.isNaN(n));
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      return `term-${next}`;
    }
    if (type === "Cash Point Terminal") return `cash-point-${String(Math.floor(Math.random() * 90) + 10)}`;
    if (type === "Online Dispatch Station") return `dispatch-${String(Math.floor(Math.random() * 90) + 10)}`;
    return `term-mgr-${String(Math.floor(Math.random() * 90) + 10)}`;
  };

  const openCreate = () => {
    const terminalType = ROLE_TERMINAL_TYPE["Sales Rep"];
    setForm({
      ...emptyForm,
      terminalType,
      terminalId: suggestTerminalId(terminalType),
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (account: StaffAccount) => {
    setForm({
      username: account.username,
      password: account.password,
      confirmPassword: account.password,
      displayName: account.displayName,
      role: account.role,
      terminalType: account.terminalType,
      terminalId: account.terminalId,
      status: account.status,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const registerPosTerminal = (account: StaffAccount) => {
    if (terminalAudits.some((t) => t.id === account.terminalId)) return;
    setTerminalAudits((prev) => [
      ...prev,
      {
        id: account.terminalId,
        name: `${account.terminalType} — ${account.displayName}`,
        operator: account.displayName,
        status: "ONLINE",
        cashDrawer: 0,
        bankTransfer: 0,
        cardNfc: 0,
        totalSales: 0,
        reconciliationChecked: false,
      },
    ]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.displayName.trim()) {
      notice.showWarning("Username and display name are required.");
      return;
    }
    if (!form.password || form.password.length < 4) {
      notice.showWarning("Password must be at least 4 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      notice.showWarning("Passwords do not match.");
      return;
    }
    const terminalId = form.terminalId.trim() || suggestTerminalId(form.terminalType);
    const duplicateUser = accounts.some(
      (a) => a.username === form.username.trim() && a.id !== editingId
    );
    if (duplicateUser) {
      notice.showWarning("That username is already registered.");
      return;
    }

    if (editingId) {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                username: form.username.trim(),
                password: form.password,
                displayName: form.displayName.trim(),
                role: form.role,
                terminalType: form.terminalType,
                terminalId,
                status: form.status,
              }
            : a
        )
      );
      onSaved?.(`Account "${form.displayName}" updated`);
    } else {
      const newAccount: StaffAccount = {
        id: `acct-${Date.now()}`,
        username: form.username.trim(),
        password: form.password,
        displayName: form.displayName.trim(),
        role: form.role,
        terminalType: form.terminalType,
        terminalId,
        status: form.status,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      setAccounts((prev) => [newAccount, ...prev]);
      if (form.terminalType === "POS Terminal") {
        registerPosTerminal(newAccount);
      }
      onSaved?.(`Terminal account created for ${newAccount.displayName}`);
    }
    resetForm();
  };

  const handleDelete = (account: StaffAccount) => {
    notice.showConfirm({
      title: "Remove account?",
      message: `Delete ${account.displayName} (${account.username})? They will no longer be able to sign in.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => {
        setAccounts((prev) => prev.filter((a) => a.id !== account.id));
        onSaved?.(`Account "${account.displayName}" removed`);
      },
    });
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Account & Terminal Manager
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Create operator logins, assign roles, and register POS terminals on the network.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openCreate} className="shrink-0">
          <UserPlus className="w-4 h-4" />
          New account
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-5 space-y-4"
        >
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
            {editingId ? "Edit account" : "Register new terminal account"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Display name"
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              placeholder="Sarah Jenkins"
            />
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="sarah_cashier"
              autoComplete="off"
            />
            <Select
              label="Account role"
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
            <Select
              label="Terminal type"
              value={form.terminalType}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  terminalType: e.target.value as TerminalAccountType,
                  terminalId: f.terminalId || suggestTerminalId(e.target.value as TerminalAccountType),
                }))
              }
            >
              {TERMINAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input
              label="Terminal ID"
              value={form.terminalId}
              onChange={(e) => setForm((f) => ({ ...f, terminalId: e.target.value }))}
              placeholder="term-5"
              hint="Auto-suggested for new POS lanes"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value as StaffAccount["status"] }))
              }
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" size="sm">
              {editingId ? "Save changes" : "Create account"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              <th className="px-4 py-3">Operator</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Terminal type</th>
              <th className="px-4 py-3">Terminal ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <span className="font-bold text-slate-800">{account.displayName}</span>
                  <span className="block text-[10px] text-slate-400">Since {account.createdAt}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{account.username}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-slate-600">
                    {revealedIds.has(account.id) ? account.password : "••••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleReveal(account.id)}
                    className="ml-2 text-slate-400 hover:text-primary cursor-pointer inline-flex align-middle"
                  >
                    {revealedIds.has(account.id) ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600">{account.role}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                    <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                    {account.terminalType}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-primary">{account.terminalId}</td>
                <td className="px-4 py-3">
                  <Badge variant={account.status === "active" ? "success" : "warning"}>
                    {account.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(account)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(account)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        Demo credentials stored locally — wire to{" "}
        <code className="font-mono bg-slate-100 px-1 rounded">POST /api/v1/staff</code> for production.
      </p>
    </div>
  );
}
