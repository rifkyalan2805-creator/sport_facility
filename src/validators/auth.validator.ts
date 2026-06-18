import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid').max(255),
  phone: z
    .string()
    .regex(/^[0-9+()\-\s]{8,20}$/, 'Nomor telepon tidak valid')
    .max(20),
  full_name: z.string().min(2, 'Nama minimal 2 karakter').max(150),
  password: z.string().min(8, 'Password minimal 8 karakter').max(100),
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token wajib diisi'),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshBody = z.infer<typeof refreshSchema>;
