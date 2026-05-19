import { SetMetadata } from '@nestjs/common';

export const OWNERSHIP_KEY = 'ownership';

export type OwnerOptions = {
  model: string;
  field?: string;
  param?: string;
};

export const Owner = (options: OwnerOptions) =>
  SetMetadata(OWNERSHIP_KEY, options);
