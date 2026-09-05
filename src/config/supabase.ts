import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Client Supabase khusus backend — memakai service role / secret key yang
 * MEM-BYPASS seluruh Row Level Security. Jangan pernah diekspor ke `web/`.
 *
 * Dipakai hanya untuk Storage (foto member); database tetap Postgres lokal
 * lewat Prisma. Sesi tidak dipersist karena request server bersifat stateless.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
