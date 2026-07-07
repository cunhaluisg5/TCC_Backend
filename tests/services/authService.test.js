jest.mock('../../src/repositories/userRepository', () => ({
  createUser: jest.fn(),
  findByEmail: jest.fn(),
  findByPasswordResetToken: jest.fn(),
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

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('retorna resposta generica quando o e-mail nao existe no forgot password', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await authService.forgotPassword({ email: 'naocadastrado@email.com' });

    expect(result.message).toContain('Se o e-mail estiver cadastrado');
    expect(userRepository.updateUser).not.toHaveBeenCalled();
    expect(mailer.sendMail).not.toHaveBeenCalled();
  });

  it('envia e-mail no fluxo de forgot password', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'user@email.com' });
    userRepository.updateUser.mockResolvedValue({ id: 'user-1' });
    mailer.sendMail.mockImplementation((payload, callback) => callback(null));

    const result = await authService.forgotPassword({ email: 'user@email.com' });

    expect(userRepository.updateUser).toHaveBeenCalledWith('user-1', expect.objectContaining({
      passwordResetToken: expect.any(String),
      passwordResetExpires: expect.any(String)
    }));
    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@email.com',
        template: 'auth/forgot_password'
      }),
      expect.any(Function)
    );
    expect(result.message).toContain('Se o e-mail estiver cadastrado');
  });

  it('valida token de redefinicao ativo', async () => {
    userRepository.findByPasswordResetToken.mockResolvedValue({
      id: 'user-1',
      email: 'user@email.com',
      name: 'Luis',
      passwordResetToken: 'token-12345678901234567890',
      passwordResetExpires: '2099-01-01T00:00:00.000Z'
    });

    const result = await authService.validateResetToken({ token: 'token-12345678901234567890' });

    expect(result).toMatchObject({
      token: 'token-12345678901234567890',
      email: 'user@email.com',
      name: 'Luis'
    });
  });

  it('rejeita reset com token expirado', async () => {
    userRepository.findByPasswordResetToken.mockResolvedValue({
      id: 'user-1',
      email: 'user@email.com',
      passwordResetToken: 'token-12345678901234567890',
      passwordResetExpires: '2020-01-01T00:00:00.000Z'
    });

    await expect(authService.resetPassword({
      token: 'token-12345678901234567890',
      password: 'novaSenha123'
    })).rejects.toMatchObject({ status: 400, message: 'Token expirado!' });
  });

  it('redefine a senha usando apenas o token', async () => {
    userRepository.findByPasswordResetToken.mockResolvedValue({
      id: 'user-1',
      email: 'user@email.com',
      passwordResetToken: 'token-12345678901234567890',
      passwordResetExpires: '2099-01-01T00:00:00.000Z'
    });
    userRepository.updateUser.mockResolvedValue({ id: 'user-1' });

    const result = await authService.resetPassword({
      token: 'token-12345678901234567890',
      password: 'novaSenha123'
    });

    expect(userRepository.updateUser).toHaveBeenCalledWith('user-1', {
      password: 'novaSenha123',
      passwordResetToken: null,
      passwordResetExpires: null
    });
    expect(result.message).toBe('Senha redefinida com sucesso.');
  });
});
