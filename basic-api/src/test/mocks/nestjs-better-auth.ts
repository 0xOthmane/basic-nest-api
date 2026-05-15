import { createParamDecorator, type DynamicModule, type ExecutionContext } from '@nestjs/common';

export interface UserSession {
  user: {
    id: string;
    email?: string;
    name?: string;
    role?: string | string[];
  };
  session: {
    id?: string;
    userId?: string;
    token?: string;
    expiresAt?: Date;
    activeOrganizationId?: string;
  };
}

export const Session = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest().session,
);

export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      module: AuthModule,
    };
  }
}