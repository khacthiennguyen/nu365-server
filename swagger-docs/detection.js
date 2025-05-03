/**
 * @swagger
 * tags:
 *   name: Detection
 *   description: Image detection endpoints using Roboflow Workflows API
 */

/**
 * @swagger
 * /api/detection/detect:
 *   post:
 *     summary: Detect objects in an image using Roboflow Workflows
 *     description: Uploads an image, resizes it to 640x640, and sends it as base64 to Roboflow Workflows API for object detection
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
 *                 description: Image file to detect objects in (max size 10MB, only image files allowed)
 *     responses:
 *       200:
 *         description: Image detection successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: object
 *                       description: Roboflow Workflows API response data containing prediction results
 *                   example:
 *                     error: false
 *                     success: true
 *                     code: 2301
 *                     httpStatus: 200
 *                     message: "Image detection successful"
 *                     payload:
 *                       predictions:
 *                         - x: 320
 *                           y: 320
 *                           width: 640
 *                           height: 640
 *                           class: "detected_object"
 *                           confidence: 0.95
 *                       time: 0.123
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
 *                     payload: "Error message details"
 */