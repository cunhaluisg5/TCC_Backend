jest.mock('../../src/db/firebase', () => ({}));
jest.mock('../../src/modules/mailer', () => ({
  sendMail: jest.fn()
}));

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../../src/http/createApp');

describe('HTTP smoke tests', () => {
  const app = createApp();
  const token = jwt.sign({ id: 'user-1' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  it('expoe a especificacao OpenAPI em /docs.json', async () => {
    const response = await request(app).get('/docs.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/auth/register']).toBeDefined();
  });

  it('bloqueia rota protegida sem token', async () => {
    const response = await request(app).get('/nfces/user/user-1');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Nenhum token fornecido!' });
  });

  it('valida payload invalido de cadastro', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ name: 'Lu', email: 'email-invalido', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('bloqueia atualizacao de perfil de outro usuario', async () => {
    const response = await request(app)
      .put('/auth/user-2')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Outro Nome' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Acesso negado para este usuario!' });
  });
});
