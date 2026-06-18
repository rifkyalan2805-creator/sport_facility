import { Prisma, item_type } from '@prisma/client';

/** Representasi minimal sebuah item pembayaran untuk keperluan fulfilment. */
export interface FulfillmentItem {
  itemType: item_type;
  itemId: string;
  quantity: number;
}

/**
 * Kontrak fulfilment per `item_type`. Setiap modul berbayar (booking,
 * membership, pool_ticket, ticket, ...) menyediakan satu handler yang
 * memegang repository-nya sendiri, sehingga PaymentService tidak perlu
 * bergantung langsung pada repository tiap modul.
 *
 * Semua method dijalankan DI DALAM transaksi pembayaran (tx diberikan).
 */
export interface FulfillmentHandler {
  readonly itemType: item_type;
  /** Dipanggil saat pembayaran LUNAS. */
  onPaid(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void>;
  /** Dipanggil saat pembayaran GAGAL (mis. lepas reservasi). */
  onFailed(item: FulfillmentItem, tx: Prisma.TransactionClient): Promise<void>;
}
