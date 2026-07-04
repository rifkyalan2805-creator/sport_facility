import { AbonemenRegistrationService } from '../src/services/abonemenRegistration.service';
import { AbonemenRegistrationRepository } from '../src/repositories/abonemenRegistration.repository';
import { AbonemenPackageRepository } from '../src/repositories/abonemenPackage.repository';

const mockRepo = () =>
  ({
    create: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    findActiveByUserAndPackage: jest.fn().mockResolvedValue(null),
    findApprovedForUser: jest.fn(),
    findMany: jest.fn(),
    updateStatus: jest.fn(),
  } as unknown as jest.Mocked<AbonemenRegistrationRepository>);

const mockPackages = () =>
  ({
    listActive: jest.fn(),
    findById: jest.fn(),
  } as unknown as jest.Mocked<AbonemenPackageRepository>);

function buildService() {
  const repo = mockRepo();
  const packages = mockPackages();
  const service = new AbonemenRegistrationService(repo, packages);
  return { service, repo, packages };
}

const activePackage = { id: 'p1', is_active: true, name: 'Abonemen Tenis', price: 1040000 };

const baseInput = {
  userId: 'u1',
  packageId: 'p1',
  fullName: 'Rifky Alan',
  phone: '081234567890',
  communicationEmail: 'rifky@gmail.com',
};

describe('AbonemenRegistrationService.register', () => {
  it('membuat pengajuan status pending saat paket aktif & belum ada pengajuan aktif', async () => {
    const { service, repo, packages } = buildService();
    (packages.findById as jest.Mock).mockResolvedValue(activePackage);
    (repo.create as jest.Mock).mockImplementation(async (d) => ({ id: 'r1', ...d }));

    const res = await service.register(baseInput);

    const arg = (repo.create as jest.Mock).mock.calls[0][0];
    expect(arg.status).toBe('pending');
    expect(arg.user_id).toBe('u1');
    expect(arg.package_id).toBe('p1');
    expect(arg.communication_email).toBe('rifky@gmail.com');
    expect(res.id).toBe('r1');
  });

  it('menolak (404) jika paket tidak ada / tidak aktif', async () => {
    const { service, packages } = buildService();
    (packages.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.register(baseInput)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('menolak (409) jika sudah ada pengajuan aktif untuk paket yang sama', async () => {
    const { service, repo, packages } = buildService();
    (packages.findById as jest.Mock).mockResolvedValue(activePackage);
    (repo.findActiveByUserAndPackage as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(service.register(baseInput)).rejects.toMatchObject({ statusCode: 409 });
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('AbonemenRegistrationService.review', () => {
  it('approve: pending → approved + reviewed_by/at terisi', async () => {
    const { service, repo } = buildService();
    (repo.findById as jest.Mock).mockResolvedValue({ id: 'r1', status: 'pending' });
    (repo.updateStatus as jest.Mock).mockImplementation(async (_id, d) => d);

    await service.review({ registrationId: 'r1', adminId: 'admin1', action: 'approve' });

    const [id, data] = (repo.updateStatus as jest.Mock).mock.calls[0];
    expect(id).toBe('r1');
    expect(data.status).toBe('approved');
    expect(data.reviewed_by).toBe('admin1');
    expect(data.reviewed_at).toBeInstanceOf(Date);
  });

  it('reject: pending → rejected', async () => {
    const { service, repo } = buildService();
    (repo.findById as jest.Mock).mockResolvedValue({ id: 'r1', status: 'pending' });
    (repo.updateStatus as jest.Mock).mockImplementation(async (_id, d) => d);

    await service.review({ registrationId: 'r1', adminId: 'admin1', action: 'reject' });

    const data = (repo.updateStatus as jest.Mock).mock.calls[0][1];
    expect(data.status).toBe('rejected');
  });

  it('menolak (404) jika pengajuan tidak ada', async () => {
    const { service, repo } = buildService();
    (repo.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.review({ registrationId: 'x', adminId: 'admin1', action: 'approve' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('menolak (422) jika pengajuan sudah tidak pending', async () => {
    const { service, repo } = buildService();
    (repo.findById as jest.Mock).mockResolvedValue({ id: 'r1', status: 'approved' });

    await expect(
      service.review({ registrationId: 'r1', adminId: 'admin1', action: 'approve' })
    ).rejects.toMatchObject({ statusCode: 422 });
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });
});
