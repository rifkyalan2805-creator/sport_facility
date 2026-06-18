import { court_type } from '@prisma/client';

export interface CreateCourtInput {
  name: string;
  code: string;
  type: court_type;
  pricePerHour: number;
  capacity: number;
  isIndoor: boolean;
  facilities: string[];
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

// Semua opsional — hanya field yang dikirim yang diupdate.
export interface UpdateCourtInput {
  name?: string;
  code?: string;
  type?: court_type;
  pricePerHour?: number;
  capacity?: number;
  isIndoor?: boolean;
  facilities?: string[];
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface SetScheduleInput {
  dayOfWeek: number; // 0=Minggu .. 6=Sabtu
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isHolidayClosed: boolean;
}
