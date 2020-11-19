import axios from 'axios';

import { StormGlass } from '@src/clients/storm-class';

import stormglassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponse3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  const mokedAxios = axios as jest.Mocked<typeof axios>;

  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    mokedAxios.get.mockResolvedValue({ data: stormglassWeather3HoursFixture });

    const stormGlass = new StormGlass(mokedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormglassNormalizedResponse3HoursFixture);
  });

  it('should exclude incomplete data points', async () => {
    const lat = -8.116174;
    const lng = -34.909215;
    const incompleteResponse = {
      hours: [
        {
          windDirection: {
            noaa: 300,
          },
          time: '2020-11-12T00:00:00+00:00',
        },
      ],
    };
    mokedAxios.get.mockResolvedValue({ data: incompleteResponse });

    const stormGlass = new StormGlass(mokedAxios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    mokedAxios.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mokedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    mokedAxios.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      }
    });

    const stormGlass = new StormGlass(mokedAxios);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
