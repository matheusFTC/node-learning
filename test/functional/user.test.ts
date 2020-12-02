import { User } from '@src/models/user';

describe('User functional tests', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  describe('When creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      const { status, body } = await global.request.post('/users').send(newUser);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newUser));
    });
  });
});
