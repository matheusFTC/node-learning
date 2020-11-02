import './util/module-alias';

import bodyParser from 'body-parser';

import { Application } from 'express';
import { Server } from '@overnightjs/core';

import { ForecastController } from '@src/controllers/forecast';

export class SetupServer extends Server {

  constructor(private port = 3000) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {
    this.addControllers([
      new ForecastController()
    ]);
  }

  public getApp(): Application {
    return this.app;
  }
}
