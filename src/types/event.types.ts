import { event_status } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  color?: string;
  icon?: string;
}

export interface CreateEventInput {
  categoryId: string;
  title: string;
  slug?: string;
  description?: string;
  bannerUrl?: string;
  eventDate: Date;
  endDate?: Date;
  location?: string;
  quota: number;
  price: number;
  organizerName?: string;
  minParticipants: number;
  registrationDeadline?: Date;
  status: event_status;
}

export interface UpdateEventInput {
  categoryId?: string;
  title?: string;
  slug?: string;
  description?: string;
  bannerUrl?: string;
  eventDate?: Date;
  endDate?: Date;
  location?: string;
  quota?: number;
  price?: number;
  organizerName?: string;
  minParticipants?: number;
  registrationDeadline?: Date;
  status?: event_status;
}

export interface RegisterEventInput {
  userId: string;
  eventId: string;
}

export interface CancelRegistrationInput {
  id: string;
  userId: string;
}

export interface ScanRegistrationInput {
  qrCode: string;
}
