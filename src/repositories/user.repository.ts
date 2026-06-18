import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class UserRepository {
  findByEmail(email: string, db: DbClient = prisma) {
    return db.users.findUnique({ where: { email } });
  }

  findByPhone(phone: string, db: DbClient = prisma) {
    return db.users.findUnique({ where: { phone } });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.users.findUnique({ where: { id } });
  }

  create(data: Prisma.usersUncheckedCreateInput, db: DbClient = prisma) {
    return db.users.create({ data });
  }
}

export const userRepository = new UserRepository();
