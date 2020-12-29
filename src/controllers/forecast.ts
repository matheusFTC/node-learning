import rateLimit from 'express-rate-limit';

import {
  Controller,
  Get,
  ClassMiddleware,
  Middleware,
} from '@overnightjs/core';
import { Request, Response } from 'express';

import { BaseController } from '.';

import { ForecastService } from '@src/services/forecast';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';

import ApiError from '@src/util/errors/api-error';

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator(req: Request): string {
    return req.ip;
  },
  handler(_, res: Response): void {
    res
      .status(429)
      .send(
        ApiError.format({
          code: 429,
          message: 'To many resquest to the forecast endpoint',
        })
      );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(protected forecastService = new ForecastService()) {
    super();
  }

  @Get()
  @Middleware(rateLimiter)
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
