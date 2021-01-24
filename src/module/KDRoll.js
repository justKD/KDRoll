/**
 * @file KDRoll.js
 * @version 1.3.3
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `KDRoll` is a class representing a random number manager.
 * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
 * distribution, n-sided die rolling, history of variable max size, elementary
 * statistics, and scale/clip/round convenience functions.
 */

import { KDHistory } from './deps/KDHistory';
import { KDNumber } from './deps/KDNumber';
import { KDUniform } from './deps/KDUniform';
import { KDGaussian } from './deps/KDGaussian';
import { KDElemstats } from './deps/KDElemStats';

/**
 * `KDRoll` is a class representing a random number manager.
 * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
 * distribution, n-sided die rolling, history of variable max size, elementary
 * statistics, and scale/clip/round convenience functions.
 */
export class KDRoll {
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
  constructor(seed) {
    /* Mersenne Twister uniform distribution random number generator. */
    const uniform = new KDUniform(seed);
    /* Class extending `Array` with max size and automatic overflow handling. */
    let history = new KDHistory();
    /* Private functions */
    const _private = {
      seed: (seed) => {
        if (seed !== undefined) {
          this.clearHistory();
          uniform.seed(seed);
        }
        return uniform.seed();
      },
      history: () => history.map((x) => x[0]),
      maxHistory: (size) => history.max(size),
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
      gaussian: (skew) => {
        const rand = KDGaussian(uniform, skew);
        history.push(rand);
        return rand;
      },
      d: (sides) => {
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
      mean: (arr) => {
        arr = arr ? arr : this.history();
        return KDElemstats.mean(arr);
      },
      median: (arr) => {
        arr = arr ? arr : this.history();
        return KDElemstats.median(arr);
      },
      modes: (arr) => {
        arr = arr ? arr : this.history();
        return KDElemstats.modes(arr);
      },
      stdDev: (arr) => {
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
        value: this[key],
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
  static random() {
    return new KDRoll().random();
  }
  /**
   * @static Convenience function to generate a randomly seeded random number
   * in the range 1-sides.
   * @param {number} sides - The desired number of sides to simulate.
   * @returns {number}
   */
  static d(sides) {
    const roll = new KDRoll();
    return roll.d(sides);
  }
  /**
   * @static Generate a random seed array using `window.crypto`. Falls back to
   * `node.crypto` or a final fallback to using `Math.random()` to fill an
   * array.
   * @return {number[]} Randomly generated `number[]` of random size [20,623]
   * and values.
   */
  static createRandomSeed() {
    return KDUniform.createRandomSeed();
  }
  /**
   * @static Scale a value from a known range to a new range.
   * @param {number} value - The initial value.
   * @param {[number, number]} r1 - The initial range [min, max].
   * @param {[number, number]} r2 - The target range [min, max].
   * @returns {number}
   */
  static scale(value, r1, r2) {
    return KDNumber.scale(value, r1, r2);
  }
  /**
   * @static Limit a value to a hard minimum and maximum.
   * @param {number} value - The initial value.
   * @param {[number, number]} range - Array containing the minimum and
   * maximum possible values.
   * @returns {number}
   */
  static clip(value, range) {
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
  static round(value, places) {
    return KDNumber.round(value, places);
  }
}
