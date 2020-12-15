import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

import { BaseController } from '.';

import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middlewares/auth';

import logger from '@src/logger';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachController extends BaseController {
  @Post()
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const data = {
        ...req.body,
        user: req.decoded?.id,
      };
      const beach = new Beach(data);
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      logger.error(error);

      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
