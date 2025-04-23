import express from "express"
import { supabase } from "../server.js"
import { generateTOTP, verifyTOTP } from "../utils/totp.js"

const router = express.Router()

// Enable 2FA
router.post("/enable-2fa", async (req, res) => {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1201,
        httpStatus: 400,
        message: "User ID is required"
      })
    }

    const secret = await generateTOTP(user_id)

    const { error } = await supabase
      .from("profiles")
      .update({ twoFactorEnabled: true })
      .eq("id", user_id)

    if (error) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4201,
        httpStatus: 400,
        message: error.message
      })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2201,
      httpStatus: 200,
      message: "2FA enabled successfully",
      payload: { secret }
    })
  } catch (error) {
    console.error("2FA enable error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5201,
      httpStatus: 500,
      message: "Server error while enabling 2FA"
    })
  }
})

// Verify 2FA token
router.post("/verify-2fa", async (req, res) => {
  try {
    const { user_id, token } = req.body

    if (!user_id || !token) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1202,
        httpStatus: 400,
        message: "User ID and token are required"
      })
    }

    const isValid = await verifyTOTP(user_id, token)

    if (!isValid) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4202,
        httpStatus: 401,
        message: "Invalid 2FA token"
      })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2202,
      httpStatus: 200,
      message: "2FA verification successful"
    })
  } catch (error) {
    console.error("2FA verification error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5202,
      httpStatus: 500,
      message: "Server error during 2FA verification"
    })
  }
})

export default router
