import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core/services/reflector.service';
import { auth } from 'src/lib/auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { OwnerOptions, OWNERSHIP_KEY } from './owner.decorator';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    const user = session?.user;

    if (!user) {
      throw new ForbiddenException(
        'You must be logged in to access this resource',
      );
    }
    const options = this.reflector.get<OwnerOptions>(
      OWNERSHIP_KEY,
      context.getHandler(),
    );
    if (!options) return true;

    const { model, field, param } = options;

    const ressourceId = req.params[param || 'id'];

    const ressource = await this.prisma[model].findUnique({
      where: {
        id: ressourceId,
      },
      select: { [field || 'userId']: true },
    });

    if (!ressource) {
      throw new NotFoundException(`${model} with id ${ressourceId} not found`);
    }

    const isOwner = ressource[field || 'userId'] === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) throw new ForbiddenException();

    return true;
  }
}
