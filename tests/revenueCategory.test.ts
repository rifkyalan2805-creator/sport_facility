import { resolveCategory } from '../src/utils/revenueCategory';

describe('resolveCategory', () => {
  it('booking dipetakan via court type (paddle → Padel, bukan "padel")', () => {
    expect(resolveCategory({ itemType: 'booking', courtType: 'paddle' })).toBe('Padel');
    expect(resolveCategory({ itemType: 'booking', courtType: 'tennis' })).toBe('Tennis');
    expect(resolveCategory({ itemType: 'booking', courtType: 'badminton' })).toBe('Badminton');
    expect(resolveCategory({ itemType: 'booking', courtType: 'basketball' })).toBe('Basket');
    expect(resolveCategory({ itemType: 'booking', courtType: 'futsal' })).toBe('Futsal');
    expect(resolveCategory({ itemType: 'booking', courtType: 'other' })).toBe('Lapangan Lain');
  });

  it('booking tanpa court type → Lainnya (defensif)', () => {
    expect(resolveCategory({ itemType: 'booking' })).toBe('Lainnya');
    expect(resolveCategory({ itemType: 'booking', courtType: null })).toBe('Lainnya');
  });

  it('non-booking dipetakan by item_type', () => {
    expect(resolveCategory({ itemType: 'pool_ticket' })).toBe('Kolam');
    expect(resolveCategory({ itemType: 'abonemen' })).toBe('Abonemen');
    expect(resolveCategory({ itemType: 'membership' })).toBe('Membership');
    expect(resolveCategory({ itemType: 'event' })).toBe('Event');
    expect(resolveCategory({ itemType: 'ticket' })).toBe('Tiket Masuk');
    expect(resolveCategory({ itemType: 'product' })).toBe('Retail');
  });
});
