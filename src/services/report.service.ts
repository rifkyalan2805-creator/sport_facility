import {
  OccupancyLogRepository,
  occupancyLogRepository,
} from '../repositories/occupancyLog.repository';

interface RecordOccupancyInput {
  courtId: string;
  logDate: string;
  hourSlot: number;
  isOccupied: boolean;
  bookingId?: string;
}

export class ReportService {
  constructor(private readonly occupancy: OccupancyLogRepository = occupancyLogRepository) {}

  recordOccupancy(input: RecordOccupancyInput) {
    return this.occupancy.upsert(input.courtId, new Date(input.logDate), input.hourSlot, {
      is_occupied: input.isOccupied,
      booking_id: input.bookingId ?? null,
    });
  }

  /** Occupancy harian satu court + ringkasan jumlah jam terpakai. */
  async getOccupancy(courtId: string, date: string) {
    const logs = await this.occupancy.listByCourtDate(courtId, new Date(date));
    const occupiedHours = logs.filter((l) => l.is_occupied).length;
    return { date, court_id: courtId, occupied_hours: occupiedHours, slots: logs };
  }
}

export const reportService = new ReportService();
