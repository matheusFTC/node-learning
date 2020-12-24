import { Beach } from '@src/models/beach';
import { GeoPosition } from '@src/models/enums/geo-position';
import { ForecastPoint } from '@src/clients/storm-class';

const waveHeights = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: Beach) {}

  public getRatingForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    );
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
    const finalRating =
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
    return Math.round(finalRating);
  }

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): number {
    if (wavePosition === windPosition) return 1;

    if (this.isWindOffShore(wavePosition, windPosition)) return 5;

    return 3;
  }

  public getRatingForSwellPeriod(period: number): number {
    if (period >= 7 && period < 10) return 2;

    if (period >= 10 && period < 14) return 4;

    if (period >= 14) return 5;

    return 1;
  }

  public getRatingForSwellSize(height: number): number {
    if (
      height >= waveHeights.ankleToKnee.min &&
      height < waveHeights.ankleToKnee.max
    )
      return 2;

    if (
      height >= waveHeights.waistHigh.min &&
      height < waveHeights.waistHigh.max
    )
      return 3;

    if (height >= waveHeights.headHigh.min) return 5;

    return 1;
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    if (coordinates >= 310 || (coordinates < 50 && coordinates >= 0)) {
      return GeoPosition.NORTH;
    }

    if (coordinates >= 50 && coordinates < 120) {
      return GeoPosition.EAST;
    }

    if (coordinates >= 120 && coordinates < 220) {
      return GeoPosition.SOUTH;
    }

    return GeoPosition.WEST;
  }

  private isWindOffShore(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): boolean {
    return (
      (wavePosition === GeoPosition.NORTH &&
        windPosition === GeoPosition.SOUTH &&
        this.beach.position === GeoPosition.NORTH) ||
      (wavePosition === GeoPosition.SOUTH &&
        windPosition === GeoPosition.NORTH &&
        this.beach.position === GeoPosition.SOUTH) ||
      (wavePosition === GeoPosition.EAST &&
        windPosition === GeoPosition.WEST &&
        this.beach.position === GeoPosition.EAST) ||
      (wavePosition === GeoPosition.WEST &&
        windPosition === GeoPosition.EAST &&
        this.beach.position === GeoPosition.WEST)
    );
  }
}
