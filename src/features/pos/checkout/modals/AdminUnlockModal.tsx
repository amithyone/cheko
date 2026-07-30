import React from "react";
import { Lock } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";

interface AdminUnlockModalProps {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AdminUnlockModal({
  open,
  value,
  onChange,
  onSubmit,
  onClose,
}: AdminUnlockModalProps) {
  return (
    <Modal open={open} onClose={onClose} panelClassName="max-w-sm p-6">
      <h3 className="font-display font-black text-lg text-slate-800 flex items-center gap-2 mb-1">
        <Lock className="w-5 h-5 text-primary" />
        Manager override
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Enter admin code to unlock custom tender amount on this register.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Manager access code"
          className="font-mono"
        />
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Unlock pad
          </Button>
        </div>
      </form>
    </Modal>
  );
}
