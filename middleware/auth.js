import { supabase } from "../server.js"

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token is required" })
    }

    const token = authHeader.split(" ")[1]

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    // Attach the user to the request (only safe data)
    req.user = {
      id: data.user.id,
      email: data.user.email,
      // Add other non-sensitive user data as needed
    }

    next()
  } catch (error) {
    console.error("Authentication error:", error)
    return res.status(500).json({ error: "Server error during authentication" })
  }
}
