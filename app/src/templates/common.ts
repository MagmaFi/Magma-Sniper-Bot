export const zapperUrl = 'https://zapper.fi/account/'
export const debankUrl = 'https://debank.com/profile/'

export function EtherScanTransactionLink(transactionHash: string) {
  return `${EtherScanUrl()}/tx/${transactionHash}`
}

export function EtherScanUrl() {
  return 'https://explorer.kava.io'
}

export function FN(value: number, decimals: number) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function FNS(value: number, decimals: number) {
  const sign = value > 0 ? '+' : ''

  return `${sign}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}
