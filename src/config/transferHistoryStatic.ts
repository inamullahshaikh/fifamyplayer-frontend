/** Static transfer history for the dashboard. */
export type TransferRecord = {
  date: string
  from: string
  to: string
  amount: string
}

export const STATIC_TRANSFER_HISTORY: TransferRecord[] = [
  { date: 'July 2025', from: 'Athletic Bilbao', to: 'FC Barcelona', amount: '€280M' },
  { date: 'July 2030', from: 'FC Barcelona', to: 'Manchester City', amount: '€360M' },
  { date: 'July 2034', from: 'Manchester City', to: 'FC Barcelona', amount: 'Free Transfer' },
  { date: 'July 2036', from: 'FC Barcelona', to: 'Manchester United', amount: '€300M' },
] as const
