/**
 * Client-side WhatsApp / phone helpers (India +91 default).
 */
export function normalizeWhatsAppNumberClient(raw, { defaultCountryCode = '91' } = {}) {
  const input = String(raw || '').trim()
  if (!input) return { ok: false, error: 'WhatsApp number is required' }

  let digits = input.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) {
    digits = `+${digits.slice(1).replace(/\D/g, '')}`
  } else {
    digits = digits.replace(/\D/g, '')
  }

  if (digits.startsWith('+')) {
    const body = digits.slice(1)
    if (!/^\d{10,15}$/.test(body)) {
      return { ok: false, error: 'Enter a valid WhatsApp number with country code' }
    }
    return { ok: true, value: `+${body}` }
  }

  if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1)

  if (digits.length === 12 && digits.startsWith(defaultCountryCode)) {
    return { ok: true, value: `+${digits}` }
  }

  if (digits.length === 10) {
    return { ok: true, value: `+${defaultCountryCode}${digits}` }
  }

  return {
    ok: false,
    error: 'Enter a valid 10-digit Indian number or include country code (+91…)',
  }
}
