export interface JoinWaitingListInput {
  userId: string;
  courtId: string;
  preferredDate: string; // YYYY-MM-DD
  preferredStart: string; // HH:mm
  preferredEnd: string; // HH:mm
}

export interface CancelWaitingInput {
  id: string;
  userId: string;
}
