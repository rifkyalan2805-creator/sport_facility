jest.mock('../src/config/prisma', () => ({ prisma: {} }));

import { CmsService } from '../src/services/cms.service';
import { CmsRepository } from '../src/repositories/cms.repository';

const mockCms = () =>
  ({
    listNews: jest.fn(),
    findNews: jest.fn(),
    findNewsBySlug: jest.fn(),
    createNews: jest.fn(),
    updateNews: jest.fn(),
    deleteNews: jest.fn(),
  } as unknown as jest.Mocked<CmsRepository>);

function build() {
  const cms = mockCms();
  return { service: new CmsService(cms), cms };
}

const baseInput = { title: 'Turnamen Padel 2026', content: 'Isi berita.' };

describe('CmsService — berita', () => {
  it('createNews membuat slug otomatis dari judul', async () => {
    const { service, cms } = build();
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue(null);
    (cms.createNews as jest.Mock).mockImplementation(async (d) => d);

    await service.createNews({ ...baseInput });

    const arg = (cms.createNews as jest.Mock).mock.calls[0][0];
    expect(arg.slug).toBe('turnamen-padel-2026');
  });

  it('createNews memakai slug yang diisi admin, tetap di-slugify', async () => {
    const { service, cms } = build();
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue(null);
    (cms.createNews as jest.Mock).mockImplementation(async (d) => d);

    await service.createNews({ ...baseInput, slug: 'Kabar Terbaru!' });

    expect((cms.createNews as jest.Mock).mock.calls[0][0].slug).toBe('kabar-terbaru');
  });

  it('createNews menolak slug yang sudah dipakai (409)', async () => {
    const { service, cms } = build();
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue({ id: 'n1' });

    await expect(service.createNews({ ...baseInput })).rejects.toMatchObject({
      statusCode: 409,
    });
    expect(cms.createNews).not.toHaveBeenCalled();
  });

  it('createNews berstatus published langsung mendapat published_at', async () => {
    const { service, cms } = build();
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue(null);
    (cms.createNews as jest.Mock).mockImplementation(async (d) => d);

    await service.createNews({ ...baseInput, status: 'published' });

    expect((cms.createNews as jest.Mock).mock.calls[0][0].published_at).toBeInstanceOf(Date);
  });

  it('createNews berstatus draft belum punya published_at', async () => {
    const { service, cms } = build();
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue(null);
    (cms.createNews as jest.Mock).mockImplementation(async (d) => d);

    await service.createNews({ ...baseInput, status: 'draft' });

    expect((cms.createNews as jest.Mock).mock.calls[0][0].published_at).toBeNull();
  });

  it('updateNews mengisi published_at saat draft pertama kali diterbitkan', async () => {
    const { service, cms } = build();
    (cms.findNews as jest.Mock).mockResolvedValue({ id: 'n1', published_at: null });
    (cms.updateNews as jest.Mock).mockImplementation(async (_id, d) => d);

    await service.updateNews('n1', { status: 'published' });

    expect((cms.updateNews as jest.Mock).mock.calls[0][1].published_at).toBeInstanceOf(Date);
  });

  it('updateNews TIDAK menimpa published_at berita yang pernah terbit', async () => {
    const { service, cms } = build();
    const terbit = new Date('2026-01-01T00:00:00Z');
    (cms.findNews as jest.Mock).mockResolvedValue({ id: 'n1', published_at: terbit });
    (cms.updateNews as jest.Mock).mockImplementation(async (_id, d) => d);

    await service.updateNews('n1', { status: 'published' });

    expect((cms.updateNews as jest.Mock).mock.calls[0][1].published_at).toBeUndefined();
  });

  it('updateNews menolak slug milik berita lain (409), tapi slug sendiri boleh', async () => {
    const { service, cms } = build();
    (cms.findNews as jest.Mock).mockResolvedValue({ id: 'n1', published_at: null });
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue({ id: 'n2' });

    await expect(service.updateNews('n1', { slug: 'dipakai' })).rejects.toMatchObject({
      statusCode: 409,
    });

    (cms.findNewsBySlug as jest.Mock).mockResolvedValue({ id: 'n1' });
    (cms.updateNews as jest.Mock).mockImplementation(async (_id, d) => d);
    await expect(service.updateNews('n1', { slug: 'dipakai' })).resolves.toBeDefined();
  });

  it('updateNews melempar 404 jika berita tidak ada', async () => {
    const { service, cms } = build();
    (cms.findNews as jest.Mock).mockResolvedValue(null);

    await expect(service.updateNews('x', { title: 'B' })).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(cms.updateNews).not.toHaveBeenCalled();
  });

  it('getNewsBySlug menyembunyikan draft dari publik sebagai 404', async () => {
    const { service, cms } = build();
    (cms.findNewsBySlug as jest.Mock).mockResolvedValue({ id: 'n1', status: 'draft' });

    await expect(service.getNewsBySlug('draftku', true)).rejects.toMatchObject({
      statusCode: 404,
    });
    // Admin (publishedOnly=false) tetap boleh membukanya untuk pratinjau.
    await expect(service.getNewsBySlug('draftku', false)).resolves.toMatchObject({
      status: 'draft',
    });
  });

  it('deleteNews melempar 404 jika berita tidak ada', async () => {
    const { service, cms } = build();
    (cms.findNews as jest.Mock).mockResolvedValue(null);

    await expect(service.deleteNews('x')).rejects.toMatchObject({ statusCode: 404 });
    expect(cms.deleteNews).not.toHaveBeenCalled();
  });
});
