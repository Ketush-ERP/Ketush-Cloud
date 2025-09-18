import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.user) {
    throw new InternalServerErrorException(
      '[AuthGuard] User not found in request',
    );
  }

  return request.user;
});
