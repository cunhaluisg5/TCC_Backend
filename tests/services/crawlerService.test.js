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

    expect(result.nfce.items).toHaveLength(1);
    expect(result.nfce.items[0]).toMatchObject({
      itemName: 'ARROZ',
      itemCode: '123',
      itemValue: '10.50'
    });
    expect(result.nfce.detailsNfce).toMatchObject({
      accesskey: 'ACCESS-KEY-123',
      socialName: 'Mercado Teste',
      uf: 'MG',
      protocol: 'PROTOCOLO123'
    });
  });
});
