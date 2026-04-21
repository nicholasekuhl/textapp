// AES-256-GCM encrypt/decrypt for OAuth tokens.
// Uses GOOGLE_TOKEN_ENCRYPTION_KEY env var (32 bytes, base64 encoded).
// Output format: base64(iv || authTag || ciphertext)

const crypto = require('crypto')

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

const getKey = () => {
  const raw = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY
  if (!raw) throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY env var is not set')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new Error(`GOOGLE_TOKEN_ENCRYPTION_KEY must be 32 bytes (base64); got ${key.length} bytes`)
  return key
}

const encrypt = (plaintext) => {
  if (plaintext == null) return null
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, ciphertext]).toString('base64')
}

const decrypt = (payload) => {
  if (!payload) return null
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.slice(0, IV_LENGTH)
  const authTag = buf.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const ciphertext = buf.slice(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

module.exports = { encrypt, decrypt }