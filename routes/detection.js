// routes/detection.js
import express from 'express'
import multer from 'multer'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import sharp from 'sharp'

const router = express.Router()

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

// Define endpoint for image detection
router.post('/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        success: false,
        code: 1301,
        httpStatus: 400,
        message: "No image file provided"
      })
    }

    const imagePath = req.file.path
    const roboflowApiKey = process.env.ROBOFLOW_API_KEY 
    
    // Resize image to exactly 640x640 pixels
    const resizedImagePath = imagePath + '_resized.jpg'
    await sharp(imagePath)
      .resize({
        width: 640,
        height: 640,
        fit: sharp.fit.cover,  // Crop to fill the exact dimensions
        position: sharp.strategy.attention // Focus on the most important part of the image
      })
      .toFile(resizedImagePath)
    
    // Read the resized file as a buffer
    const imageBuffer = fs.readFileSync(resizedImagePath)
    
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')
    
    // Use the correct Roboflow Workflows API endpoint
    const response = await axios({
      method: 'POST',
      url: 'https://serverless.roboflow.com/infer/workflows/k5vers-vision/nu365',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        api_key: roboflowApiKey,
        inputs: {
          "image": {
            "type": "base64",
            "value": base64Image
          }
        }
      }
    })

    // Delete the original and resized image files after sending
    fs.unlinkSync(imagePath)
    fs.unlinkSync(resizedImagePath)

    // Return the response to the client
    return res.status(200).json({
      error: false,
      success: true,
      code: 2301,
      httpStatus: 200,
      message: "Image detection successful",
      payload: response.data
    })
  } catch (error) {
    console.error("Image detection error:", error)
    
    // Clean up the image files if they exist
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    const resizedPath = req.file?.path + '_resized.jpg'
    if (resizedPath && fs.existsSync(resizedPath)) {
      fs.unlinkSync(resizedPath)
    }
    
    return res.status(500).json({
      error: true,
      success: false,
      code: 5301,
      httpStatus: 500,
      message: "Server error during image detection",
      payload: error.message
    })
  }
})

export default router