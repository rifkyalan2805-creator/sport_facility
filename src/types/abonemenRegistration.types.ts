import { abonemen_reg_status } from '@prisma/client';

// Input tervalidasi untuk membuat pengajuan registrasi abonemen.
export interface CreateRegistrationInput {
  userId: string;
  packageId: string;
  fullName: string;
  phone: string;
  communicationEmail: string;
  notes?: string;
}

// Filter list untuk admin.
export interface ListRegistrationFilter {
  status?: abonemen_reg_status;
  page: number;
  limit: number;
}

// Keputusan review oleh admin.
export interface ReviewRegistrationInput {
  registrationId: string;
  adminId: string;
  action: 'approve' | 'reject';
  notes?: string;
}
