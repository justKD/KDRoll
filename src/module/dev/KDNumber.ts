/**
 * @file KDNumber.ts
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview export class KDNumber
 * Class for mutating a number with scale/clip/round. Also includes a static method
 * that can compensate for JS floating point errors. Internal transformations automatically
 * apply a JS floating point error fix.
 */

/**
 * Class for mutating a number with scale/clip/round. Also includes a static method
 * that can compensate for JS floating point errors. Internal transformations automatically
 * apply a JS floating point error fix.
 * @example `Given a number value and a known range, we can mutate the value in multiple ways.`
 * ```
 * const kdn = new KDNumber(0.55, [0, 1]); // n.value = 0.55
 * kdn.scale(0, 10); // 5.5
 * kdn.clip(0, 4.5); // 4.5
 * kdn.round(0); // 4
 * const num: number = kdn.value(); // retrieve the `number` value
 * ```
 *
 * @example `Static methods can be used for quick access to transformations, but may require range parameters.`
 * ```
 * const num = 3.75
 * const scaled = KDNumber.scale(num, [0, 10], [0, 1]); // scaled == 0.37
 * const clipped = KDNumber.clip(num, [0, 3]); // clipped == 3.0
 * const rounded = KDNumber.round(num, 1); // rounded == 3.8
 * ```
 *
 * @example `Each method returns itself so methods can be chained.`
 * ```
 * const kdn = new KDNumber(100, [0, 1]);
 * kdn.scale(0, 10).clip(0, 999.424).round(0).value();
 * console.log(kdn.value() === 999) // true
 * ```
 */
export class KDNumber {
  /** Get the current number value. */
  value: () => number;

  /** Set the current number value. */
  setValue: (value: number) => void;

  /** Get the current known range. */
  range: () => [number, number];

  /** Set the current known range. */
  setRange: (range: [number, number]) => void;

  /**
   * Scale the current value to a new range and update the current range.
   * Initial range is inferred from the current known range.
   * Automatically applies a JS floating point error fix.
   * @param {number} min - The minimum value of the new range.
   * @param {number} max - The maximum value of the new range.
   * @returns {KDNumber} The calling instance of `KDNumber`.
   *
   * @example `The initial range is inferred from the current known range.`
   * ```
   * const n = new KDNumber(0.55, [0, 1]); // initial range is 0-1
   * n.scale(0, 10); // scale from a range of 0-1 to a range of 0-10
   * const num = n.value(); // num = 5.5
   * ```
   *
   * @example `Scale a value from a range of [0, 1] to [-1, 1]`
   * ```
   * const n: new KDNumber(0.5, [0, 1]);
   * n.scale(-1, 1);
   * const num = n.value(); // num == 0
   * ```
   *
   * @example `Scale a value from a range of [0, 1] to [0, 127]`
   * ```
   * const n: new KDNumber(0.5, [0, 1]);
   * n.scale(0, 127);
   * const num = n.value(); // num == 63.5
   * ```
   */
  scale: (min: number, max: number) => KDNumber;

  /**
   * Limit the current value to a hard minimum and maximum.
   * Automatically applies a JS floating point error fix.
   * @param {number} min - The minimum possible value.
   * @param {number} max - The maximum possible value.
   * @returns {KDNumber} The calling instance of `KDNumber`.
   * @example
   * ```
   * const n = new KDNumber(0.55, [0, 1]);
   * n.clip(0, 0.5);
   * const num = n.value(); // 0.5
   * ```
   */
  clip: (min: number, max: number) => KDNumber;

  /**
   * Round the current value to a specific number of places.
   * Digits < 5 are rounded down. Automatically applies a JS floating point error fix.
   * @param {number} [places=0] - The desired number of decimal places. `0` rounds to a whole number.
   * @returns {KDNumber} The calling instance of `KDNumber`.
   * @example
   * ```
   * const n = new KDNumber(3.753);
   * n.round(2); // n.value() == 3.75
   * n.round(1); // n.value() == 3.8
   * n.round(0); // n.value() == 4
   * ```
   */
  round: (places: number) => KDNumber;

  /**
   * Class for mutating a number with scale/clip/round. Also includes a static method
   * that can compensate for JS floating point errors. Internal transformations automatically
   * apply a JS floating point error fix.
   * @example `Given a number value and a known range, we can mutate the value in multiple ways.`
   * ```
   * const kdn = new KDNumber(0.55, [0, 1]); // n.value = 0.55
   * kdn.scale(0, 10); // 5.5
   * kdn.clip(0, 4.5); // 4.5
   * kdn.round(0); // 4
   * const num: number = kdn.value(); // retrieve the `number` value
   * ```
   *
   * @example `Static methods can be used for quick access to transformations, but may require range parameters.`
   * ```
   * const num = 3.75
   * const scaled = KDNumber.scale(num, [0, 10], [0, 1]); // scaled == 0.37
   * const clipped = KDNumber.clip(num, [0, 3]); // clipped == 3.0
   * const rounded = KDNumber.round(num, 1); // rounded == 3.8
   * ```
   *
   * @example `Each method returns itself so methods can be chained.`
   * ```
   * const kdn = new KDNumber(100, [0, 1]);
   * kdn.scale(0, 10).clip(0, 999.424).round(0).value();
   * console.log(kdn.value() === 999) // true
   * ```
   */
  constructor(
    value: number | string | KDNumber,
    range: [number, number] = [0, 1]
  ) {
    let v: number =
      typeof value === 'number'
        ? value
        : !Number.isNaN(parseFloat(`${value}`))
        ? parseFloat(`${value}`)
        : (value as KDNumber).value();

    let r: [number, number] = range;

    this.scale = (min: number = 0, max: number = 1): KDNumber => {
      v = KDNumber.scale(v, r, [min, max]);
      r = [min, max];
      return this;
    };

    this.clip = (min: number, max: number): KDNumber => {
      v = KDNumber.clip(v, [min, max]);
      return this;
    };

    this.round = (places: number = 0): KDNumber => {
      v = KDNumber.round(v, places);
      return this;
    };

    this.value = () => v;

    this.range = () => r;

    this.setValue = (value: number) => {
      v = value;
    };

    this.setRange = (range: [number, number]) => {
      r = range;
    };
  }

