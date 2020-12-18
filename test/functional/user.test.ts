import { User } from '@src/models/user';

import AuthService from '@src/services/auth';

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

      await expect(
        AuthService.comparePasswords(newUser.password, body.password)
      ).resolves.toBeTruthy();

      expect(body).toEqual(
        expect.objectContaining({
          ...newUser,
          ...{ password: expect.any(String) },
        })
      );
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
        code: 422,
        error: 'Unprocessable Entity',
        message: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should throw 409 when the email already exists', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      // Create new user
      await global.request.post('/users').send(newUser);

      // Create the same user again
      const { status, body } = await global.request
        .post('/users')
        .send(newUser);

      expect(status).toBe(409);
      expect(body).toEqual({
        code: 409,
        error: 'Conflict',
        message:
          'User validation failed: email: already exists in the database.',
      });
    });
  });

  describe('When authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      await new User(newUser).save();

      const { body } = await global.request
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });

      expect(body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('should return UNAUTHORIZED if the user with the given email is not found', async () => {
      const { status } = await global.request
        .post('/users/authenticate')
        .send({ email: 'some-email@mail.com', password: '123456' });

      expect(status).toBe(401);
    });

    it('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      await new User(newUser).save();

      const { status } = await global.request
        .post('/users/authenticate')
        .send({ email: 'jhon@mail.com', password: 'different password' });

      expect(status).toBe(401);
    });
  });

  describe('When getting user profile info', () => {
    it(`should return the token's owner profile information`, async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      const user = await new User(newUser).save();

      const token = AuthService.generateToken(user.toJSON());

      const { status, body } = await global.request
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });

    it(`should return Not Found, when the user is not found`, async () => {
      const newUser = {
        name: 'Jhon Doe',
        email: 'jhon@mail.com',
        password: '123456',
      };

      //create a new user but don't save it
      const user = await new User(newUser);

      const token = AuthService.generateToken(user.toJSON());

      const { status, body } = await global.request
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(404);
      expect(body.message).toBe('User not found!');
    });
  });
});
