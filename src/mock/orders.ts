import type { DeliveryOrder } from "@/types";

export const INITIAL_ONLINE_ORDERS: DeliveryOrder[] = [
  {
    id: "ON-9402",
    customerName: "Theresa Obi",
    phone: "+234 803 111 2233",
    address: "Suite 4, Chevron Layout, Lekki Phase 1, Lagos",
    deliveryInstructions: "Call when by the security gate for code entry",
    items: [
      { productName: "AeroSwift Max Athletic Shoes", qty: 2, unitPrice: 121000 },
      { productName: "Tomalen Loaf Premium Bread", qty: 2, unitPrice: 1200 },
    ],
    total: 244400,
    status: "PENDING",
    assignedDriver: "None Assigned",
    eta: "Pending Confirmation",
    timestamp: "10:14 AM",
    bankName: "Providus Bank",
    bankAccountNo: "9023812902",
    bankPaid: true,
  },
  {
    id: "ON-9403",
    customerName: "Emeka Nwosu",
    phone: "+234 812 444 5566",
    address: "Block C1, 1004 Estates, Victoria Island",
    deliveryInstructions: "Leave on the white box by the doorway",
    items: [
      { productName: "Gatorade Energy Blue", qty: 5, unitPrice: 950 },
      { productName: "AeroSwift Max Athletic Shoes", qty: 1, unitPrice: 121000 },
    ],
    total: 125750,
    status: "PREPARING",
    assignedDriver: "None Assigned",
    eta: "Assembling inside lane 4",
    timestamp: "10:30 AM",
    bankName: "Sterling Bank",
    bankAccountNo: "5070238190",
    bankPaid: true,
  },
  {
    id: "ON-9404",
    customerName: "Halima Danjuma",
    phone: "+234 905 555 7788",
    address: "Apt B5, Maitama Gardens, Abuja",
    deliveryInstructions: "Ensure frozen items are packed in dry ice coolers",
    items: [{ productName: "Truffle Fries (Double Cut)", qty: 4, unitPrice: 4200 }],
    total: 16800,
    status: "OUT_FOR_DELIVERY",
    assignedDriver: "Rider Dennis (Cargo Motorbike)",
    eta: "14 mins away",
    timestamp: "09:44 AM",
    bankName: "Wema Bank",
    bankAccountNo: "0194828341",
    bankPaid: true,
  },
];

export const ORDER_DRIVERS = [
  "Rider Dennis (Cargo Motorbike)",
  "Rider Musa (Cargo Van)",
  "Dispatcher Chidi (Mini Cargo Flatbed)",
  "Autonomous Drone Node Alpha",
];

export const ORDER_BANKS = [
  "Sterling Bank",
  "Providus Bank",
  "Wema Bank",
  "Kuda Microfinance Bank",
  "Zenith Bank",
];
