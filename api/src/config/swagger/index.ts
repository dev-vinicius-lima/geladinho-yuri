import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ENV_CONFIG } from '../envConfig';

const configSwagger = (app: INestApplication<any>) => {
  // Swagger
  const config = new DocumentBuilder()
    .setTitle(ENV_CONFIG.SWAGGER_TITLE)
    .setDescription(ENV_CONFIG.SWAGGER_DESCRIPTION)
    .setVersion(ENV_CONFIG.SWAGGER_VERSION)
    .addServer(ENV_CONFIG.SWAGGER_API_URL)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(ENV_CONFIG.SWAGGER_ENDPOINT, app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
};

export { configSwagger };
