export type UserRole =
  | "Store Manager"
  | "Sales Rep"
  | "Online Sales Dispatcher"
  | "Cash Point Officer";

/** Manager override to unlock custom tender keypad on checkout */
export const ADMIN_TENDER_OVERRIDE_CODE = "MG-9941";

export type TerminalAccountType =
  | "POS Terminal"
  | "Cash Point Terminal"
  | "Online Dispatch Station"
  | "Manager Console";

export interface StaffAccount {
  id: string;
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  terminalType: TerminalAccountType;
  terminalId: string;
  status: "active" | "suspended";
  createdAt: string;
}

export const ROLE_TERMINAL_TYPE: Record<UserRole, TerminalAccountType> = {
  "Store Manager": "Manager Console",
  "Sales Rep": "POS Terminal",
  "Online Sales Dispatcher": "Online Dispatch Station",
  "Cash Point Officer": "Cash Point Terminal",
};
