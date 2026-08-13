// Bank-transfer "content/note" pool for the 50k-VND team QR codes (see
// app/components/event/TeamQrPanel.vue) — playful losing-a-bet banter, picked at random per
// QR render. Deliberately plain, unaccented Vietnamese ("khong dau"), max ~10 words each:
// VietQR transfer content is a machine-read field most banking apps don't render Vietnamese
// diacritics in reliably, and this matches the exact style the brief's own examples used
// ("Toi thua tam phuc khau phuc", "Toi the se bao thu").
export const TRANSFER_AMOUNT = 50000

export const TRANSFER_MESSAGES = [
  'Toi thua tam phuc khau phuc',
  'Toi the se bao thu',
  'Thua keo nay thang keo sau',
  'Ngua non khong so cop',
  'Chuyen tien tra no danh du',
  'Thua dau chiu dau khong than van',
  'Hom nay thua mai thang lai',
  'Thua nhung van dep trai nhu thuong',
  'Mat tien nhung khong mat mat',
  'Danh bai tam phuc khau phuc',
  'Lan sau nhat dinh go lai',
  'Tien mat nhung tinh anh em con',
  'Thua canh nay nhung khong thua chi',
  'Gui tien va gui luon nuoc mat',
  'No danh du xin tra day du',
  'Ban thua roi day gui tien nhe',
  'Cay cu lam gi gui tien di',
  'Thua keo nay hen keo sau bao thu',
  'Tam phuc khau phuc xin gui tien',
  'Choi la phai co thua co thang',
  'Gui tien khong gui tinh cam',
  'Hen gap lai o keo sau',
  'Thua trong danh du thang trong tu the',
  'Thua khong sao chi can dep trai',
  'Nam nay thua nam sau bao thu',
  'Vui la chinh thua cung phai vui',
  'Gui tien roi quen di noi buon',
  'Thua mot tran khong thua ca doi',
  'Ne tranh lam gi gui tien thoi',
  'Chap nhan thua gui tien dung hen'
]

export function pickTransferMessage(): string {
  return TRANSFER_MESSAGES[Math.floor(Math.random() * TRANSFER_MESSAGES.length)]
}
