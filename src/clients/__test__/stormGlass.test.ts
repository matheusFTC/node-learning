import axios from 'axios';

import { StormGlass } from '@src/clients/stormGlass';

import stormglassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormglassNormalizedResponse3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('axios');

describe('StormGlass client', () => {
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -8.116174;
    const lng = -34.909215;

    axios.get = jest.fn().mockResolvedValue({ data: stormglassWeather3HoursFixture });

    const stormGlass = new StormGlass(axios);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormglassNormalizedResponse3HoursFixture);
  });
});
