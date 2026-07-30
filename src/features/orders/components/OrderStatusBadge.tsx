export type OrderStatus = "PENDING" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED";

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PREPARING: "bg-indigo-100 text-indigo-800",
  OUT_FOR_DELIVERY: "bg-sky-100 text-sky-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
