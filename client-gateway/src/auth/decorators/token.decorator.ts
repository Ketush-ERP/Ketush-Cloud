import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const Token = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.token) {
    throw new InternalServerErrorException(
      '[AuthGuard] Token not found in request',
    );
  }

  return request.token;
});
