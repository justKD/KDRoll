/**
 * @file KDNumber.js
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview export class KDNumber
 * Class for mutating a number with scale/clip/round.
 */
/**
 * Class for mutating a number with scale/clip/round.
 * @example
 * ```
 * const n = new KDNumber(0.55, [0, 1]) // n.value = 0.55
 * n.scale(0, 10) // n.value == 5.5
 * n.clip(0, 4.5) // n.value == 4.5
 * n.round(0) // n.value == 4
 *
 * const m = 3.75
 * let scaled = KDNumber.scale(m, [0, 10], [0, 1]) // scaled == 0.37
 * let clipped = KDNumber.clip(m, [0, 3]) // clipped == 3.0
 * let rounded = KDNumber.round(m, 1) // rounded == 3.8
 *
 * const l = new KDNumber(100, [0, 1])
 * cosnt k = l.scale(0, 10).clip(0, 999.424).round(0)
 * console.log(k.value == 999) // true
 * console.log(l.value == k.value) // true
 * ```
 */
export class KDNumber {
  /**
   * Class for mutating a number via scale/clip/round.
   * @param {number | string | KDNumber} value - The number value.
   * @param {[number, number]} [range=[0, 1]] - Initial known range.
   * @example
   * ```
   * const n = new KDNumber(0.55, [0, 1]) // n.value = 0.55
   * n.scale(0, 10) // n.value == 5.5
   * n.clip(0, 4.5) // n.value == 4.5
   * n.round(0) // n.value == 4
   *
   * const m = 3.75
   * let scaled = KDNumber.scale(m, [0, 10], [0, 1]) // scaled == 0.37
   * let clipped = KDNumber.clip(m, [0, 3]) // clipped == 3.0
   * let rounded = KDNumber.round(m, 1) // rounded == 3.8
   *
   * const l = new KDNumber(100, [0, 1])
   * cosnt k = l.scale(0, 10).clip(0, 999.424).round(0)
   * console.log(k.value == 999) // true
   * console.log(l.value == k.value) // true
   * ```
   */
  constructor(value, range = [0, 1]) {
    this.value =
      typeof value === 'number'
        ? value
        : !Number.isNaN(parseFloat(`${value}`))
        ? parseFloat(`${value}`)
        : value.value;
    this.range = range;
    this.scale = (min = 0, max = 1) => {
      this.value = KDNumber.scale(this.value, this.range, [min, max]);
      this.range = [min, max];
      return this;
    };
    this.clip = (min, max) => {
      this.value = KDNumber.clip(this.value, [min, max]);
      return this;
    };
    this.round = (places = 0) => {
      this.value = KDNumber.round(this.value, places);
      return this;
    };
  }
  /**
   * @static
   * Scale the value from one range to another.
   * @param {number} value - The original value.
   * @param {[number, number]} initialRange - Initial number range scale.
   * @param {[number, number]} targetRange - Target number range scale.
   * @returns {number} The scaled result.
   * @example
   * ```
   * const n = 3.75
   * let scaled = KDNumber.scale(n, [0, 10], [0, 1]) // scaled == 0.37
   * ```
   */
  static scale(value, initialRange, targetRange) {
    const fix = KDNumber.floatingPointFix;
    const r1 = initialRange;
    const r2 = targetRange;
    const r1Size = r1[1] - r1[0];
    const r2Size = r2[1] - r2[0];
    const x = fix(value - r1[0]);
    const y = fix(x * r2Size);
    const z = fix(y / r1Size);
    const scaled = fix(z + r2[0]);
    return scaled;
  }
  /**
   * @static
   * Limit a value to a hard minimum and maximum.
   * @param {number} value - The original value.
   * @param {[number, number]} range - The `[min, max]` allowed values.
   * @returns {number} The clipped result.
   * @example
   * ```
   * const n = 3.75
   * let clipped = KDNumber.clip(n, [0, 3]) // clipped == 3.0
   * ```
   */
  static clip(value, range) {
    return KDNumber.floatingPointFix(
      Math.min(Math.max(range[0], value), range[1])
    );
  }
  /**
   * @static
   * Round a value to a specific number of places.
   * Digits < 5 are rounded down.
   * @param {number} value - The original value.
   * @param {number} [places=0] - The desired number of decimal places.
   * `0` rounds to a whole number.
   * @returns {number} The rounded result.
   * @example
   * ```
   * const n = 3.75
   * let rounded = KDNumber.round(n, 1) // rounded == 3.8
   * ```
   */
  static round(value, places = 0) {
    return KDNumber.floatingPointFix(
      Number(Math.round(Number(value + 'e' + places)) + 'e-' + places)
    );
  }
  /**
   * @static
   * Fix the floating point error found in JS math.
   * @param {number} value - The value or arithmetic expression.
   * @param {number} [repeat=6] - The number of 0's or 9's to allow to repeat.
   * @returns {number} The corrected value.
   * @example
   * ```
   * let wrong = 0.2 + 0.1 // 0.30000000000000004
   * let correct = KDNumber.floatingPointFix(0.2 + 0.1) // 0.3
   *
   * let wrongAgain = 0.3 - 0.1 // 0.19999999999999998
   * let notWrong = KDNumber.floatingPointFix(0.3 - 0.1) // 0.2
   * ```
   */
  static floatingPointFix(value, repeat = 6) {
    /* Value is not applicable */
    if (!value || Number.isNaN(parseFloat(`${value}`))) return value;
    /* No decimal */
    const [intPart, decimalPart] = `${value}`.split('.');
    if (!decimalPart) return value;
    const regex = new RegExp(`(9{${repeat},}|0{${repeat},})(\\d)*$`, 'gm');
    const matched = decimalPart.match(regex);
    /* No floating point problem */
    if (!matched) return value;
    const [wrongPart] = matched;
    const correctDecimalsLength = decimalPart.length - wrongPart.length;
    const fixed = parseFloat(`${intPart}.${decimalPart}`);
    return parseFloat(fixed.toFixed(correctDecimalsLength));
  }
}
