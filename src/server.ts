import './util/module-alias';

import bodyParser from 'body-parser';

import { Application } from 'express';
import { Server } from '@overnightjs/core';

import * as database from '@src/database';

import { ForecastController } from '@src/controllers/forecast';
import { BeachController } from '@src/controllers/beach';

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
  }

  private setupControllers(): void {
    this.addControllers([new ForecastController(), new BeachController()]);
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }
}
