jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: { findUnique: jest.fn() }
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../../middleware/auth');

const prisma = new PrismaClient();

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('auth middleware (unit)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('rejects a request with no Authorization header', async () => {
    const req = { header: () => undefined };
    const res = mockRes();
    const next = jest.fn();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects an invalid/expired token', async () => {
    const req = { header: () => 'Bearer badtoken' };
    const res = mockRes();
    const next = jest.fn();
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches req.user and calls next() for a valid token', async () => {
    const req = { header: () => 'Bearer goodtoken' };
    const res = mockRes();
    const next = jest.fn();
    jwt.verify.mockReturnValue({ userId: 1 });
    prisma.user.findUnique.mockResolvedValue({
      id: 1, name: 'Test User', email: 't@example.com', role: 'CUSTOMER'
    });

    await auth(req, res, next);

    expect(req.user).toEqual({ id: 1, name: 'Test User', email: 't@example.com', role: 'CUSTOMER' });
    expect(next).toHaveBeenCalled();
  });
});