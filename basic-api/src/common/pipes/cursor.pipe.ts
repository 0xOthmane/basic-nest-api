import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isInt, isString } from 'class-validator';

export interface CursorQueryParams {
  cursor?: string;
  limit: number;
}

@Injectable()
export class CursorPipe implements PipeTransform {
  transform(value: Record<string, string>): CursorQueryParams {
    const cursor = value.cursor ? parseInt(value.cursor, 10) : undefined;
    const limit = Math.min(parseInt(value.limit ?? '20', 10), 100);

    if (isNaN(limit) || limit <= 0) {
      throw new BadRequestException('Limit must be a positive integer');
    }

    if (cursor !== undefined && !isString(cursor)) {
      throw new BadRequestException('Cursor must be a non-negative integer');
    }

    return { cursor, limit };
  }
}
