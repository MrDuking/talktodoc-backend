import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export const setupSwagger = (app: INestApplication): void => {
    const xApiKey = process.env.API_KEY || "default-api-key"
    const xAppId = process.env.GAME_CLIENT_APP_ID || "default-app-id"
    const config = new DocumentBuilder()
        .setTitle("User Service")
        .setDescription(
            "User API Documentation\n\n## Overview\nThis API allows you to interact with the User Service. Below are the available endpoints and their descriptions.\n\n## Authentication\nUse the `x-api-key` and `x-app-id` headers when calling, this is a must."
        )
        .setVersion("1.0")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            "access-token"
        )
        .addGlobalParameters(
            {
                in: "header",
                required: true,
                name: "x-api-key",
                schema: {
                    example: xApiKey
                }
            },
            {
                in: "header",
                required: true,
                name: "x-app-id",
                schema: {
                    example: xAppId
                }
            }
        )
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true
        },
        customCss: `
      /* Base styles */
      body { 
        background-color: #1e1e2e; 
        color: #cdd6f4; 
      }
      .swagger-ui { 
        background-color: #1e1e2e; 
        color: #cdd6f4; 
      }

      /* Header styles */
      .swagger-ui .topbar { 
        background-color: #181825; 
        // padding: 10px 0;
      }
      .swagger-ui .info { 
        margin: 20px 0; 
      }
      .swagger-ui .info .title { 
        color: #89b4fa; 
      }
      .swagger-ui .info .base-url { 
        color: #a6e3a1; 
      }
      .swagger-ui .info .description { 
        color: #bac2de; 
      }

      /* Operation block styles */
      .swagger-ui .opblock { 
        background-color: #313244; 
        border-radius: 8px; 
        margin: 10px 0; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      .swagger-ui .opblock .opblock-summary-method { 
        background-color: #89b4fa; 
        color: #1e1e2e; 
        border-radius: 4px;
      }
      .swagger-ui .opblock .opblock-summary-path { 
        color: #f5e0dc; 
      }
      .swagger-ui .opblock .opblock-summary-description { 
        color: #bac2de; 
      }

      /* Schema styles */
      .swagger-ui .model { 
        color: #cdd6f4; 
      }
      .swagger-ui .property { 
        color: #a6e3a1; 
      }

      /* Response section */
      .swagger-ui .responses-table { 
        background-color: #313244; 
      }
      .swagger-ui .response-col_status { 
        color: #f9e2af; 
      }
    
      .swagger-ui .scheme-container { 
        background: #1e1e2e; 
        margin: 0;
        padding: 0 0 20 0;
      }
    .swagger-ui .scheme-container .auth-wrapper .btn{
        border-radius: 4px;
        background: #edfaff;
        // color: black;
    }

      /* Input fields and buttons */
      .swagger-ui input[type=text], .swagger-ui textarea { 
        background-color: #313244; 
        color: #cdd6f4; 
        border: 1px solid #45475a; 
      }
      .swagger-ui .btn { 
        background-color: #89b4fa; 
        color: #1e1e2e; 
        border: none; 
        border-radius: 4px; 
      }
      .swagger-ui select { 
        background-color: #313244; 
        color: #cdd6f4; 
        border: 1px solid #45475a; 
      }

      /* Code display */
      .swagger-ui .highlight-code { 
        background-color: #282a36; 
      }

      /* Scrollbar */
      ::-webkit-scrollbar {
        width: 10px;
      }
      ::-webkit-scrollbar-track {
        background: #313244;
      }
      ::-webkit-scrollbar-thumb {
        background: #45475a;
        border-radius: 5px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #585b70;
      }
    `
    })
}
