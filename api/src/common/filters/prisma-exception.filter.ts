import * as common from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { messageError } from './constants';
import { Prisma } from 'generated/prisma';

export type ErrorCodesStatusMapping = {
  [key: string]: number;
};

@common.Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  /**
   * default error codes mapping
   *
   * Error codes definition for Prisma Client (Query Engine)
   * @see https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
   */
  private errorCodesStatusMapping: ErrorCodesStatusMapping = {
    P2000: common.HttpStatus.BAD_REQUEST,
    P2001: common.HttpStatus.BAD_REQUEST,
    P2002: common.HttpStatus.BAD_REQUEST,
    P2003: common.HttpStatus.BAD_REQUEST,
    P2004: common.HttpStatus.BAD_REQUEST,
    P2005: common.HttpStatus.BAD_REQUEST,
    P2012: common.HttpStatus.BAD_REQUEST,
    P2021: common.HttpStatus.BAD_REQUEST,
    P2025: common.HttpStatus.NOT_FOUND,
  };

  /**
   * @param applicationRef
   * @param errorCodesStatusMapping
   */
  constructor(
    applicationRef?: common.HttpServer,
    errorCodesStatusMapping?: ErrorCodesStatusMapping,
  ) {
    super(applicationRef);

    if (errorCodesStatusMapping) {
      this.errorCodesStatusMapping = Object.assign(
        this.errorCodesStatusMapping,
        errorCodesStatusMapping,
      );
    }
  }

  /**
   * @param exception
   * @param host
   * @returns
   */
  catch(exception: Prisma.PrismaClientKnownRequestError, host: common.ArgumentsHost) {
    console.log('exception: ', exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.catchClientKnownRequestError(exception, host);
    }
  }

  private catchClientKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    host: common.ArgumentsHost,
  ) {
    const statusCode = this.errorCodesStatusMapping[exception.code];

    // eslint-disable-next-line
    const fieldError = Array.isArray(exception.meta?.target)
      ? exception.meta?.target.length > 0
        ? exception.meta?.target[0]
        : ''
      : null;

    // eslint-disable-next-line
    const message = messageError(exception.code, fieldError);

    if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
      return super.catch(exception, host);
    }

    super.catch(
      new common.HttpException(
        {
          statusCode,
          message,
          name: 'PrismaError',
          error: {
            response: {
              code: exception?.code,
              message,
            },
          },
        },
        statusCode,
      ),
      host,
    );
  }
}
