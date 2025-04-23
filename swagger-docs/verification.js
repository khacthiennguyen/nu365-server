/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: Two-factor authentication endpoints
 */

/**
 * @swagger
 * /api/verification/enable-2fa:
 *   post:
 *     summary: Enable two-factor authentication
 *     tags: [Verification]
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
 *                     code: 2201
 *                     httpStatus: 200
 *                     message: "2FA enabled successfully"
 *                     payload:
 *                       secret: "JBSWY3DPEHPK3PXP"
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
 *                     code: 1201
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
 *                     code: 5201
 *                     httpStatus: 500
 *                     message: "Server error while enabling 2FA"
 */

/**
 * @swagger
 * /api/verification/verify-2fa:
 *   post:
 *     summary: Verify 2FA token
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - token
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User's ID
 *               token:
 *                 type: string
 *                 description: 2FA verification token (6 digits)
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2202
 *                     httpStatus: 200
 *                     message: "2FA verification successful"
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
 *                     code: 1202
 *                     httpStatus: 400
 *                     message: "User ID and token are required"
 *       401:
 *         description: Invalid token
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 4202
 *                     httpStatus: 401
 *                     message: "Invalid 2FA token"
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
 *                     code: 5202
 *                     httpStatus: 500
 *                     message: "Server error during 2FA verification"
 */
