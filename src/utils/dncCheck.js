const checkDNC = async (phone) => {
  if (!process.env.REAL_PHONE_VALIDATION_API_KEY) {
    console.warn('[DNC] API key not set — skipping DNC check')
    return { is_dnc: false, is_litigator: false, checked: false }
  }

  try {
    const response = await fetch(
      'https://api.realphonevalidation.com/v2/phone?' +
      new URLSearchParams({
        sid: process.env.REAL_PHONE_VALIDATION_API_KEY,
        phone: phone.replace(/\D/g, ''),
        response_type: 'json'
      })
    )
    const data = await response.json()
    return {
      is_dnc: data.is_dnc === 'Y' || data.dnc === true,
      is_litigator: data.is_litigator === 'Y',
      phone_type: data.phone_type,
      checked: true
    }
  } catch (err) {
    console.error('[DNC] Check failed:', err.message)
    return { is_dnc: false, is_litigator: false, checked: false, error: err.message }
  }
}

module.exports = { checkDNC }
