import './util/module-alias';

import bodyParser from 'body-parser';
import expressPinoLogger from 'express-pino-logger';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { Application } from 'express';
import { Server } from '@overnightjs/core';

import { OpenApiValidator } from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

import * as database from '@src/database';

import { ForecastController } from '@src/controllers/forecast';
import { BeachController } from '@src/controllers/beach';
import { UserController } from '@src/controllers/user';
import { apiErrorValidator } from '@src/middlewares/api-error-validator';

import apiSchema from '@src/api.schema.json';
import logger from '@src/logger';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.setupDocs();
    this.setupControllers();
    await this.setupDatabase();
    this.setupErrorHandlers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    this.app.use(expressPinoLogger({ logger }));
    this.app.use(cors({ origin: '*' }));
  }

  private setupControllers(): void {
    this.addControllers([
      new ForecastController(),
      new BeachController(),
      new UserController(),
    ]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  private async setupDocs(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));

    await new OpenApiValidator({
      apiSpec: apiSchema as OpenAPIV3.Document,
      validateRequests: true,
      validateResponses: true,
    }).install(this.app);
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  public getApp(): Application {
    return this.app;
  }

  public async stop(): Promise<void> {
    await database.close();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }
}
