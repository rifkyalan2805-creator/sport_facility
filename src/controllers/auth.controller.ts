import { Request, Response } from 'express';
import { authService, AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { HttpStatus } from '../utils/httpStatus';
import { LoginBody, RefreshBody, RegisterBody } from '../validators/auth.validator';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as RegisterBody;
    const result = await this.service.register({
      email: body.email,
      phone: body.phone,
      fullName: body.full_name,
      password: body.password,
      ip: req.ip,
      userAgent: req.header('user-agent') ?? undefined,
    });
    res.status(HttpStatus.CREATED).json({ success: true, data: result });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as LoginBody;
    const result = await this.service.login({
      email: body.email,
      password: body.password,
      ip: req.ip,
      userAgent: req.header('user-agent') ?? undefined,
    });
    res.status(HttpStatus.OK).json({ success: true, data: result });
  });

  refresh = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as RefreshBody;
    const tokens = await this.service.refresh(
      body.refresh_token,
      req.ip,
      req.header('user-agent') ?? undefined
    );
    res.status(HttpStatus.OK).json({ success: true, data: tokens });
  });

  logout = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as RefreshBody;
    await this.service.logout(body.refresh_token);
    res.status(HttpStatus.OK).json({ success: true, message: 'Logout berhasil' });
  });

  me = catchAsync(async (req: Request, res: Response) => {
    const user = await this.service.me(req.userId!);
    res.status(HttpStatus.OK).json({ success: true, data: user });
  });
}

export const authController = new AuthController();
