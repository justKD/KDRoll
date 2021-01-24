/**
 * @file KDHistory.ts
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview Class extending `Array` with max size management.
 */

/**
 * @class Extends `Array` with max size and automatic overflow handling.
 * @extends
 */
export class KDHistory extends Array {
  /**
   * Get/Set the maximum allowed size of the array.
   * @param {number} [size] - If empty, return the current max size.
   * Else set the new max size and return the value.
   * @return {number}
   */
  max: (size?: number) => number;

  /**
   * @override
   * If `length >= max`, remove the first element of the array
   * before adding the new element.
   * @param {any[]} items
   * @returns {number} new array length
   */
  push: (...items: any[]) => number;

  /**
   * Class extending `Array` with max size and automatic overflow handling.
   * @extends
   */
  constructor() {
    super();

    let max: number = 1000;

    this.max = (size?: number): number => {
      if (size !== undefined) {
        if (Number.isSafeInteger(size)) {
          max = size;
        } else {
          console.log('maxHistory(size) must be a safe integer');
        }
      }
      return max;
    };

    this.push = (...items: any[]): number => {
      let count = items.length;
      while (count--) if (this.length >= max) this.shift();
      super.push(items);
      return this.length;
    };
  }
}
