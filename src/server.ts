import './util/module-alias';

import bodyParser from 'body-parser';
import expressPinoLogger from 'express-pino-logger';
import cors from 'cors';

import { Application } from 'express';
import { Server } from '@overnightjs/core';

import * as database from '@src/database';

import { ForecastController } from '@src/controllers/forecast';
import { BeachController } from '@src/controllers/beach';
import { UserController } from './controllers/user';

import logger from './logger';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();

    await this.setupDatabase();
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
