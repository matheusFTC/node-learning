import { Beach } from '@src/models/beach';
import { GeoPosition } from '@src/models/enums/geo-position';
import { User } from '@src/models/user';

import AuthService from '@src/services/auth';

describe('Beach functional tests', () => {
  const defaultUser = {
    name: 'Jhon Doe',
    email: 'jhon@mail.com',
    password: '123456',
  };

  let token: string;

  beforeEach(async () => {
    await Beach.deleteMany({});
    await User.deleteMany({});

    const user = await new User(defaultUser).save();

    token = AuthService.generateToken(user.toJSON());
  });

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.EAST,
      };

      const { status, body } = await global.request
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: GeoPosition.EAST,
      };

      const { status, body } = await global.request
        .post('/beaches')
        .set({ 'x-access-token': token })
        .send(newBeach);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        error: 'Unprocessable Entity',
        message:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" at path "lat"',
      });
    });
  });
});
