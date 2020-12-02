import { User } from '@src/models/user';

describe('User functional tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('When creating a new user', () => {
    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      const { status, body } = await global.request
        .post('/users')
        .send(newUser);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newUser));
    });

    it('should throw 422 when there is a validation error', async () => {
      const newUser = {
        email: 'jhon@mail.com',
        password: '123456',
      };

      const { status, body } = await global.request
        .post('/users')
        .send(newUser);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422, error: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should throw 409 when the email already exists', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      // Create new user
      await global.request
        .post('/users')
        .send(newUser);

      // Create the same user again
      const { status, body } = await global.request
        .post('/users')
        .send(newUser);

      expect(status).toBe(409);
      expect(body).toEqual({
        code: 409, error: 'User validation failed: email: already exists in the database.',
      });
    });
  });
});
