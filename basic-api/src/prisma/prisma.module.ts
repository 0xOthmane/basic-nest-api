import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [],
  providers: [PrismaService],
})
export class PrismaModule {}
