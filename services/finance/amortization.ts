export interface AmortizationRow {
  period: number
  date: Date
  openingBalance: number
  principal: number
  interest: number
  payment: number
  closingBalance: number
}

export function generateAmortizationReducingBalance(
  principal: number,
  annualRatePct: number,
  termMonths: number,
  startDate = new Date(),
): AmortizationRow[] {
  const rMonthly = annualRatePct / 100 / 12
  const payment =
    rMonthly > 0 ? (principal * rMonthly) / (1 - Math.pow(1 + rMonthly, -termMonths)) : principal / termMonths

  const rows: AmortizationRow[] = []
  let balance = principal
  for (let i = 1; i <= termMonths; i++) {
    const interest = balance * rMonthly
    const principalPart = Math.min(payment - interest, balance)
    const closing = Math.max(0, balance - principalPart)
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + i)
    rows.push({
      period: i,
      date: d,
      openingBalance: round2(balance),
      principal: round2(principalPart),
      interest: round2(interest),
      payment: round2(principalPart + interest),
      closingBalance: round2(closing),
    })
    balance = closing
  }
  return rows
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
