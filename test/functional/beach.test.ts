import { BeachPosition } from '@src/services/forecast';

describe('Beach functional tests', () => {
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
  });
});
