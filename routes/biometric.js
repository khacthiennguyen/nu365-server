import express from "express"
import { supabase } from "../server.js"

const router = express.Router()

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        success: false,
        code: 4022,
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
        code: 4023,
        httpStatus: 401,
        message: "Invalid or expired access token"
      });
    }

    // Add user data to request object
    req.user = userData.user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      error: true,
      success: false,
      code: 5020,
      httpStatus: 500,
      message: "Server error during authentication"
    });
  }
};

// Enable biometric
router.post("/enable", verifyToken, async (req, res) => {
  try {
    const { deviceId, deviceModel, devicePlatform } = req.body;
    const userId = req.user.id; // Lấy userId từ thông tin người dùng đã xác thực

    if (!deviceId || !deviceModel || !devicePlatform) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1101,
        httpStatus: 400,
        message: "Missing required fields",
        payload: {
          required: ["deviceId", "deviceModel", "devicePlatform"],
          received: Object.keys(req.body)
        }
      })
    }

    // Kiểm tra xem thiết bị đã được đăng ký chưa
    const { data: existingRecord } = await supabase
      .from("biometric_security")
      .select("id")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .single();

    if (existingRecord) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4104,
        httpStatus: 400,
        message: "Biometric record already exists for this device"
      });
    }

    // Insert vào bảng biometric_security
    const { error: insertError } = await supabase
      .from("biometric_security")
      .insert({
        user_id: userId,
        device_id: deviceId,
        device_model: deviceModel,
        device_platform: devicePlatform 
      })

    if (insertError) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4101,
        httpStatus: 400,
        message: insertError.message
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
router.post("/disable", verifyToken, async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.id; // Lấy userId từ thông tin người dùng đã xác thực

    if (!deviceId) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1102,
        httpStatus: 400,
        message: "Missing required fields",
        payload: {
          required: ["deviceId"],
          received: Object.keys(req.body)
        }
      })
    }

    // Xóa bản ghi biometric trong bảng biometric_security
    const { error: deleteError } = await supabase
      .from("biometric_security")
      .delete()
      .eq("user_id", userId)
      .eq("device_id", deviceId)

    if (deleteError) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 4103,
        httpStatus: 400,
        message: deleteError.message
      })
    }

    // Kiểm tra xem người dùng còn thiết bị sinh trắc học nào không
    const { data: remainingDevices } = await supabase
      .from("biometric_security")
      .select("id")
      .eq("user_id", userId);

    if (remainingDevices.length === 0) {
      // Nếu không còn thiết bị sinh trắc học nào, không cần cập nhật lại bảng users nữa
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
