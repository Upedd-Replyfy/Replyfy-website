import { ApiError } from './ApiError.js'

/**
 * Normalize WhatsApp / phone numbers to E.164-ish form for India (+91…).
 * Accepts: 9876543210, 919876543210, +919876543210, 09876543210
 */
export function normalizeWhatsAppNumber(raw, { defaultCountryCode = '91' } = {}) {
  const input = String(raw || '').trim()
  if (!input) {
    throw new ApiError(400, 'WhatsApp number is required')
  }

  let digits = input.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) {
    digits = `+${digits.slice(1).replace(/\D/g, '')}`
  } else {
    digits = digits.replace(/\D/g, '')
  }

  if (digits.startsWith('+')) {
    const body = digits.slice(1)
    if (!/^\d{10,15}$/.test(body)) {
      throw new ApiError(400, 'Enter a valid WhatsApp number with country code')
    }
    return `+${body}`
  }

  // Strip leading 0 for local numbers
  if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1)
  }

  // Already includes country code without +
  if (digits.length === 12 && digits.startsWith(defaultCountryCode)) {
    return `+${digits}`
  }

  if (digits.length === 10) {
    return `+${defaultCountryCode}${digits}`
  }

  throw new ApiError(
    400,
    'Enter a valid Indian WhatsApp number (10 digits) or include country code (+91…)'
  )
}

export function isValidWhatsAppNumber(raw) {
  try {
    normalizeWhatsAppNumber(raw)
    return true
  } catch {
    return false
  }
}
