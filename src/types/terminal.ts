export interface TerminalAudit {
  id: string;
  name: string;
  operator: string;
  status: "ONLINE" | "RECONCILED" | "OUT_OF_BALANCE";
  cashDrawer: number;
  bankTransfer: number;
  cardNfc: number;
  totalSales: number;
  reconciliationChecked: boolean;
  actualCashReported?: number;
}

export interface Transaction {
  id: string;
  productName: string;
  amount: number;
  terminalName: string;
  timestamp: string;
}

export interface DisputeTicket {
  id: string;
  terminal: string;
  type: "OVERCHARGE" | "REFUND";
  description: string;
  amount: number;
  status: "PENDING" | "RESOLVED";
  timestamp: string;
}
