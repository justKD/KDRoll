/**
 * @file KDHistory.js
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
   * Class extending `Array` with max size and automatic overflow handling.
   * @extends
   */
  constructor() {
    super();
    let max = 1000;
    this.max = (size) => {
      if (size !== undefined) {
        if (Number.isSafeInteger(size)) {
          max = size;
        } else {
          console.log('maxHistory(size) must be a safe integer');
        }
      }
      return max;
    };
    this.push = (...items) => {
      let count = items.length;
      while (count--) if (this.length >= max) this.shift();
      super.push(items);
      return this.length;
    };
  }
}
