jest.mock('../../src/repositories/nfceRepository', () => ({
  createNfce: jest.fn(),
  deleteNfce: jest.fn(),
  findNfceByAccessKeyForUser: jest.fn(),
  findNfceById: jest.fn(),
  listNfces: jest.fn(),
  listNfcesByUser: jest.fn(),
  updateNfce: jest.fn()
}));

const nfceService = require('../../src/services/nfceService');
const nfceRepository = require('../../src/repositories/nfceRepository');

describe('nfceService', () => {
  const payload = {
    nfce: {
      items: [],
      details: {},
      detailsNfce: {
        accesskey: '31260717745613002609650100001981091330127025'
      }
    }
  };

  it('rejeita listagem de outro usuario', async () => {
    await expect(nfceService.listByUser('user-1', 'user-2'))
      .rejects.toMatchObject({ status: 403, message: 'Acesso negado para este usuario!' });
  });

  it('rejeita criacao de NFC-e duplicada', async () => {
    nfceRepository.findNfceByAccessKeyForUser.mockResolvedValue({ id: 'nfce-1' });

    await expect(nfceService.create('user-1', payload))
      .rejects.toMatchObject({ status: 400, message: 'NFC-e ja existente!' });
  });

  it('rejeita acesso a NFC-e de outro usuario', async () => {
    nfceRepository.findNfceById.mockResolvedValue({
      id: 'nfce-1',
      user: { id: 'other-user' }
    });

    await expect(nfceService.findById('user-1', 'nfce-1'))
      .rejects.toMatchObject({ status: 403, message: 'Acesso negado para esta NFC-e!' });
  });

  it('remove NFC-e do proprio usuario', async () => {
    nfceRepository.findNfceById.mockResolvedValue({
      id: 'nfce-1',
      user: { id: 'user-1' }
    });
    nfceRepository.deleteNfce.mockResolvedValue();

    await nfceService.remove('user-1', 'nfce-1');

    expect(nfceRepository.deleteNfce).toHaveBeenCalledWith('nfce-1');
  });
});
