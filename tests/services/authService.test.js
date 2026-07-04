jest.mock('../../src/repositories/userRepository', () => ({
  createUser: jest.fn(),
  findByEmail: jest.fn(),
  updateUser: jest.fn()
}));

jest.mock('../../src/modules/mailer', () => ({
  sendMail: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('../../src/services/authService');
const userRepository = require('../../src/repositories/userRepository');
const mailer = require('../../src/modules/mailer');
const { HttpError } = require('../../src/utils/httpError');

describe('authService', () => {
  it('registra usuario e retorna token', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue({ id: 'user-1', email: 'user@email.com', name: 'Luis' });

    const result = await authService.register({
      name: 'Luis',
      email: 'user@email.com',
      password: '123456'
    });

    expect(userRepository.createUser).toHaveBeenCalled();
    expect(result.user.id).toBe('user-1');
    expect(typeof result.token).toBe('string');

    const decoded = jwt.verify(result.token, process.env.JWT_SECRET);
    expect(decoded.id).toBe('user-1');
  });

  it('rejeita autenticacao com senha invalida', async () => {
    const hash = await bcrypt.hash('123456', 10);
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@email.com',
      password: hash,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    await expect(authService.authenticate({ email: 'user@email.com', password: '654321' }))
      .rejects.toMatchObject({ status: 400, message: 'Senha invalida!' });
  });

  it('envia e-mail no fluxo de forgot password', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'user@email.com' });
    userRepository.updateUser.mockResolvedValue({ id: 'user-1' });
    mailer.sendMail.mockImplementation((payload, callback) => callback(null));

    await authService.forgotPassword({ email: 'user@email.com' });

    expect(userRepository.updateUser).toHaveBeenCalled();
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@email.com',
        template: 'auth/forgot_password'
      }),
      expect.any(Function)
    );
  });

  it('rejeita reset com token expirado', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@email.com',
      passwordResetToken: 'token-12345678901234567890',
      passwordResetExpires: '2020-01-01T00:00:00.000Z'
    });

    await expect(authService.resetPassword({
      email: 'user@email.com',
      token: 'token-12345678901234567890',
      password: 'novaSenha123'
    })).rejects.toMatchObject({ status: 400, message: 'Token expirado!' });
  });
});
