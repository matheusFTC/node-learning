import { Controller, Get } from '@overnightjs/core';
import { Request, Response } from 'express';

import { ForecastService } from '@src/services/forecast';
import { Beach } from '@src/models/beach';

@Controller('forecast')
export class ForecastController {
  constructor(protected forecastService = new ForecastService()) {}

  @Get('')
  public async get(_: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({});
      const forecast = await this.forecastService.processForecastForBeaches(
        beaches
      );
      res.status(200).send(forecast);
    } catch (error) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
