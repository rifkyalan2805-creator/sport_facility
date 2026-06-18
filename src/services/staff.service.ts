import { Prisma, staff_role } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { timeToDate } from '../utils/time';
import { StaffRepository, staffRepository } from '../repositories/staff.repository';
import {
  StaffScheduleRepository,
  staffScheduleRepository,
} from '../repositories/staffSchedule.repository';
import { UserRepository, userRepository } from '../repositories/user.repository';

interface CreateStaffInput {
  userId: string;
  role: staff_role;
  employeeId?: string;
  joinDate: string;
}
interface UpdateStaffInput {
  role?: staff_role;
  employeeId?: string;
  isActive?: boolean;
}
interface SetScheduleInput {
  workDate: string;
  shiftStart: string;
  shiftEnd: string;
  notes?: string;
}

export class StaffService {
  constructor(
    private readonly staff: StaffRepository = staffRepository,
    private readonly schedules: StaffScheduleRepository = staffScheduleRepository,
    private readonly users: UserRepository = userRepository
  ) {}

  listStaff() {
    return this.staff.listAll();
  }

  async getStaff(id: string) {
    const s = await this.staff.findById(id);
    if (!s) throw AppError.notFound('Staff tidak ditemukan');
    return s;
  }

  async createStaff(input: CreateStaffInput) {
    const user = await this.users.findById(input.userId);
    if (!user) throw AppError.notFound('User tidak ditemukan');
    const existing = await this.staff.findByUserId(input.userId);
    if (existing) throw AppError.conflict('User ini sudah terdaftar sebagai staff');

    const data: Prisma.staffUncheckedCreateInput = {
      user_id: input.userId,
      role: input.role,
      employee_id: input.employeeId ?? null,
      join_date: new Date(input.joinDate),
    };
    return this.staff.create(data);
  }

  async updateStaff(id: string, input: UpdateStaffInput) {
    await this.getStaff(id);
    const data: Prisma.staffUncheckedUpdateInput = {};
    if (input.role !== undefined) data.role = input.role;
    if (input.employeeId !== undefined) data.employee_id = input.employeeId;
    if (input.isActive !== undefined) data.is_active = input.isActive;
    return this.staff.update(id, data);
  }

  async listSchedules(staffId: string) {
    await this.getStaff(staffId);
    return this.schedules.listByStaff(staffId);
  }

  async setSchedule(staffId: string, input: SetScheduleInput) {
    await this.getStaff(staffId);
    return this.schedules.upsert(staffId, new Date(input.workDate), {
      shift_start: timeToDate(input.shiftStart),
      shift_end: timeToDate(input.shiftEnd),
      notes: input.notes ?? null,
    });
  }
}

export const staffService = new StaffService();
