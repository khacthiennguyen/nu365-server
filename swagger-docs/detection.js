/**
 * @swagger
 * tags:
 *   name: Detection
 *   description: Image detection endpoints using Roboflow API
 */

/**
 * @swagger
 * /api/detection/detect:
 *   post:
 *     summary: Detect objects in an image
 *     tags: [Detection]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to detect objects in
 *     responses:
 *       200:
 *         description: Image detection successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2301
 *                     httpStatus: 200
 *                     message: "Image detection successful"
 *                     payload:
 *                       predictions:
 *                         - label: "apple"
 *                           confidence: 0.95
 *                           x: 125
 *                           y: 150
 *                           width: 50
 *                           height: 50
 *                         - label: "banana"
 *                           confidence: 0.88
 *                           x: 200
 *                           y: 100
 *                           width: 60
 *                           height: 30
 *                       image:
 *                         width: 640
 *                         height: 480
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   example:
 *                     error: true
 *                     success: false
 *                     code: 1301
 *                     httpStatus: 400
 *                     message: "No image file provided"
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
 *                     code: 4001
 *                     httpStatus: 401
 *                     message: "Authorization token is required"
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
 *                     code: 5301
 *                     httpStatus: 500
 *                     message: "Server error during image detection"
 */