import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flutter Auth API",
      version: "1.0.0",
      description: "API documentation for Flutter Authentication Server"
    },
    components: {
      schemas: {
        BaseResponse: {
          type: "object",
          properties: {
            error: { 
              type: "boolean",
              description: "Indicates if there was an error"
            },
            success: { 
              type: "boolean",
              description: "Indicates if the operation was successful"
            },
            code: { 
              type: "integer",
              description: "Custom response code"
            },
            httpStatus: { 
              type: "integer",
              description: "HTTP status code"
            },
            message: { 
              type: "string",
              description: "Response message"
            },
            payload: { 
              type: "object",
              description: "Response data"
            },
            meta: { 
              type: "object",
              description: "Additional metadata"
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: "Bad Request",
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BaseResponse'
              },
              example: {
                error: true,
                success: false,
                code: 1001,
                httpStatus: 400,
                message: "Invalid request parameters"
              }
            }
          }
        },
        Unauthorized: {
          description: "Unauthorized",
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BaseResponse'
              },
              example: {
                error: true,
                success: false,
                code: 4001,
                httpStatus: 401,
                message: "Authentication required"
              }
            }
          }
        },
        ServerError: {
          description: "Server Error",
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BaseResponse'
              },
              example: {
                error: true,
                success: false,
                code: 5001,
                httpStatus: 500,
                message: "Internal server error"
              }
            }
          }
        }
      }
    }
  },
  apis: ['./swagger-docs/*.js'] // Path to the API docs
}

const specs = swaggerJsdoc(options)

export default { swaggerUi, specs }
