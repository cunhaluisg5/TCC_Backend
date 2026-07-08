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
      items: [
        {
          itemName: ' Arroz ',
          itemCode: ' 123 ',
          qtdItem: '2',
          unItem: 'UN',
          itemValue: '10,50'
        }
      ],
      details: {
        totalItems: '1',
        totalValue: '10,50'
      },
      detailsNfce: {
        accesskey: '3126 0717 7456 1300 2609 6501 0000 1981 0913 3012 7025',
        uf: 'mg',
        socialName: 'Mercado Teste'
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejeita listagem de outro usuário', async () => {
    await expect(nfceService.listByUser('user-1', 'user-2'))
      .rejects.toMatchObject({ status: 403, message: 'Acesso negado para este usuário!' });
  });

  it('rejeita criacao de NFC-e duplicada com chave normalizada', async () => {
    nfceRepository.findNfceByAccessKeyForUser.mockResolvedValue({ id: 'nfce-1' });

    await expect(nfceService.create('user-1', payload))
      .rejects.toMatchObject({ status: 400, message: 'NFC-e já existente!' });

    expect(nfceRepository.findNfceByAccessKeyForUser)
      .toHaveBeenCalledWith('31260717745613002609650100001981091330127025', 'user-1');
  });

  it('normaliza payload antes de salvar a NFC-e', async () => {
    nfceRepository.findNfceByAccessKeyForUser.mockResolvedValue(null);
    nfceRepository.createNfce.mockResolvedValue({
      id: 'nfce-1',
      user: { id: 'user-1' },
      items: payload.nfce.items,
      totalItems: '1',
      totalValue: '10.50',
      accesskey: '31260717745613002609650100001981091330127025',
      uf: 'MG',
      socialName: 'Mercado Teste'
    });

    const result = await nfceService.create('user-1', payload);

    expect(nfceRepository.createNfce).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      items: [expect.objectContaining({
        itemName: 'Arroz',
        itemCode: '123',
        qtdItem: '2.00',
        itemValue: '10.50'
      })],
      details: expect.objectContaining({
        totalItems: '1',
        totalValue: '10.50'
      }),
      detailsNfce: expect.objectContaining({
        accesskey: '31260717745613002609650100001981091330127025',
        uf: 'MG'
      })
    }));

    expect(result.nfce).toMatchObject({
      accesskey: '31260717745613002609650100001981091330127025',
      uf: 'MG'
    });
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

