# KDRollJS

##### v 1.3.3 | © Cadence Holmes 2020 | MIT License

Class representing a pseudorandom number manager. Includes Mersenne Twister uniform distribution, Box Mueller gaussian distribution, n-sided die rolling, history of variable max size, elementary statistics, and scale/clip/round convenience functions.

<img src="https://raw.githubusercontent.com/justKD/KDRollJS/master/readme-screenshot-1.png" alt="" width="800" />

<img src="https://raw.githubusercontent.com/justKD/KDRollJS/master/readme-screenshot-2.png" alt="" width="800" />

## Try It

Try it out on [CodePen](https://codepen.io/justKD/pen/MWwpzWm/left/?editors=0011/).

## Basic Use

```
const roll = new KDRoll()

const rand = roll.random() // random number in the range 0-1
const d6 = roll.d(6)       // random integer in the range 1-6
const d20 = roll.d(20)     // random integer in the range 1-20
```

## Extended Use

```
// KDRoll can use either normal or gaussian distribution.

const roll = new KDRoll();
const gaussSkew = roll.gaussian(0.85);
```

```
// Generate an  RFC4122 version 4 compliant unique identifier.
const roll = new KDRoll();
const uid = roll.uid();
```

```
// Roll until the internal history is filled, then report stats.

const roll = new KDRoll();
let i = roll.maxHistory();
while (i--) roll.random();
const stats = {
    history: roll.history(),
    mean: roll.mean(),
    median: roll.median(),
    modes: roll.modes(),
    standardDeviation: roll.stdDev() // normalized 0-1
};
console.log(stats);
```

```
// Round to two decimal places using the static `KDRoll.round()`.

const twoDecimalPlaces = () => {
const roll = new KDRoll()
    const rounded = KDRoll.round(roll.random(), 2);
    return rounded;
};
console.log(twoDecimalPlaces());
```

```
// Numbers can be scaled from any known range to another.

const arbitraryScaling = () => {
	const roll = new KDRoll()
	const scale = KDRoll.scale;
    const scaled = scale(roll.random(), [0, 1], [5, 72]);
    return scaled;
}
console.log(arbitraryScaling())
```

```
// Numbers can be clipped to a minimum and maximum allowed value.

const clipped = () => {
	const roll = new KDRoll()
	const clip = KDRoll.clip;
	const clipped = clip(roll.random(), [0.2, 0.8]);
	return clipped;
};
console.log(clipped());
```

```
// Using gaussian distribution, return a whole number between 1 and the maximum safe integer value.

const wholeNumber = () => {
	const roll = new KDRoll()

	const max = Number.MAX_SAFE_INTEGER;
	const scale = KDRoll.scale;
	const round = KDRoll.round;

    const scaled = scale(roll.gaussian(), [0, 1], [0, max]);
    const whole = round(scaled, 0);
    return whole;
}
console.log(wholeNumber())
```

## API

<table>
<tbody align="left">
    <col width="10%">
    <col width="40%">
    <col width="10%">
    <col width="40%">
    <tr>
        <th>Method</th>
        <th>Parameters</th>
        <th>Return</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>.uniform()</code></td>
        <td></td>
        <td><code>{number}</code></td>
        <td>Generates a 53-bit random real in the interval [0, 1] with normal distribution.</td>
    </tr>
    <tr>
        <td><code>.random()</code></td>
        <td></td>
        <td><code>{number}</code></td>
        <td>Convenience function. Alias for <code>.uniform()</code>.</td>
    </tr>
    <tr>
        <td><code>.gaussian(skew)</code></td>
        <td>
            <ul>
                <li><code>skew?</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            In the range [-1, 1]. Negative values skew data RIGHT, positive values skew data LEFT. Default <code>0</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td><code>{number}</code></td>
        <td>Generates a 53-bit random real in the interval [0, 1] with gaussian distribution.
        </td>
    </tr>
    <tr>
        <td><code>.d(sides)</code></td>
        <td>
             <ul>
                <li><code>sides</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The number of sides the die should represent. Allows but ignores decimals.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td><code>{number}</code></td>
        <td>Simulates a die-rolling metaphor. Generates a 53-bit random real in the interval [0, 1] with normal distribution, then scales it to a range [1, n] where n is the number of sides, then rounds to whole number.</td>
    </tr>
    <tr>
        <td><code>.uid()</code></td>
        <td></td>
        <td>
            <code>{string}</code> - RFC4122 version 4 compliant unique identifier.
        </td>
        <td>Generate an RFC4122 version 4 compliant unique identifier</td>
    </tr>
    <tr>
        <td><code>.seed(seed)</code></td>
        <td>
            <ul>
                <li><code>seed?</code>
                    <ul>
                        <li>
                            <code>{number|number[]}</code>
                        </li>
                        <li>
                            Unsigned 32-bit integer (<code>number</code>) or <code>number[]</code> of arbitrary size/values.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td>
            <code>{number|number[]}</code> - The current seed.
        </td>
        <td>Set or get the seed. Automatically clears history.</td>
    </tr>
    <tr>
        <td><code>.history()</code></td>
        <td></td>
        <td>
            <code>{number[]}</code> - The current history.
        </td>
        <td>Retrieve a copy of the internal <code>history</code> with no references.</td>
    </tr>
    <tr>
        <td><code>.maxHistory(size)</code></td>
        <td>
            <ul>
                <li><code>size?</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The maximum history size. Default <code>1000</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td>
            <code>{number}</code> - The current <code>maxHistory</code>
        </td>
        <td>Set or get the maximum history size.</td>
    </tr>
    <tr>
        <td><code>.clearHistory()</code></td>
        <td></td>
        <td></td>
        <td>Reset the internal <code>history</code>. Retains the current <code>maxHistory</code>.</td>
    </tr>
    <tr>
        <td><code>.mean(arr)</code></td>
        <td>
            <ul>
                <li><code>arr?</code>
                    <ul>
                        <li>
                            <code>{number[]}</code>
                        </li>
                        <li>
                            Target array on which to operate. Defaults to the current <code>history</code> if <code>!arr</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td><code>{number}</code></td>
        <td>Calculate the statistical mean of a <code>number[]</code> or the current <code>history</code>.</td>
    </tr>
    <tr>
        <td><code>.median(arr)</code></td>
        <td>
            <ul>
                <li><code>arr?</code>
                    <ul>
                        <li>
                            <code>{number[]}</code>
                        </li>
                        <li>
                            Target array on which to operate. Defaults to the current <code>history</code> if <code>!arr</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td>
            <code>{number}</code>
        </td>
        <td>
            Calculate the statistical median of a <code>number[]</code> or the current <code>history</code>.
        </td>
    </tr>
    <tr>
        <td><code>.modes(arr)</code></td>
        <td>
            <ul>
                <li><code>arr?</code>
                    <ul>
                        <li>
                            <code>{number[]}</code>
                        </li>
                        <li>
                            Target array on which to operate. Defaults to the current <code>history</code> if <code>!arr</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td>
            <code>{number[]}</code>
        </td>
        <td>
            Calculate the statistical modes of a <code>number[]</code> or the current <code>history</code>.
        </td>
    </tr>
    <tr>
        <td><code>.standardDeviation(arr)</code></td>
        <td>
            <ul>
                <li><code>arr?</code>
                    <ul>
                        <li>
                            <code>{number[]}</code>
                        </li>
                        <li>
                            Target array on which to operate. Defaults to the current <code>history</code> if <code>!arr</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td>
            <code>{number}</code> - Standard deviation is normalized [0, 1].
        </td>
        <td>
            Calculate the standard deviation of a <code>number[]</code> or the current <code>history</code>.
        </td>
    </tr>
</tbody>
</table>

### Static Methods

<table>
<tbody align="left">
    <tr>
        <th>Method</th>
        <th>Parameters</th>
        <th>Return</th>
        <th>Description</th>
    </tr>
    <tr>
        <td><code>KDRoll.random()</code></td>
        <td></td>
        <td><code>{number}</code></td>
        <td>Convenience function to generate a randomly seeded random number normalized [0, 1].</td>
    </tr>
    <tr>
        <td><code>KDRoll.d(sides)</code></td>
        <td>
            <ul>
                <li><code>sides</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The desired number of sides to simulate.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td>
            <code>{number}</code>
        </td>
        <td>
            Convenience function to generate a randomly seeded random number in the range [1, sides].
        </td>
    </tr>
    <tr>
        <td><code>KDRoll.createRandomSeed()</code></td>
        <td></td>
        <td>
            <code>{number[]}</code> - Randomly generated array of random size <code>(size > 20 < 623)</code>.
        </td>
        <td>Generate an array of random size and contents to use as a seed.</td>
    </tr>
    <tr>
        <td><code>KDRoll.scale(value, r1, r2)</code></td>
        <td>
            <ul>
                <li><code>value</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The initial value.
                        </li>
                    </ul>
                </li>
                <li><code>r1</code>
                    <ul>
                        <li>
                            <code>{[number, number]}</code>
                        </li>
                        <li>
                            The initial range [min, max].
                        </li>
                    </ul>
                </li>
                <li><code>r2</code>
                    <ul>
                        <li>
                            <code>{[number, number]}</code>
                        </li>
                        <li>
                            The target range [min, max].
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td><code>{number}</code></td>
        <td>Scale a value from a known range to a new range.</td>
    </tr>
    <tr>
        <td><code>KDRoll.clip(value, range)</code></td>
        <td>
            <ul>
                <li><code>value</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The initial value.
                        </li>
                    </ul>
                </li>
                <li><code>range</code>
                    <ul>
                        <li>
                            <code>{[number, number]}</code>
                        </li>
                        <li>
                            Array containing the minimum and maximum possible values.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td><code>{number}</code></td>
        <td>Limit a value to a hard minimum and maximum.</td>
    </tr>
    <tr>
        <td><code>KDRoll.round(value, places)</code></td>
        <td>
            <ul>
                <li><code>value</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The initial value.
                        </li>
                    </ul>
                </li>
                <li><code>places?</code>
                    <ul>
                        <li>
                            <code>{number}</code>
                        </li>
                        <li>
                            The desired number of decimal places. Passing <code>0</code> results in a whole number. Default <code>0</code>.
                        </li>
                    </ul>
                </li>
            </ul>
        </td>
        <td></td>
        <td>Round a value to a specific number of places. Decimal values < 5 (for any given place) are rounded down.</td>
    </tr>
</tbody>
</table>
