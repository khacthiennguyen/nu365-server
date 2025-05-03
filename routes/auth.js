import express from "express"
import { supabase } from "../server.js"
import { generateTOTP } from "../utils/totp.js"
import bcrypt from "bcrypt"

const router = express.Router()

// Update the formatExpiry function to use server time standard
const formatExpiry = (timestamp) => {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  return date.toISOString(); // Returns ISO format: "2025-04-26T12:24:30.000Z"
}

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

    // Register user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name,
          twoFactorEnabled: false,
          biometricEnabled: false,
          email_verified: true 
        },
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/callback`,
        emailConfirm: false
      },
    })

    if (authError) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4003,
        httpStatus: 400,
        message: authError.message
      })
    }

    // Remove sensitive data before sending response
    const safeUserData = {
      id: authData.user.id,
      email: authData.user.email,
      name: name,
    }

    // Thêm người dùng vào bảng users
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          userId: authData.user.id,
          userName: name,
          email: authData.user.email
        },
      ])
      .select()

    if (error) {
      console.error("Error inserting into users table:", error);
      // Vẫn tiếp tục vì người dùng đã được tạo trong auth
    }

    return res.status(201).json({
      error: false,
      success: true,
      code: 2001,
      httpStatus: 201,
      message: "Registration successful",
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
    console.log("Login request body:", req.body);
    
    // Kiểm tra nếu body không tồn tại hoặc rỗng
    if (!req.body) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1002,
        httpStatus: 400,
        message: "Request body is missing"
      });
    }
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1002,
        httpStatus: 400,
        message: "Email and password are required",
        meta: { received: req.body ? Object.keys(req.body) : [] }
      });
    }

    // Sign in with Supabase with explicit 3-day expiration
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        expiresIn: 60 * 60 * 24 * 3 // 3 days in seconds (60s * 60m * 24h * 3d)
      }
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        return res.status(401).json({
          error: true,
          success: false,
          code: 4001,
          httpStatus: 401,
          message: "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.",
          meta: { code: "EMAIL_NOT_VERIFIED" }
        });
      }
      return res.status(401).json({
        error: true,
        success: false,
        code: 4002,
        httpStatus: 401,
        message: error.message
      });
    }

    if (!data.user.email_confirmed_at) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4001,
        httpStatus: 401,
        message: "Email chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản.",
        meta: { code: "EMAIL_NOT_VERIFIED" }
      });
    }

    // Check if 2FA is enabled for this user
    const { data: userData } = await supabase
      .from("profiles")
      .select("twoFactorEnabled, name")
      .eq("id", data.user.id)
      .single();

    // Create a safe user object without sensitive data
    const safeUserData = {
      id: data.user.id,
      email: data.user.email,
      name: userData?.name || data.user.user_metadata?.name || data.user.user_metadata?.full_name || ''
    };

    // Chuyển đổi ISO Date String thành timestamp (seconds) cho phù hợp với model Flutter
    const expiryDate = new Date(data.session.expires_at * 1000);
    const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);

    if (userData?.twoFactorEnabled) {
      // Generate TOTP for 2FA
      const totpSecret = await generateTOTP(data.user.id);

      return res.status(200).json({
        error: false,
        success: true,
        code: 2006,
        httpStatus: 200,
        message: "2FA required",
        meta: { requiresTwoFactor: true },
        payload: {
          
          session: {
            access_token: data.session.access_token,
            expires_at: expiryTimestamp
          },
          user: safeUserData
        }
      });
    }

    // Standard success response matching Flutter Credential model structure
    // Đã xóa trường message trong payload
    return res.status(200).json({
      error: false,
      success: true,
      code: 2002,
      httpStatus: 200,
      message: "Login successful",
      payload: {
        // Đã xóa trường message ở đây
        session: {
          access_token: data.session.access_token,
          expires_at: expiryTimestamp
        },
        user: safeUserData
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Request Body:", req.body);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5002,
      httpStatus: 500,
      message: "Server error during login: " + error.message
    });
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
