import express from "express"
import { supabase } from "../server.js"
import { generateTOTP, verifyTOTP } from "../utils/totp.js"
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
router.post("/login", async (req, res) => {  try {
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
    }    // Sign in with Supabase with explicit 30-day expiration (tăng từ 3 ngày lên 30 ngày để test)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        expiresIn: 60 * 60 * 24 * 30 // 30 days in seconds (60s * 60m * 24h * 30d)
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
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("twofactorenabled, totp_secret, userName")
      .eq("email", data.user.email)
      .single();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5006,
        httpStatus: 500,
        message: "Error fetching user data"
      });
    }

    // If 2FA is enabled, redirect to login-with-otp
    if (userData?.twofactorenabled) {
      return res.status(403).json({
        error: true,
        success: false,
        code: 4019,
        httpStatus: 403,
        message: "2FA is enabled for this account. Please use the login-with-otp endpoint instead.",
        meta: { requiresTwoFactor: true }
      });
    }    // Create a safe user object without sensitive data
    const safeUserData = {
      id: data.user.id,
      email: data.user.email,
      name: userData?.userName || data.user.user_metadata?.name || data.user.user_metadata?.full_name || ''
    };    // Xử lý đúng expires_at để đảm bảo luôn trả về timestamp (seconds)
    let expiryTimestamp;
    
    // Kiểm tra nếu expires_at là chuỗi ISO
    if (typeof data.session.expires_at === 'string' && data.session.expires_at.includes('T')) {
      const expiryDate = new Date(data.session.expires_at);
      expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
    } 
    // Kiểm tra nếu expires_at đã là timestamp (giây)
    else if (typeof data.session.expires_at === 'number') {
      expiryTimestamp = data.session.expires_at;
    }
    // Trường hợp khác, sử dụng Unix timestamp hiện tại + 3 ngày
    else {
      expiryTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // Hiện tại + 3 ngày
    }

    // Standard success response matching Flutter Credential model structure
    return res.status(200).json({
      error: false,
      success: true,
      code: 2002,
      httpStatus: 200,
      message: "Login successful",
      payload: {
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

// Enable 2FA - Step 1: Generate secret and QR code
router.post("/enable-2fa", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4010,
        httpStatus: 401,
        message: "Authorization token is required"
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // Verify the token with Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !userData.user) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4010,
        httpStatus: 401,
        message: "Invalid or expired access token"
      });
    }

    // Generate TOTP secret using email instead of userId
    const totpData = await generateTOTP(userData.user.email);

    // Store temp_totp_secret in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ temp_totp_secret: totpData.secret })
      .eq('email', userData.user.email);

    if (updateError) {
      console.error("Error saving temporary TOTP secret:", updateError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5010,
        httpStatus: 500,
        message: "Failed to save TOTP secret"
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2010,
      httpStatus: 200,
      message: "2FA setup initiated",
      payload: {
        secret: totpData.secret,
        otpauth_url: totpData.otpauth_url,
        email: userData.user.email
      }
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5011,
      httpStatus: 500,
      message: "Server error during 2FA setup"
    });
  }
});

// Enable 2FA - Step 2: Verify OTP and enable 2FA
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    
    if (!email || !password || !otp) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1011,
        httpStatus: 400,
        message: "Email, password and OTP are required"
      });
    }

    // Verify password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4012,
        httpStatus: 401,
        message: "Invalid email or password"
      });
    }

    // Get the temp_totp_secret from the database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('temp_totp_secret')
      .eq('email', authData.user.email)
      .single();

    if (fetchError || !userData || !userData.temp_totp_secret) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4013,
        httpStatus: 400,
        message: "2FA setup not initiated or expired"
      });
    }

    // Verify OTP
    const isValidOtp = verifyTOTP(userData.temp_totp_secret, otp);
    
    if (!isValidOtp) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4014,
        httpStatus: 401,
        message: "Invalid OTP code"
      });
    }

    // Update user with verified TOTP secret and enable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        totp_secret: userData.temp_totp_secret,
        temp_totp_secret: null,
        twofactorenabled: true
      })
      .eq('email', authData.user.email);

    if (updateError) {
      console.error("Error enabling 2FA:", updateError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5012,
        httpStatus: 500,
        message: "Failed to enable 2FA"
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2011,
      httpStatus: 200,
      message: "2FA has been enabled successfully"
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5013,
      httpStatus: 500,
      message: "Server error during 2FA verification"
    });
  }
});

