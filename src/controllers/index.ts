import mongoose from 'mongoose';

import { Response } from 'express';

import { CUSTOM_VALIDATION } from '@src/models/user';
import ApiError, { APIError } from '@src/util/errors/api-error';
import logger from '@src/logger';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    let code;
    let message;

    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      logger.error(clientErrors.error);
      code = clientErrors.code;
      message = clientErrors.error;
    } else {
      logger.error(error);
      code = 500;
      message = 'Something went wrong';
    }

    const apiError: APIError = { code, message };

    res.status(apiError.code).send(ApiError.format(apiError));
  }

  private handleClientErrors(
    error: mongoose.Error.ValidationError
  ): { code: number; error: string } {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 400, error: error.message };
  }

  protected sendErrorResponse(
    res: Response,
    apiError: APIError,
    error?: mongoose.Error.ValidationError | Error
  ): Response {
    if (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        const clientErrors = this.handleClientErrors(error);
        logger.error(clientErrors.error);
      } else {
        logger.error(error);
      }
    }

    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
