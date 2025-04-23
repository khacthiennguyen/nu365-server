import express from "express"
import { supabase } from "../server.js"
import { generateTOTP } from "../utils/totp.js"
import bcrypt from "bcrypt"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1001,
        httpStatus: 400,
        message: "Missing required fields",
        payload: {
          required: ["email", "password", "name"],
          received: Object.keys(req.body)
        }
      })
    }

    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password, // Supabase handles password hashing internally
      options: {
        data: {
          name,
          twoFactorEnabled: false,
          biometricEnabled: false,
        },
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`,
        emailConfirm: false // Thêm dòng này để bỏ qua xác thực email
      },
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    // Create user profile in the database
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: authData.user.id,
        email: email,
        name: name,
        twoFactorEnabled: false,
        biometricEnabled: false,
        created_at: new Date(),
      },
      { onConflict: "id" },
    )

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      // Continue anyway since Supabase might create the profile via trigger
    }

    // Remove sensitive data before sending response
    const safeUserData = {
      id: authData.user.id,
      email: authData.user.email,
      name: name,
    }

    return res.status(201).json({
      error: false,
      success: true,
      code: 2001,
      httpStatus: 201,
      message: "Registration successful. Please check your email for verification.",
      payload: safeUserData
    })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({
      error: true, 
      success: false,
      code: 5001,
      httpStatus: 500,
      message: "Server error during registration",
      payload: error.message
    })
  }
})

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1002,
        httpStatus: 400,
        message: "Email and password are required"
      })
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return res.status(401).json({
          error: true,
          success: false,
          code: 4001,
          httpStatus: 401,
          message: "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.",
          meta: { code: "EMAIL_NOT_VERIFIED" }
        })
      }
      return res.status(401).json({
        error: true,
        success: false,
        code: 4002,
        httpStatus: 401,
        message: error.message
      })
    }

    if (!data.user.email_confirmed_at) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4001,
        httpStatus: 401,
        message: "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.",
        meta: { code: "EMAIL_NOT_VERIFIED" }
      })
    }

    // Check if 2FA is enabled for this user
    const { data: userData } = await supabase
      .from("profiles")
      .select("twoFactorEnabled")
      .eq("id", data.user.id)
      .single()

    // Create a safe user object without sensitive data
    const safeUserData = {
      id: data.user.id,
      email: data.user.email,
      // Include other non-sensitive user data
    }

    if (userData?.twoFactorEnabled) {
      // Generate TOTP for 2FA
      const totpSecret = await generateTOTP(data.user.id)

      return res.status(200).json({
        message: "2FA required",
        requiresTwoFactor: true,
        session: {
          access_token: data.session.access_token,
          expires_at: data.session.expires_at,
        },
        user: safeUserData,
      })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2002,
      httpStatus: 200,
      message: "Login successful",
      payload: {
        session: {
          access_token: data.session.access_token,
          expires_at: data.session.expires_at,
        },
        user: safeUserData
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5002,
      httpStatus: 500,
      message: "Server error during login"
    })
  }
})

// Verify email
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1003,
        httpStatus: 400,
        message: "Verification token is required"
      })
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2003,
      httpStatus: 200,
      message: "Email verified successfully"
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5003,
      httpStatus: 500,
      message: "Server error during email verification"
    })
  }
})

// Resend verification email
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1004,
        httpStatus: 400,
        message: "Email is required"
      })
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`
      }
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2004,
      httpStatus: 200,
      message: "Verification email has been resent"
    })
  } catch (error) {
    console.error("Error resending verification:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5004,
      httpStatus: 500,
      message: "Server error during resend verification"
    })
  }
})

// Logout user
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1005,
        httpStatus: 400,
        message: error.message
      })
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2005,
      httpStatus: 200,
      message: "Logout successful"
    })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({
      error: true,
      success: false,
      code: 5005,
      httpStatus: 500,
      message: "Server error during logout"
    })
  }
})

export default router
