import { applyDecorators, Delete, HttpCode, HttpStatus } from '@nestjs/common';

export const DeleteRoute = () =>
  applyDecorators(Delete(':id'), HttpCode(HttpStatus.NO_CONTENT));
