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

/**
 * @swagger
 * /api/auth/enable-2fa:
 *   post:
 *     summary: Enable Two-Factor Authentication - Step 1
 *     description: Initiates 2FA setup by generating a secret
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2010
 *                     httpStatus: 200
 *                     message: "2FA setup initiated"
 *                     payload:
 *                       secret: "ABCDEFGHIJKLMNOP"
 *                       otpauth_url: "otpauth://totp/FlutterAuthApp:user-id?secret=ABCDEFGHIJKLMNOP&issuer=FlutterAuthApp"
 *                       userId: "user-uuid"
 *       401:
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
 *                     code: 4010
 *                     httpStatus: 401
 *                     message: "Invalid or expired access token"
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
 *                     code: 5010
 *                     httpStatus: 500
 *                     message: "Failed to save TOTP secret"
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Enable Two-Factor Authentication - Step 2
 *     description: Verifies OTP and completes 2FA setup
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
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Current password of the user
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP from Google Authenticator
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2011
 *                     httpStatus: 200
 *                     message: "2FA has been enabled successfully"
 *       400:
 *         description: Missing required fields or 2FA not initiated
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4013
 *                     httpStatus: 400
 *                     message: "2FA setup not initiated or expired"
 *       401:
 *         description: Invalid credentials or OTP
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4014
 *                     httpStatus: 401
 *                     message: "Invalid OTP code"
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
 *                     code: 5012
 *                     httpStatus: 500
 *                     message: "Failed to enable 2FA"
 */

/**
 * @swagger
 * /api/auth/disable-2fa:
 *   post:
 *     summary: Disable Two-Factor Authentication
 *     description: Disables 2FA for a user after verifying credentials and OTP
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
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Current password of the user
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP from Google Authenticator
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2012
 *                     httpStatus: 200
 *                     message: "2FA has been disabled successfully"
 *       400:
 *         description: Missing required fields or 2FA not enabled
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4016
 *                     httpStatus: 400
 *                     message: "2FA is not enabled for this account"
 *       401:
 *         description: Invalid credentials or OTP
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4017
 *                     httpStatus: 401
 *                     message: "Invalid OTP code"
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
 *                     code: 5014
 *                     httpStatus: 500
 *                     message: "Failed to disable 2FA"
 */

/**
 * @swagger
 * /api/auth/login-with-otp:
 *   post:
 *     summary: Login with OTP for 2FA-enabled accounts
 *     description: For accounts with 2FA enabled, this endpoint must be used instead of the regular login
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
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP from Google Authenticator
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
 *                     code: 2013
 *                     httpStatus: 200
 *                     message: "Login successful"
 *                     payload:
 *                       session:
 *                         access_token: "your-access-token"
 *                         expires_at: 1620000000
 *                       user:
 *                         id: "user-uuid"
 *                         email: "user@example.com"
 *                         name: "John Doe"
 *       400:
 *         description: Missing required fields or 2FA not enabled
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4020
 *                     httpStatus: 400
 *                     message: "2FA is not enabled for this account. Use the regular login endpoint."
 *       401:
 *         description: Invalid credentials or OTP
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4021
 *                     httpStatus: 401
 *                     message: "Invalid OTP code"
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
 *                     code: 5016
 *                     httpStatus: 500
 *                     message: "Server error during login with OTP"
 */
