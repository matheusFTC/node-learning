import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';

import { ForecastService } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController {
  constructor(protected forecastService = new ForecastService()) {}

  @Get()
  public async get(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecast = await this.forecastService.processForecastForBeaches(
        beaches
      );
      res.status(200).send(forecast);
    } catch (error) {
      res.status(500).send({ error: 'Something went wrong' });
    }
  }
}
