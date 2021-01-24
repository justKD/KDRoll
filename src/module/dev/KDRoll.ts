/**
 * @file KDRoll.ts
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `KDRoll` is a class representing a random number manager.
 * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
 * distribution, n-sided die rolling, history of variable max size, elementary
 * statistics, and scale/clip/round convenience functions.
 */

import { KDHistory } from './KDHistory';
import { KDNumber } from './KDNumber';
import { KDUniform } from './KDUniform';
import { KDGaussian } from './KDGaussian';
import { KDElemstats } from './KDElemStats';

/** Allowed seed types. */
type Seed = number | number[] | Uint32Array | undefined;

/**
 * `KDRoll` is a class representing a random number manager.
 * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
 * distribution, n-sided die rolling, history of variable max size, elementary
 * statistics, and scale/clip/round convenience functions.
 */
export class KDRoll {
  /**
   * Re-seed the manager. Automatically clears history.
   * @param {Seed} [seed] - Unsigned 32-bit integer `number`, `Uint32Array`, or
   * `number[]` of arbitrary size/values.
   * @returns {Seed} Returns the current seed.
   * @readonly
   */
  seed: (seed?: Seed) => Seed;

  /**
   * Return a copy of the internal `history` object with no references.
   * @returns {number[]} Returns the current `history`.
   * @readonly
   */
  history: () => number[];

  /**
   * Get or set the maximum history size.
   * @param {number} [size] - The maximum history size. If `size=undefined` is
   * this function will return the current `maxHistory`. Initial `maxHistory`
   * is `1000`.
   * @returns {number} Returns the current `maxHistory`.
   * @readonly
   */
  maxHistory: (size?: number) => number;

  /**
   * Reset `history` but retain the current `maxHistory`.
   */
  clearHistory: () => void;

  /**
   * Generates a 53-bit random real in the interval [0,1] with
   * normal distribution.
   * @returns {number}
   * @readonly
   */
  uniform: () => number;

  /**
   * Generates a 53-bit random real in the interval [0,1] with gaussian
   * distribution.
   * @param {number} [skew=0] - In the range [-1,1]. Negative values skew data
   * RIGHT, and positive values skew data LEFT. Default `skew=0`.
   * @returns {number}
   * @readonly
   */
  gaussian: (skew?: number) => number;

  /**
   * Simulates a die-rolling metaphor. Generates a 53-bit random real in the
   * interval [0,1] with normal distribution, then scales it to a range [1,n]
   * where n is the number of sides, then rounds to whole number.
   * @param {number} sides - Number of sides to represent. Allows but ignores
   * decimals.
   * @returns {number}
   * @readonly
   */
  d: (sides: number) => number;

  /**
   * Convenience function. Alias for `uniform()`.
   * @returns {number}
   * @readonly
   */
  random: () => number;

  /**
   * Calculate the statistical mean of a `number[]` or the current `history()`.
   * @param {number[]} [arr] - The array on which to operate.
   * Defaults to `history()` if `arr=undefined`.
   * @returns {number}
   * @readonly
   */
  mean: (arr?: number[]) => number;

  /**
   * Calculate the statistical median of a `number[]` or the current
   * `history()`.
   * @param {number[]} [arr] - The array on which to operate.
   * Defaults to `history()` if `arr=undefined`.
   * @returns {number}
   * @readonly
   */
  median: (arr?: number[]) => number;

  /**
   * Calculate the statistical modes of a `number[]` or the current `history()`.
   * @param {number[]} [arr] - The array on which to operate.
   * Defaults to `history()` if `arr=undefined`.
   * @returns {number[]}
   * @readonly
   */
  modes: (arr?: number[]) => number[];

  /**
   * Calculate the standard deviation of a `number[]` or the current
   * `history()`.
   * @param {number[]} [arr] - The array on which to operate. Defaults to
   * `history()` if `arr=undefined`.
   * @returns {number} Standard deviation is normalized [0,1].
   * @readonly
   */
  standardDeviation: (arr?: number[]) => number;

