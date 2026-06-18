import { Prisma } from '@prisma/client';
import { prisma, DbClient } from '../config/prisma';

export class EventRegistrationRepository {
  create(data: Prisma.event_registrationsUncheckedCreateInput, db: DbClient = prisma) {
    return db.event_registrations.create({ data });
  }

  findById(id: string, db: DbClient = prisma) {
    return db.event_registrations.findUnique({ where: { id } });
  }

  findByQr(qrCode: string, db: DbClient = prisma) {
    return db.event_registrations.findUnique({ where: { qr_code: qrCode } });
  }

  findByUserAndEvent(userId: string, eventId: string, db: DbClient = prisma) {
    return db.event_registrations.findUnique({
      where: { user_id_event_id: { user_id: userId, event_id: eventId } },
    });
  }

  findManyByUser(userId: string, db: DbClient = prisma) {
    return db.event_registrations.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: { events: { select: { title: true, event_date: true } } },
    });
  }

  update(
    id: string,
    data: Prisma.event_registrationsUncheckedUpdateInput,
    db: DbClient = prisma
  ) {
    return db.event_registrations.update({ where: { id }, data });
  }
}

export const eventRegistrationRepository = new EventRegistrationRepository();
