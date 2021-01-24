/**
 * @file KDGaussian.js
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview Generates a 53-bit random real in the interval [0, 1] with gaussian
 * distribution (Box Mueller transform) by converting random numbers generated via uniform
 * distribution (Mersenne Twister).
 */
import { KDNumber } from './KDNumber';
import { KDUniform } from './KDUniform';
/**
 * Generates a 53-bit random real in the interval [0, 1] with gaussian
 * distribution (Box Mueller transform).
 * @param {KDUniform | Math} uniformGenerator - A uniform distribution
 * random number generator with a `.random()` method.
 * @param {number} [skew=0] - `number` in the range of -1 to 1. Negative
 * values skew data RIGHT, positive values skew data LEFT.
 * @returns
 * @example
 * ```
 * const generator = new KDUniform() || Math
 * const rand = kdgaussian(generator, 0)
 * ```
 */
export const KDGaussian = (uniformGenerator, skew = 0) => {
  /**
   * Convert skew percentage values (skew right) [-1, 0] to [0, 1]
   * and (skew left) [0, 1] to [0, 4].
   * @param {number} sk - Skew value.
   * @returns {number}
   */
  const scaleSkew = (sk) => {
    let n = new KDNumber(Math.abs(sk));
    n.clip(0, 1);
    /* sk < 0 */
    const skewRight = () => {
      sk = 1 - n.value();
    };
    /* sk > 0 */
    const skewLeft = () => {
      n.scale(0, 4);
      sk = n.value();
    };
    /* sk = 0 */
    const noSkew = () => {
      sk = 1;
    };
    if (sk === 0) noSkew();
    else if (sk < 0) skewRight();
    else skewLeft();
    return sk;
  };
  skew = scaleSkew(skew);
  let u = 0;
  let v = 0;
  if (typeof uniformGenerator.random === 'function') {
    while (u === 0) u = uniformGenerator.random();
    while (v === 0) v = uniformGenerator.random();
  } else {
    console.error('must provide a valid prng generator object');
  }
  const fix = KDNumber.floatingPointFix;
  /* apply gaussian distribution */
  let num = fix(Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v));
  /* scale back to 0-1 */
  num = fix(num / 10.0 + 0.5);
  /* resample if out of range */
  if (num > 1 || num < 0) num = Number(KDGaussian(new KDUniform(), skew));
  /* skew */
  num = fix(Math.pow(num, skew));
  return num;
};
