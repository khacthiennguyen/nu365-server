import speakeasy from "speakeasy"

// Generate TOTP secret and QR code
export const generateTOTP = async (email) => {
  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `NU365:${email}`,
  })

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  }
}

// Verify TOTP token
export const verifyTOTP = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // Allow 1 time step before and after the current time
  })
}
