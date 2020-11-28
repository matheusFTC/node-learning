import * as HTTPUtil from '@src/util/request';

import { StormGlass } from '@src/clients/storm-class';

import stormglassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponse3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/util/request');

describe('StormGlass client', () => {
  const mokedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;
  const mokedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    mokedRequest.get.mockResolvedValue({
      data: stormglassWeather3HoursFixture,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mokedRequest);
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
    mokedRequest.get.mockResolvedValue({
      data: incompleteResponse,
    } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mokedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    mokedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mokedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    mokedRequestClass.isRequestError.mockReturnValue(true);

    mokedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mokedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
