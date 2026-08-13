import { BanksObject, QRPay, VietQRStatus } from 'vietnam-qr-pay'

/** Only banks that actually support VietQR bank transfers — a handful of entries in the
 * library's full list (e.g. BIDC) have no bin and can't generate a valid transfer QR at all.
 * Sorted by Vietnamese display name for the select box. */
export const VIETQR_BANKS = Object.values(BanksObject)
  .filter(bank => bank.vietQRStatus === VietQRStatus.TRANSFER_SUPPORTED)
  .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  .map(bank => ({ key: bank.key, bin: bank.bin, name: bank.name, shortName: bank.shortName }))

const BANK_BY_KEY = new Map(VIETQR_BANKS.map(bank => [bank.key, bank]))

export function getBankByKey(bankKey: string) {
  return BANK_BY_KEY.get(bankKey)
}

/** Builds the raw VietQR (EMV QR) payload string for a bank transfer — this is what actually
 * gets encoded into the QR image (via the `qrcode` package, client-side). Returns null if
 * `bankKey` isn't a supported bank, so callers never build a QR for a bank that can't
 * receive transfers this way. */
export function buildVietQrPayload(options: { bankKey: string, accountNumber: string, amount: number, purpose: string }): string | null {
  const bank = getBankByKey(options.bankKey)
  if (!bank || !options.accountNumber) return null
  const qr = QRPay.initVietQR({
    bankBin: bank.bin,
    bankNumber: options.accountNumber,
    amount: String(options.amount),
    purpose: options.purpose
  })
  return qr.build()
}
