import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.user && filter) {
      return request.user[filter];
    } else if (request.user) {
      return request.user;
    }

    throw new NotFoundException(
      'Usuário não encontrado, use o AuthGuard para obter o usuário',
    );
  },
);
