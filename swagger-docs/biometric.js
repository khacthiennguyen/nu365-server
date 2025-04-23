/**
 * @swagger
 * tags:
 *   name: Biometric
 *   description: Biometric authentication endpoints
 */

/**
 * @swagger
 * /api/biometric/enable:
 *   post:
 *     summary: Enable biometric authentication
 *     tags: [Biometric]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - public_key
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User's ID
 *               public_key:
 *                 type: string
 *                 description: Biometric public key
 *     responses:
 *       200:
 *         description: Biometric enabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2101
 *                     httpStatus: 200
 *                     message: "Biometric authentication enabled successfully"
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
 *                     code: 1101
 *                     httpStatus: 400
 *                     message: "Missing required fields"
 *                     payload:
 *                       required: ["user_id", "public_key"]
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
 *                     code: 5101
 *                     httpStatus: 500
 *                     message: "Server error while enabling biometric"
 */

/**
 * @swagger
 * /api/biometric/verify:
 *   post:
 *     summary: Verify biometric authentication
 *     tags: [Biometric]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - signature
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               signature:
 *                 type: string
 *                 description: Biometric signature
 *     responses:
 *       200:
 *         description: Biometric verification successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2103
 *                     httpStatus: 200
 *                     message: "Biometric verification successful"
 *                     payload:
 *                       session:
 *                         access_token: "your-access-token"
 *                         expires_at: "2025-04-23T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4101
 *                     httpStatus: 401
 *                     message: "Invalid biometric signature"
 */

/**
 * @swagger
 * /api/biometric/disable:
 *   post:
 *     summary: Disable biometric authentication
 *     tags: [Biometric]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User's ID
 *     responses:
 *       200:
 *         description: Biometric disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2102
 *                     httpStatus: 200
 *                     message: "Biometric authentication disabled successfully"
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
 *                     code: 1102
 *                     httpStatus: 400
 *                     message: "User ID is required"
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
 *                     code: 5102
 *                     httpStatus: 500
 *                     message: "Server error while disabling biometric"
 */
