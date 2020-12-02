import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

import { BaseController } from '.';
import { Beach } from '../models/beach';

@Controller('beaches')
export class BeachController extends BaseController {
  @Post()
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach(req.body);
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
