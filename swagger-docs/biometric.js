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
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - deviceModel
 *               - devicePlatform
 *             properties:
 *               deviceId:
 *                 type: string
 *                 description: Unique device identifier
 *               deviceModel:
 *                 type: string
 *                 description: Device model (e.g., iPhone 14 Pro Max)
 *               devicePlatform:
 *                 type: string
 *                 description: Device platform (e.g., iOS, Android)
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
 *                       required: ["deviceId", "deviceModel", "devicePlatform"]
 *                       received: []
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
 *                     code: 4022
 *                     httpStatus: 401
 *                     message: "Authorization token is required"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4023
 *                     httpStatus: 401
 *                     message: "Invalid or expired access token"
 */


/**
 * @swagger
 * /api/biometric/disable:
 *   post:
 *     summary: Disable biometric authentication
 *     tags: [Biometric]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *             properties:
 *               deviceId:
 *                 type: string
 *                 description: Unique device identifier
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
 *                     message: "Missing required fields"
 *                     payload:
 *                       required: ["deviceId"]
 *                       received: []
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
 *                     code: 4022
 *                     httpStatus: 401
 *                     message: "Authorization token is required"
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4023
 *                     httpStatus: 401
 *                     message: "Invalid or expired access token"
 */