  /**
   * Instantiates a new `KDRoll()`
   * @param {Seed} [seed] - The initial seed value. Should be an unsigned
   * integer or `Uint32Array` of arbitrary values and length. If
   * `seed=undefined`, `KDRoll()` will generate its own random seed using
   * `KDRoll.createRandomSeed()`.
   * @note `KDRoll` is a class representing a random number manager.
   * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
   * distribution, n-sided die rolling, history of variable max size, elementary
   * statistics, and scale/clip/round convenience functions.
   */
  constructor(seed?: Seed) {
    /* Mersenne Twister uniform distribution random number generator. */
    const uniform = new KDUniform(seed);
    /* Class extending `Array` with max size and automatic overflow handling. */
    let history = new KDHistory();
    /* Private functions */
    const _private = {
      seed: (seed?: Seed) => {
        if (seed !== undefined) {
          this.clearHistory();
          uniform.seed(seed);
        }
        return uniform.seed();
      },
      history: () => history.map((x) => x[0]),
      maxHistory: (size?: number) => history.max(size),
      clearHistory: () => {
        const max = history.max();
        history = new KDHistory();
        history.max(max);
      },
      uniform: () => {
        const rand = uniform.random();
        history.push(rand);
        return rand;
      },
      gaussian: (skew?: number) => {
        const rand = KDGaussian(uniform, skew);
        history.push(rand);
        return rand;
      },
      d: (sides: number) => {
        if (typeof sides === 'number') {
          const n = new KDNumber(uniform.random());
          n.scale(1, sides).round(0);
          const num = n.value();
          history.push(num);
          return num;
        } else {
          console.log(new Error('Sides must be a number.'));
          return NaN;
        }
      },
      mean: (arr?: number[]) => {
        arr = arr ? arr : this.history();
        return KDElemstats.mean(arr);
      },
      median: (arr?: any) => {
        arr = arr ? arr : this.history();
        return KDElemstats.median(arr);
      },
      modes: (arr?: number[]) => {
        arr = arr ? arr : this.history();
        return KDElemstats.modes(arr);
      },
      stdDev: (arr?: number[]) => {
        arr = arr ? arr : this.history();
        return KDElemstats.stdDev(arr);
      },
    };

    this.seed = (seed) => _private.seed(seed);
    this.history = () => _private.history();
    this.maxHistory = (size) => _private.maxHistory(size);
    this.clearHistory = () => _private.clearHistory();
    this.uniform = () => _private.uniform();
    this.gaussian = (skew) => _private.gaussian(skew);
    this.d = (sides) => _private.d(sides);
    this.random = () => _private.uniform();
    this.mean = (arr) => _private.mean(arr);
    this.median = (arr) => _private.median(arr);
    this.modes = (arr) => _private.modes(arr);
    this.standardDeviation = (arr) => _private.stdDev(arr);

    Object.keys(this).forEach((key) => {
      Object.defineProperty(this, key, {
        value: (this as any)[key],
        writable: false,
        enumerable: true,
      });
    });
  }

  /**
   * @static Convenience function to generate a randomly seeded random number
   * normalized [0,1].
   * @returns {number}
   */
  static random(): number {
    return new KDRoll().random();
  }

  /**
   * @static Convenience function to generate a randomly seeded random number
   * in the range 1-sides.
   * @param {number} sides - The desired number of sides to simulate.
   * @returns {number}
   */
  static d(sides: number): number {
    const roll = new KDRoll();
    return roll.d(sides) as number;
  }

  /**
   * @static Generate a random seed array using `window.crypto`. Falls back to
   * `node.crypto` or a final fallback to using `Math.random()` to fill an
   * array.
   * @return {number[]} Randomly generated `number[]` of random size [20,623]
   * and values.
   */
  static createRandomSeed(): number[] {
    return KDUniform.createRandomSeed();
  }

  /**
   * @static Scale a value from a known range to a new range.
   * @param {number} value - The initial value.
   * @param {[number, number]} r1 - The initial range [min, max].
   * @param {[number, number]} r2 - The target range [min, max].
   * @returns {number}
   */
  static scale(
    value: number,
    r1: [number, number],
    r2: [number, number]
  ): number {
    return KDNumber.scale(value, r1, r2);
  }

  /**
   * @static Limit a value to a hard minimum and maximum.
   * @param {number} value - The initial value.
   * @param {[number, number]} range - Array containing the minimum and
   * maximum possible values.
   * @returns {number}
   */
  static clip(value: number, range: [number, number]): number {
    return KDNumber.clip(value, range);
  }

  /**
   * @static Round a value to a specific number of places. Decimal values < 5
   * (for any given place) are rounded down.
   * @param {number} value - The initial value.
   * @param {number} [places=0] - The desired number of decimal places.
   * `0` results in a whole number. Default is `places=0`.
   * @returns {number}
   */
  static round(value: number, places: number): number {
    return KDNumber.round(value, places);
  }
}
