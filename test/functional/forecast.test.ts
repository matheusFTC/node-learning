import nock from 'nock';

import { Beach } from '@src/models/beach';
import { GeoPosition } from '@src/models/enums/geo-position';
import { User } from '@src/models/user';

import AuthService from '@src/services/auth';

import stormglassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';

describe('Beach forecast function tests', () => {
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

    const beach = new Beach({
      lat: -33.792726,
      lng: 151.289824,
      name: 'Manly',
      position: GeoPosition.EAST,
      user: user._id,
    });
    await beach.save();

    token = AuthService.generateToken(user.toJSON());
  });

  it('should return a forecast with just a few times', async () => {
    nock('https://api.stormglass.io:443', { encodedQueryParams: true })
      .get('/v2/weather/point')
      .query({
        lat: '-33.792726',
        lng: '151.289824',
        params:
          'swellDirection%2CswellHeight%2CswellPeriod%2CwaveDirection%2CwaveHeight%2CwindDirection%2CwindSpeed',
        source: 'noaa',
      })
      .reply(200, stormglassWeather3HoursFixture);

    const { status, body } = await global.request
      .get('/forecast')
      .set({ 'x-access-token': token });

    expect(status).toBe(200);
    expect(body).toEqual(apiForecastResponse1BeachFixture);
  });

  it('should return 500 if something goes wrong during the processing', async () => {
    nock('https://api.stormglass.io:443', {
      encodedQueryParams: true,
      reqheaders: {
        Authorization: (): boolean => true,
      },
    })
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .get('/v1/weather/point')
      .query({ lat: '-33.792726', lng: '151.289824' })
      .replyWithError('Something went wrong');

    const { status } = await global.request
      .get(`/forecast`)
      .set({ 'x-access-token': token });

    expect(status).toBe(500);
  });
});
