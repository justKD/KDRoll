/**
 * @file KDGaussian.ts
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview Function to convert uniformally distributed random numbers
 * to gaussian distribution using the Box Mueller transform.
 */

import { KDNumber } from './KDNumber';
import { KDUniform } from './KDUniform';

/**
 * Generates a 53-bit random real in the interval [0, 1] with gaussian
 * distribution (Box Mueller transform).
 * @param {KDUniform | Math} uniformGenerator - A uniform distribution
 * random number generator with a `.random()` method.
 * @param {number} [skew=0] - (-1 to 1) negative values skew data RIGHT,
 * positive values skew data LEFT.
 * @returns
 * @example
 * ```
 * const generator = new KDUniform() || Math
 * const rand = kdgaussian(generator, 0)
 * ```
 */
export const KDGaussian = (
  uniformGenerator: KDUniform | Math,
  skew: number = 0
): number => {
  /**
   * Convert skew percentage values (skew right) [-1, 0] to [0, 1]
   * and (skew left) [0, 1] to [0, 4].
   * @param {number} sk - Skew value.
   * @returns {number}
   */
  const scaleSkew = (sk: number): number => {
    let n: KDNumber = new KDNumber(Math.abs(sk));
    n.clip(0, 1);
    const skewRight = () => /* sk < 0 */ {
      sk = 1 - n.value;
    };
    const skewLeft = () => /* sk > 0 */ {
      n.scale(0, 4);
      sk = n.value;
    };
    const noSkew = () => /* sk = 0 */ (sk = 1);

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
  }

  /* apply gaussian distribution */
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  /* scale back to 0-1 */
  num = num / 10.0 + 0.5;
  /* resample if out of range */
  if (num > 1 || num < 0) num = Number(KDGaussian(new KDUniform(), skew));
  /* skew */
  num = Math.pow(num, skew);
  return num;
};
