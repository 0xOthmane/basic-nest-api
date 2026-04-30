import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export interface PaginationQueryParams {
  page: number;
  limit: number;
  skip: number;
}

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: Record<string, string>): PaginationQueryParams {
    const page = parseInt(value.page, 10) || 1;
    const limit = Math.min(parseInt(value.limit, 10) || 10, 100);

    if (isNaN(page) || page <= 0) {
      throw new BadRequestException('Page must be a positive integer');
    }

    if (isNaN(limit) || limit <= 0) {
      throw new BadRequestException('Limit must be a positive integer');
    }
    return { page, limit, skip: (page - 1) * limit };
  }
}
