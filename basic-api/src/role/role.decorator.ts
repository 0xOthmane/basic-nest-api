import { SetMetadata } from '@nestjs/common';

export type RoleType = 'USER' | 'ADMIN';

export const ROLES_KEY = 'roles';
export const Role = (...args: RoleType[]) => SetMetadata(ROLES_KEY, args);
