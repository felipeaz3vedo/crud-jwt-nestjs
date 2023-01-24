import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParamId = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    return Number(context.switchToHttp().getRequest().params.id);
  },
);
