/**
 * @file KDRoll.bundle.js
 * @version 1.3.3
 * @author Cadence Holmes
 * @copyright Cadence Holmes 2020
 * @license MIT
 * @fileoverview `KDRoll` is a class representing a random number manager.
 * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
 * distribution, n-sided die rolling, history of variable max size, elementary
 * statistics, and scale/clip/round convenience functions.
 */

class KDNumber {
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
  static clip(value, range) {
    return KDNumber.floatingPointFix(
      Math.min(Math.max(range[0], value), range[1])
    );
  }
  static round(value, places = 0) {
    return KDNumber.floatingPointFix(
      Number(Math.round(Number(value + 'e' + places)) + 'e-' + places)
    );
  }
  static floatingPointFix(value, repeat = 6) {
    if (!value || Number.isNaN(parseFloat(`${value}`))) return value;
    const [intPart, decimalPart] = `${value}`.split('.');
    if (!decimalPart) return value;
    const regex = new RegExp(`(9{${repeat},}|0{${repeat},})(\\d)*$`, 'gm');
    const matched = decimalPart.match(regex);
    if (!matched) return value;
    const [wrongPart] = matched;
    const correctDecimalsLength = decimalPart.length - wrongPart.length;
    const fixed = parseFloat(`${intPart}.${decimalPart}`);
    return parseFloat(fixed.toFixed(correctDecimalsLength));
  }
}
class KDHistory extends Array {
  constructor() {
    super();
    let max = 1000;
    this.max = (size) => {
      const s = size;
      if (Number.isSafeInteger(s)) max = s;
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
class KDUniform {
  constructor(seed = null) {
    const N = 624;
    let mt = new Array(N);
    let mti = null;
    const _state = { seed: seed };
    const _private = {
      seed: {
        withInt: (seed) => {
          let s;
          mt[0] = seed >>> 0;
          for (mti = 1; mti < N; mti++) {
            s = mt[mti - 1] ^ (mt[mti - 1] >>> 30);
            mt[mti] =
              ((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
              (s & 0x0000ffff) * 1812433253 +
              mti;
            mt[mti] >>>= 0;
          }
        },
        withArray: (seed) => {
          const isUint32Array = seed.constructor === Uint32Array;
          let s;
          let v = isUint32Array ? [...seed] : seed;
          let i = 1;
          let j = 0;
          let k = N > v.length ? N : v.length;
          _private.seed.withInt(v[0]);
          for (; k > 0; k--) {
            s = mt[i - 1] ^ (mt[i - 1] >>> 30);
            const a = (((s & 0xffff0000) >>> 16) * 1664525) << 16;
            const b = (s & 0x0000ffff) * 1664525;
            mt[i] = (mt[i] ^ (a + b)) + v[j] + j;
            mt[i] >>>= 0;
            i++;
            j++;
            if (i >= N) {
              mt[0] = mt[N - 1];
              i = 1;
            }
            if (j >= v.length) j = 0;
          }
          for (k = N - 1; k; k--) {
            s = mt[i - 1] ^ (mt[i - 1] >>> 30);
            const a = (((s & 0xffff0000) >>> 16) * 1566083941) << 16;
            const b = (s & 0x0000ffff) * 1566083941;
            mt[i] = (mt[i] ^ (a + b)) - i;
            mt[i] >>>= 0;
            i++;
            if (i >= N) {
              mt[0] = mt[N - 1];
              i = 1;
            }
          }
          if (mt.length < 1) mt[0] = 0x80000000;
        },
        withCrypto: () => {
          _state.seed = KDUniform.createRandomSeed();
          _private.seed.withArray(_state.seed);
        },
      },
      init: (seed) => {
        const ensureUint = (num) => {
          if (num > Number.MAX_SAFE_INTEGER) return -1;
          if (num < 0) num = Math.abs(num);
          if (!Number.isInteger(num)) num = Number(num.toFixed(0));
          if (!Number.isSafeInteger(num)) num = -1;
          return num;
        };
        let s = seed;
        if (typeof s === 'number') {
          let ss = s;
          ss = ensureUint(ss);
          if (ss >= 0) {
            _state.seed = ss;
            _private.seed.withInt(ss);
          } else {
            console.warn('Seed integer is unsafe.');
            console.log('Generating a random seed array instead.');
            _private.seed.withCrypto();
          }
        } else if (s && s.every && s.every((v) => typeof v === 'number')) {
          const isUint32Array = s.constructor === Uint32Array;
          let ss = isUint32Array ? [...s] : s;
          if (ss.length > 0) {
            ss = ss.map((x) => ensureUint(x));
            if (ss.includes(-1)) {
              console.warn('Seed array can not contain unsafe integers.');
              console.log('Generating a random seed array instead.');
              _private.seed.withCrypto();
            } else {
              _state.seed = ss;
              _private.seed.withArray(ss);
            }
          } else {
            console.warn('Seed array can not be empty.');
            console.log('Generating a random seed array instead.');
            _private.seed.withCrypto();
          }
        } else {
          _private.seed.withCrypto();
        }
      },
      int32: () => {
        const M = 397;
        const UM = 0x80000000;
        const LM = 0x7fffffff;
        const MA = 0x9908b0df;
        let y;
        let kk = 0;
        let mag01 = [0, MA];
        if (mti !== null) {
          for (; kk < N - M; kk++) {
            y = (mt[kk] & UM) | (mt[kk + 1] & LM);
            mt[kk] = mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1];
          }
          for (; kk < N - 1; kk++) {
            y = (mt[kk] & UM) | (mt[kk + 1] & LM);
            mt[kk] = mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1];
          }
          y = (mt[N - 1] & UM) | (mt[0] & LM);
          mt[N - 1] = mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1];
          mti = 0;
        }
        y = mt[mti++];
        y ^= y >>> 11;
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= y >>> 18;
        return y >>> 0;
      },
    };
    this.random = () => {
      const fix = (value, repeat = 6) => {
        if (!value || Number.isNaN(parseFloat(`${value}`))) return value;
        const [intPart, decimalPart] = `${value}`.split('.');
        if (!decimalPart) return value;
        const regex = new RegExp(`(9{${repeat},}|0{${repeat},})(\\d)*$`, 'gm');
        const matched = decimalPart.match(regex);
        if (!matched) return value;
        const [wrongPart] = matched;
        const correctDecimalsLength = decimalPart.length - wrongPart.length;
        const fixed = parseFloat(`${intPart}.${decimalPart}`);
        return parseFloat(fixed.toFixed(correctDecimalsLength));
      };
      const c = _private.int32();
      const a = c >>> 5;
      const b = c >>> 6;
      const x = fix(a * 67108864.0 + b);
      const y = fix(1.0 / 9007199254740992.0);
      const result = fix(x * y);
      return result;
    };
    this.seed = (seed) => {
      if (seed !== undefined && seed !== null) _private.init(seed);
      return _state.seed;
    };
    _private.init(seed);
  }
  static createRandomSeed() {
    const max = 623;
    const min = 20;
    const len = Math.floor(Math.random() * Math.floor(max - min)) + min;
    if (window.crypto) {
      return [...window.crypto.getRandomValues(new Uint32Array(len))];
    } else {
      let crypto;
      try {
        crypto = require('crypto');
        const buf = Buffer.alloc(len);
        return [...crypto.randomFillSync(buf)];
      } catch (_a) {
        const randomInt = () => {
          return Math.floor(Number(Math.random().toFixed(4)) * 1000);
        };
        return new Array(len).fill(0).map((x) => randomInt());
      }
    }
  }
}
const KDGaussian = (uniformGenerator, skew = 0) => {
  const scaleSkew = (sk) => {
    let n = new KDNumber(Math.abs(sk));
    n.clip(0, 1);
    const skewRight = () => {
      sk = 1 - n.value;
    };
    const skewLeft = () => {
      n.scale(0, 4);
      sk = n.value;
    };
    const noSkew = () => (sk = 1);
    sk === 0 ? noSkew() : sk < 0 ? skewRight() : skewLeft();
    return sk;
  };
  skew = scaleSkew(skew);
  let u = 0;
  let v = 0;
  if (typeof uniformGenerator.random === 'function') {
    while (u === 0) u = uniformGenerator.random();
    while (v === 0) v = uniformGenerator.random();
  }
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5;
  if (num > 1 || num < 0) num = Number(KDGaussian(new KDUniform(), skew));
  num = Math.pow(num, skew);
  return num;
};
const KDElemstats = {
  mean: (arr) => {
    const sum = arr.reduce((previous, current) => (current += previous));
    return KDNumber.floatingPointFix(sum / arr.length);
  },
  median: (arr) => {
    arr.sort((a, b) => a - b);
    const median = (arr[(arr.length - 1) >> 1] + arr[arr.length >> 1]) / 2;
    return KDNumber.floatingPointFix(median);
  },
  modes: (arr) => {
    const modes = [];
    const counts = [];
    let max = 0;
    arr.forEach((number) => {
      counts[number] = (counts[number] || 0) + 1;
      if (counts[number] > max) max = counts[number];
    });
    counts.forEach((count, index) => {
      if (count === max) modes.push(KDNumber.floatingPointFix(index));
    });
    return modes;
  },
  stdDev: (arr) => {
    const fix = KDNumber.floatingPointFix;
    const avg = KDElemstats.mean(arr);
    const sqDiffs = arr.map((value) =>
      fix(fix(value - avg) * fix(value - avg))
    );
    const avgSqRt = fix(Math.sqrt(KDElemstats.mean(sqDiffs)));
    const stdDev = KDNumber.scale(avgSqRt, [0, Math.max(...arr)], [0, 1]);
    return stdDev;
  },
};

/**
 * `KDRoll` is a class representing a random number manager.
 * Includes Mersenne Twister uniform distribution, Box Mueller gaussian
 * distribution, n-sided die rolling, history of variable max size, elementary
 * statistics, and scale/clip/round convenience functions.
 */
class KDRoll {
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
    const uniform = new KDUniform(seed);
    let history = new KDHistory();
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
          history.push(n.value);
          return n.value;
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
  static random() {
    const roll = new KDRoll();
    return roll.random();
  }
  static d(sides) {
    const roll = new KDRoll();
    return roll.d(sides);
  }
  static createRandomSeed() {
    return KDUniform.createRandomSeed();
  }
  static scale(value, r1, r2) {
    return KDNumber.scale(value, r1, r2);
  }
  static clip(value, range) {
    return KDNumber.clip(value, range);
  }
  static round(value, places) {
    return KDNumber.round(value, places);
  }
}
const handleNonModule = function (exports) {
  exports.KDRoll = KDRoll;
};
const namespace = 'kd';
(function (declareExports) {
  const root = window;
  const rootDefine = root['define'];
  const amdRequire = root && typeof rootDefine === 'function' && rootDefine.amd;
  const esm = typeof module === 'object' && typeof exports === 'object';
  const nonmodule = root;
  if (amdRequire) {
    root['define'](['exports'], declareExports);
    return;
  }
  if (esm) {
    exports !== null && declareExports(exports);
    module !== null && (module.exports = exports);
    return;
  }
  if (nonmodule) {
    declareExports((root[namespace] = root[namespace] || {}));
    return;
  }
  console.warn(
    'Unable to load as ES module. Use AMD, CJS, add an export, or use as non-module script.'
  );
})(handleNonModule);
