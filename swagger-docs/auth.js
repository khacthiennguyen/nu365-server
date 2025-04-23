/**
 * @swagger
 * components:
 *   schemas:
 *     BaseResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: boolean
 *           description: Indicates if there was an error
 *         success:
 *           type: boolean
 *           description: Operation success status
 *         code:
 *           type: integer
 *           description: Custom response code
 *         httpStatus:
 *           type: integer
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Response message
 *         payload:
 *           type: object
 *           description: Response data payload
 *         meta:
 *           type: object
 *           description: Additional metadata
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2001
 *                     httpStatus: 201
 *                     message: "Registration successful. Please check your email for verification."
 *                     payload:
 *                       id: "user-uuid"
 *                       email: "user@example.com"
 *                       name: "John Doe"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 1001
 *                     httpStatus: 400
 *                     message: "Missing required fields"
 *                     payload:
 *                       required: ["email", "password", "name"]
 *                       received: []
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 5001
 *                     httpStatus: 500
 *                     message: "Server error during registration"
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2002
 *                     httpStatus: 200
 *                     message: "Login successful"
 *                     payload:
 *                       session:
 *                         access_token: "your-access-token"
 *                         expires_at: "2025-04-23T12:00:00Z"
 *                       user:
 *                         id: "user-uuid"
 *                         email: "user@example.com"
 *                         name: "John Doe"
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4001
 *                     httpStatus: 400
 *                     message: "Invalid login credentials"
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2003
 *                     httpStatus: 200
 *                     message: "Logout successful"
 */
