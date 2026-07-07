const sampleCrawlerHtml = `
<table id="myTable">
  <tr>
    <td>ARROZ
(Codigo: 123)</td>
    <td>Qtde total de itens: 2</td>
    <td>UN: UN</td>
    <td>Valor total R$: R$ 10,50</td>
  </tr>
  <tr>
    <td>FEIJAO
(Codigo: 456)</td>
    <td>Qtde total de itens: 1</td>
    <td>UN: KG</td>
    <td>Valor total R$: R$ 7,99</td>
  </tr>
</table>
<div class="row"><strong>Label</strong><strong>3</strong></div>
<div class="row"><strong>Label</strong><strong>18,49</strong></div>
<div class="row"><strong>Label</strong><strong>18,49</strong></div>
<div class="row"><strong>Dinheiro - PIX</strong></div>
<table id="collapseTwo"><tr><td>31260717745613002609650100001981091330127025</td></tr></table>
<table id="collapse4"><tr>
  <td>Mercado Teste</td>
  <td>12.345.678/0001-99</td>
  <td>123456</td>
  <td>MG</td>
  <td>1</td>
  <td>1</td>
  <td>1</td>
  <td>65</td>
  <td>1</td>
  <td>123</td>
  <td>01/07/2026 15:18:54</td>
  <td>R$ 18,49</td>
  <td>R$ 18,49</td>
  <td>R$ 1,23</td>
  <td>PROTOCOLO123</td>
</tr></table>
`;

module.exports = {
  sampleCrawlerHtml
};