// Disable 2FA
router.post("/disable-2fa", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    
    if (!email || !password || !otp) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1012,
        httpStatus: 400,
        message: "Email, password and OTP are required"
      });
    }

    // Verify password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4015,
        httpStatus: 401,
        message: "Invalid email or password"
      });
    }

    // Get the totp_secret from the database
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('totp_secret, twofactorenabled')
      .eq('email', authData.user.email)
      .single();

    if (fetchError || !userData || !userData.totp_secret || !userData.twofactorenabled) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4016,
        httpStatus: 400,
        message: "2FA is not enabled for this account"
      });
    }

    // Verify OTP
    const isValidOtp = verifyTOTP(userData.totp_secret, otp);
    
    if (!isValidOtp) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4017,
        httpStatus: 401,
        message: "Invalid OTP code"
      });
    }

    // Disable 2FA for the user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        totp_secret: null,
        twofactorenabled: false
      })
      .eq('email', authData.user.email);

    if (updateError) {
      console.error("Error disabling 2FA:", updateError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5014,
        httpStatus: 500,
        message: "Failed to disable 2FA"
      });
    }

    return res.status(200).json({
      error: false,
      success: true,
      code: 2012,
      httpStatus: 200,
      message: "2FA has been disabled successfully"
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5015,
      httpStatus: 500,
      message: "Server error during 2FA disabling"
    });
  }
});

// Login with OTP (for 2FA-enabled accounts)
router.post("/login-with-otp", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    
    if (!email || !password || !otp) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1013,
        httpStatus: 400,
        message: "Email, password and OTP are required"
      });
    }    // Sign in with Supabase with explicit 30-day expiration (tăng từ 3 ngày lên 30 ngày để test)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        expiresIn: 60 * 60 * 24 * 30 // 30 days in seconds (60s * 60m * 24h * 30d)
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

    // Check if 2FA is enabled for this user
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("twofactorenabled, totp_secret, userName")
      .eq("email", email)
      .single();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5006,
        httpStatus: 500,
        message: "Error fetching user data"
      });
    }

    // Check if user has 2FA enabled
    if (!userData?.twofactorenabled || !userData?.totp_secret) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4020,
        httpStatus: 400,
        message: "2FA is not enabled for this account. Use the regular login endpoint."
      });
    }

    // Verify the OTP
    const isValidOtp = verifyTOTP(userData.totp_secret, otp);
    
    if (!isValidOtp) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4021,
        httpStatus: 401,
        message: "Invalid OTP code"
      });
    }    // Create a safe user object without sensitive data
    const safeUserData = {
      id: data.user.id,
      email: data.user.email,
      name: userData?.userName || data.user.user_metadata?.name || data.user.user_metadata?.full_name || ''
    };    // Xử lý đúng expires_at để đảm bảo luôn trả về timestamp (seconds)
    let expiryTimestamp;
    
    // Kiểm tra nếu expires_at là chuỗi ISO
    if (typeof data.session.expires_at === 'string' && data.session.expires_at.includes('T')) {
      const expiryDate = new Date(data.session.expires_at);
      expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
    } 
    // Kiểm tra nếu expires_at đã là timestamp (giây)
    else if (typeof data.session.expires_at === 'number') {
      expiryTimestamp = data.session.expires_at;
    }
    // Trường hợp khác, sử dụng Unix timestamp hiện tại + 3 ngày
    else {
      expiryTimestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // Hiện tại + 3 ngày
    }

    // Success response with access token
    return res.status(200).json({
      error: false,
      success: true,
      code: 2013,
      httpStatus: 200,
      message: "Login successful",
      payload: {
        session: {
          access_token: data.session.access_token,
          expires_at: expiryTimestamp
        },
        user: safeUserData
      }
    });
  } catch (error) {
    console.error("Login with OTP error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5016,
      httpStatus: 500,
      message: "Server error during login with OTP: " + error.message
    });
  }
});

// Get user security settings
router.get("/security", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const deviceId = req.query.device_id; // hoặc dùng req.body nếu dùng POST

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4022,
        httpStatus: 401,
        message: "Authorization token is required"
      });
    }

    if (!deviceId) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4024,
        httpStatus: 400,
        message: "Device ID is required"
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // Verify the token with Supabase
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4023,
        httpStatus: 401,
        message: "Invalid or expired access token"
      });
    }

    const userId = userData.user.id;

    // Get 2FA status from 'users' table
    const { data: securityData, error: fetchError } = await supabase
      .from("users")
      .select("twofactorenabled")
      .eq("userId", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching 2FA data:", fetchError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5017,
        httpStatus: 500,
        message: "Error fetching 2FA settings"
      });
    }

    // Check biometric device registration
    const { data: biometricEntry, error: biometricError } = await supabase
      .from("biometric_security")
      .select("id")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (biometricError) {
      console.error("Error fetching biometric data:", biometricError);
      return res.status(500).json({
        error: true,
        success: false,
        code: 5019,
        httpStatus: 500,
        message: "Error checking biometric settings"
      });
    }

    const isRegisterBiometric = !!biometricEntry;

    return res.status(200).json({
      error: false,
      success: true,
      code: 2014,
      httpStatus: 200,
      message: "Security settings retrieved successfully",
      payload: {
        userId,
        twoFactorEnabled: securityData?.twofactorenabled || false,
        biometricEnabled : isRegisterBiometric,
      }
    });
  } catch (error) {
    console.error("Security settings retrieval error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5018,
      httpStatus: 500,
      message: "Server error while retrieving security settings"
    });
  }
});

export default router
