import { Request, Response } from 'express';
import { staffService, StaffService } from '../services/staff.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { CreateStaffBody, SetScheduleBody, UpdateStaffBody } from '../validators/staff.validator';

export class StaffController {
  constructor(private readonly service: StaffService = staffService) {}

  list = catchAsync(async (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).json({ success: true, data: await this.service.listStaff() });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as CreateStaffBody;
    const data = await this.service.createStaff({
      userId: b.user_id,
      role: b.role,
      employeeId: b.employee_id,
      joinDate: b.join_date,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as UpdateStaffBody;
    const data = await this.service.updateStaff(req.params.id, {
      role: b.role,
      employeeId: b.employee_id,
      isActive: b.is_active,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  listSchedules = catchAsync(async (req: Request, res: Response) => {
    const data = await this.service.listSchedules(req.params.id);
    res.status(HttpStatus.OK).json({ success: true, data });
  });

  setSchedule = catchAsync(async (req: Request, res: Response) => {
    const b = req.body as SetScheduleBody;
    const data = await this.service.setSchedule(req.params.id, {
      workDate: b.work_date,
      shiftStart: b.shift_start,
      shiftEnd: b.shift_end,
      notes: b.notes,
    });
    res.status(HttpStatus.OK).json({ success: true, data });
  });
}

export const staffController = new StaffController();
