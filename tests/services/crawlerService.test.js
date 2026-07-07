jest.mock('axios', () => ({
  get: jest.fn()
}));

const axios = require('axios');
const crawlerService = require('../../src/services/crawlerService');
const { sampleCrawlerHtml } = require('../fixtures/crawlerHtml');

describe('crawlerService', () => {
  it('extrai itens e detalhes principais da pagina da NFC-e', async () => {
    axios.get.mockResolvedValue({ data: sampleCrawlerHtml });

    const result = await crawlerService.crawl('https://portalsped.fazenda.mg.gov.br/portalnfce');

    expect(result.nfce.items).toHaveLength(2);
    expect(result.nfce.items[0]).toMatchObject({
      itemName: 'ARROZ',
      itemCode: '123',
      itemValue: '10.50',
      qtdItem: '2.00'
    });
    expect(result.nfce.detailsNfce).toMatchObject({
      accesskey: '31260717745613002609650100001981091330127025',
      socialName: 'Mercado Teste',
      uf: 'MG',
      protocol: 'PROTOCOLO123',
      issuanceDate: '01/07/2026 15:18:54'
    });
  });

  it('retorna erro amigavel quando o portal esta indisponivel', async () => {
    axios.get.mockRejectedValue(new Error('timeout'));

    await expect(crawlerService.crawl('https://portalsped.fazenda.mg.gov.br/portalnfce'))
      .rejects.toMatchObject({ status: 503, message: 'Nao foi possivel consultar o portal da Fazenda no momento.' });
  });
});
