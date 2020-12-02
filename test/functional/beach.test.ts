import { Beach, BeachPosition } from '@src/models/beach';

describe('Beach functional tests', () => {
  beforeAll(async () => {
    await Beach.deleteMany({});
  });

  describe('When creating a beach', () => {
    it('should create a beach with success', async () => {
      const newBeach = {
        lat: -33.792726,
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.EAST,
      };

      const { status, body } = await global.request
        .post('/beaches')
        .send(newBeach);

      expect(status).toBe(201);
      expect(body).toEqual(expect.objectContaining(newBeach));
    });

    it('should return 422 when there is a validation error', async () => {
      const newBeach = {
        lat: 'invalid_string',
        lng: 151.289824,
        name: 'Manly',
        position: BeachPosition.EAST,
      };

      const { status, body } = await global.request
        .post('/beaches')
        .send(newBeach);

      expect(status).toBe(422);
      expect(body).toEqual({
        code: 422,
        error:
          'Beach validation failed: lat: Cast to Number failed for value "invalid_string" at path "lat"',
      });
    });
  });
});
