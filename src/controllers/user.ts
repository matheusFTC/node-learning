import mongoose from 'mongoose';

import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';

import { BaseController } from '.';
import { User } from '@src/models/user';

@Controller('users')
export class UserController extends BaseController {
  @Post()
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const result = await user.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error);
    }
  }
}
