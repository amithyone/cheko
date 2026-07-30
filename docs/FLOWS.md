# Payment & cash-point flows

## Terminal payment (TerminalPayModal)

```mermaid
stateDiagram-v2
  [*] --> select_method
  select_method --> nfc_await_card: NFC_Card
  select_method --> cash_amount: Cash
  select_method --> transfer_await: Bank_Transfer
  select_method --> split_overview: Split
  nfc_await_card --> nfc_await_api
  nfc_await_api --> success
  cash_amount --> success
  transfer_await --> success
  split_overview --> split_cash_amount
  split_cash_amount --> split_transfer_1
  split_transfer_1 --> split_transfer_2
  split_transfer_2 --> success
  success --> [*]
```

Split ratios: 40% cash, 30% transfer, 30% transfer (see `usePaymentFlow.ts`).

## Cash Point — Digital → Cash

```mermaid
stateDiagram-v2
  [*] --> form
  form --> transfer_await_api: Bank_Transfer
  form --> card_await_tap: NFC_Card
  card_await_tap --> card_await_api
  card_await_api --> disburse
  transfer_await_api --> transfer_detected
  transfer_detected --> disburse
  disburse --> done
  done --> form
```

Fee: 5% retained (`CASH_DISBURSEMENT_FEE_RATE`). Cash tender = payment × 95%.

## Cash Point — Collect cash → Send to bank

```mermaid
stateDiagram-v2
  [*] --> form
  form --> send_collect: Valid_form
  send_collect --> send_processing
  send_processing --> done
  done --> form
```

Required fields: sender name, cash amount, destination bank, account number, account name.

## Post-payment (checkout)

On terminal success: inventory decrement, terminal audit update, transaction log, navigate to `checkout` tab.
