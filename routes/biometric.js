import express from "express"
import { supabase } from "../server.js"

const router = express.Router()

// Enable biometric
router.post("/enable", async (req, res) => {
  try {
    const { user_id, public_key } = req.body

    if (!user_id || !public_key) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1101,
        httpStatus: 400,
        message: "Missing required fields",
        payload: {
          required: ["user_id", "public_key"],
          received: Object.keys(req.body)
        }
      })
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        biometricEnabled: true,
        biometric_public_key: public_key 
      })
      .eq("id", user_id)

    if (error) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4101,
        httpStatus: 400,
        message: error.message
      })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2101,
      httpStatus: 200,
      message: "Biometric authentication enabled successfully"
    })
  } catch (error) {
    console.error("Biometric enable error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5101,
      httpStatus: 500,
      message: "Server error while enabling biometric"
    })
  }
})

// Disable biometric
router.post("/disable", async (req, res) => {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1102,
        httpStatus: 400,
        message: "User ID is required"
      })
    }

    const { error } = await supabase
      .from("profiles")
      .update({ 
        biometricEnabled: false,
        biometric_public_key: null 
      })
      .eq("id", user_id)

    if (error) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4102,
        httpStatus: 400,
        message: error.message
      })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2102,
      httpStatus: 200,
      message: "Biometric authentication disabled successfully"
    })
  } catch (error) {
    console.error("Biometric disable error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5102,
      httpStatus: 500,
      message: "Server error while disabling biometric"
    })
  }
})

export default router
