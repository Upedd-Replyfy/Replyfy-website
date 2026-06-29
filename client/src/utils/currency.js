/**
 * Format paise (integer) as Indian Rupee display string with ₹ prefix.
 */
export function formatRupee(paise) {
  return `₹${((paise || 0) / 100).toLocaleString('en-IN')}`
}

/**
 * Format paise with two decimal places (wallet balances).
 */
export function formatRupeeFixed(paise) {
  return `₹${((paise || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
}

/**
 * Format paise as rupee amount without prefix (payment step adds ₹).
 */
export function formatRupeeAmount(paise) {
  return (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}
