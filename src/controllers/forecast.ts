import { Controller, Get, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';

import { BaseController } from '.';

import { ForecastService } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(protected forecastService = new ForecastService()) {
    super();
  }

  @Get()
  public async get(req: Request, res: Response): Promise<void> {
    try {
      const beaches = await Beach.find({ user: req.decoded?.id });
      const forecast = await this.forecastService.processForecastForBeaches(
        beaches
      );
      res.status(200).send(forecast);
    } catch (error) {
      this.sendErrorResponse(
        res,
        { code: 500, message: 'Something went wrong' },
        error
      );
    }
  }
}
