import { z } from 'zod';

export const upsertSettingSchema = z.object({
  value: z.unknown().refine((v) => v !== undefined, { message: 'value wajib diisi' }),
});

export const settingKeyParamSchema = z.object({
  key: z.string().min(1).max(100),
});

export type UpsertSettingBody = z.infer<typeof upsertSettingSchema>;