  /**
   * @static
   * Scale the value from one range to another.
   * Automatically applies a JS floating point error fix.
   * @param {number} value - The original value.
   * @param {[number, number]} initialRange - Initial number range scale.
   * @param {[number, number]} targetRange - Target number range scale.
   * @returns {number} The scaled `number`.
   *
   * @example `Scale a value from a range of [0, 10] to a range of [0, 1].`
   * ```
   * const n: number = 3.75;
   * const scaled: number = KDNumber.scale(n, [0, 10], [0, 1]); // scaled == 0.375
   * ```
   *
   * @example `Scale a value from a range of [0, 1] to [-1, 1]`
   * ```
   * const n: number = 0.5;
   * const scaled: number = KDNumber.scale(n, [0, 1], [-1, 1]); // scaled == 0
   * ```
   *
   * @example `Scale a value from a range of [0, 1] to [0, 127]`
   * ```
   * const n: number = 0.5;
   * const scaled: number = KDNumber.scale(n, [0, 1], [0, 127]); // scaled == 63.5
   * ```
   */
  static scale(
    value: number,
    initialRange: [number, number],
    targetRange: [number, number]
  ): number {
    const fix = KDNumber.floatingPointFix;
    const r1 = initialRange;
    const r2 = targetRange;

    const r1Size = fix(r1[1] - r1[0]);
    const r2Size = fix(r2[1] - r2[0]);

    const x = fix(value - r1[0]);
    const y = fix(x * r2Size);
    const z = fix(y / r1Size);
    const scaled = fix(z + r2[0]);

    return scaled;
  }

  /**
   * @static
   * Limit a value to a hard minimum and maximum.
   * Automatically applies a JS floating point error fix.
   * @param {number} value - The original value.
   * @param {[number, number]} range - The `[min, max]` allowed values.
   * @returns {number} The clipped `number`.
   * @example
   * ```
   * const n: number = 3.75;
   * const clipped: number = KDNumber.clip(n, [0, 3]); // clipped == 3.0
   * ```
   */
  static clip(value: number, range: [number, number]): number {
    const fix = KDNumber.floatingPointFix;
    const clipMin = (v: number) => fix(Math.max(range[0], v));
    const clipMax = (v: number) => fix(Math.min(v, range[1]));
    const clipped = clipMax(clipMin(value));
    return clipped;
  }

  /**
   * @static
   * Round a value to a specific number of places.
   * Digits < 5 are rounded down.
   * Automatically applies a JS floating point error fix.
   * @param {number} value - The original value.
   * @param {number} [places=0] - The desired number of decimal places. `0` rounds to a whole number.
   * @returns {number} The rounded `number`.
   * @example
   * ```
   * const n = 3.753;
   * const twoPlaces = KDNumber.round(n, 2); // twoPlaces == 3.75
   * const onePlace = KDNumber.round(n, 1); // onePlace == 3.8
   * const wholeNumber = KDNumber.round(n, 0); // wholeNumber == 4
   * ```
   */
  static round(value: number, places: number = 0): number {
    return KDNumber.floatingPointFix(
      Number(Math.round(Number(value + 'e' + places)) + 'e-' + places)
    );
  }

  /**
   * @static
   * Account for the floating point error found in JS math.
   * This assumes you aren't intentionally working with values that require a decimal place resolution
   * greater than the `repeat` parameter. If so, increase that value or don't use this function.
   * @param {number} value - The value or arithmetic expression.
   * @param {number} [repeat=10] - The number of 0's or 9's to allow to repeat. Default is `10`.
   * @returns {number} The corrected `number`.
   * @example
   * ```
   * const fix = KDNumber.floatingPointFix;
   *
   * let hasError = 0.2 + 0.1 // 0.30000000000000004
   * let corrected = fix(0.2 + 0.1) // 0.3
   *
   * let wrongAgain = 0.3 - 0.1 // 0.19999999999999998
   * let notWrong = fix(0.3 - 0.1) // 0.2
   * ```
   */
  static floatingPointFix(value: number, repeat: number = 6): number {
    /* Value is not applicable */
    if (!value || Number.isNaN(parseFloat(`${value}`))) return value;

    /* No decimal */
    const [intPart, decimalPart] = `${value}`.split('.');
    if (!decimalPart) return value;

    /* Check for a possible error by looking for a string of 
       length `repeat` of consecutively repeating 9's or 0's. */
    const regex = new RegExp(`(9{${repeat},}|0{${repeat},})(\\d)*$`, 'gm');
    const matched = decimalPart.match(regex);

    /* No floating point problem */
    if (!matched) return value;

    /* If it looks like there is an error, round it off. */
    const [wrongPart] = matched;
    const correctDecimalsLength = decimalPart.length - wrongPart.length;
    const fixed = parseFloat(`${intPart}.${decimalPart}`);
    return parseFloat(fixed.toFixed(correctDecimalsLength));
  }
}
