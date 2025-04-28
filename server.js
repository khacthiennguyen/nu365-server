import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"
import authRoutes from "./routes/auth.js"
import verificationRoutes from "./routes/verification.js"
import biometricRoutes from "./routes/biometric.js"
import detectionRoutes from "./routes/detection.js"
import swagger from "./swagger.js"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase client
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

// Swagger UI
app.use("/api-docs", swagger.swaggerUi.serve, swagger.swaggerUi.setup(swagger.specs))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/verification", verificationRoutes)
app.use("/api/biometric", biometricRoutes)
app.use("/api/detection", detectionRoutes)

// Root route
app.get("/", (req, res) => {
  res.send('Flutter Auth API Server is running. Visit <a href="/api-docs">API Documentation</a>')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`)
})

