import speakeasy from "speakeasy"
import qrcode from "qrcode"

// Generate TOTP secret and QR code
export const generateTOTP = async (userId) => {
  // Generate a secret
  const secret = speakeasy.generateSecret({
    name: `FlutterAuthApp:${userId}`,
  })

  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url)

  return {
    secret: secret.base32,
    qrCodeUrl,
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
