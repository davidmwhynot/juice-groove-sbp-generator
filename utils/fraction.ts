import { defined } from '.';

// eslint-disable-next-line @typescript-eslint/ban-types
export type StringOrNumber = String | string | Number | number;
export type MathInput = StringOrNumber | Fraction;

export const fraction = (...args: ConstructorParameters<typeof Fraction>) =>
	new Fraction(...args);

export class Fraction {
	static zero(): Fraction {
		return new Fraction(0);
	}

	numerator: number;
	denominator: number;

	constructor(
		numerator: MathInput | undefined,
		denominator?: StringOrNumber | undefined
	) {
		const invalidInput = `Invalid input. numerator input: "${numerator}" denominator input: "${denominator}"`;
		/* double argument invocation */
		if (defined(numerator) && defined(denominator)) {
			if (typeof numerator === 'number' && typeof denominator === 'number') {
				this.numerator = numerator;
				this.denominator = denominator;

				this.normalize();

				return;
			}

			if (typeof numerator === 'string' && typeof denominator === 'string') {
				// what are they?
				// hmm....
				// assume they are floats?
				this.numerator = parseFloat(numerator.replace(',', '.'));
				this.denominator = parseFloat(denominator.replace(',', '.'));

				this.normalize();

				return;
			}
			// TODO: should we handle cases when one argument is String and another is Number?

			throw new Error(invalidInput); // could not parse
		}

		/* single-argument invocation */
		if (typeof denominator === 'undefined') {
			const num = numerator; // swap variable names for legibility

			if (num && num instanceof Fraction) {
				this.numerator = num.numerator;
				this.denominator = num.denominator;

				this.normalize();

				return;
			}
			if (typeof num === 'number') {
				// just a straight number init
				this.numerator = num;
				this.denominator = 1;

				this.normalize();

				return;
			}
			if (typeof num === 'string') {
				const arr = num.split(' ');

				// hold the first and second part of the fraction, e.g. a = '1' and b = '2/3' in 1 2/3
				// or a = '2/3' and b = undefined if we are just passed a single-part number
				const a = arr[0];
				const b = arr[1];

				/* compound fraction e.g. 'A B/C' */
				//  if a is an integer ...
				if (a && Number(a) % 1 === 0 && b && b.match('/')) {
					const newFraction = new Fraction(a).add(new Fraction(b));

					this.numerator = newFraction.numerator;
					this.denominator = newFraction.denominator;

					this.normalize();

					return;
				}
				if (a && !b) {
					/* simple fraction e.g. 'A/B' */
					if (typeof a === 'string' && a.match('/')) {
						// it's not a whole number... it's actually a fraction without a whole part written
						const f = a.split('/');
						this.numerator = Number(f[0]);
						this.denominator = Number(f[1]);
						this.normalize();
						return;
						/* string floating point */
					}
					if (typeof a === 'string' && a.match('.')) {
						const newFraction = new Fraction(parseFloat(a.replace(',', '.')));

						this.numerator = newFraction.numerator;
						this.denominator = newFraction.denominator;

						this.normalize();

						return;
						/* whole number e.g. 'A' */
					}

					// just passed a whole number as a string
					this.numerator = parseInt(a);
					this.denominator = 1;
					this.normalize();

					return;
				}
				throw new Error(invalidInput); // could not parse
			}
			throw new Error(invalidInput); // could not parse
		}
		throw new Error(invalidInput); // could not parse
	}

	clone(): Fraction {
		return new Fraction(this.numerator, this.denominator);
	}

	/* pretty-printer, converts fractions into whole numbers and fractions */
	toString(): string {
		if (isNaN(this.denominator))
			//	if (this.denominator !== this.denominator) //They say it would be faster. (?)
			return 'NaN';
		let result = '';
		if (this.numerator < 0 !== this.denominator < 0) result = '-';
		let numerator = Math.abs(this.numerator);
		const denominator = Math.abs(this.denominator);

		const wholepart = Math.floor(numerator / denominator);
		numerator = numerator % denominator;
		if (wholepart !== 0) result += wholepart;
		if (numerator !== 0) {
			if (wholepart !== 0) result += ' ';
			result += numerator + '/' + denominator;
		}
		return result.length > 0 ? result : '0';
	}

	toDecimal(): number {
		return this.numerator / this.denominator;
	}

	/** @deprecated */
	toStringOld(): string {
		if (isNaN(this.denominator)) return 'NaN';
		let wholepart = this.numerator / this.denominator;
		wholepart = wholepart > 0 ? Math.floor(wholepart) : Math.ceil(wholepart);
		const numerator = this.numerator % this.denominator;
		const denominator = this.denominator;
		const result = [];
		if (wholepart !== 0) result.push(wholepart);
		if (numerator !== 0)
			result.push(
				(wholepart === 0 ? numerator : Math.abs(numerator)) + '/' + denominator
			);
		return result.length > 0 ? result.join(' ') : '0';
	}

	/* pretty-printer to support TeX notation (using with MathJax, KaTeX, etc) */
	toTeX(mixed?: boolean | number): string {
		if (isNaN(this.denominator)) return 'NaN';
		let result = '';
		if (this.numerator < 0 !== this.denominator < 0) result = '-';
		let numerator = Math.abs(this.numerator);
		const denominator = Math.abs(this.denominator);

		if (!mixed) {
			//We want a simple fraction, without wholepart extracted
			if (denominator === 1) return result + numerator;
			else return result + '\\frac{' + numerator + '}{' + denominator + '}';
		}
		const wholepart = Math.floor(numerator / denominator);
		numerator = numerator % denominator;
		if (wholepart !== 0) result += wholepart;
		if (numerator !== 0)
			result += '\\frac{' + numerator + '}{' + denominator + '}';
		return result.length > 0 ? result : '0';
	}

	/* destructively rescale the fraction by some integral factor */
	rescale(factor: number): Fraction {
		this.numerator *= factor;
		this.denominator *= factor;
		return this;
	}

	add(b: MathInput): Fraction {
		const a = this.clone();
		if (b instanceof Fraction) {
			b = b.clone();
		} else {
			b = new Fraction(b);
		}
		const td = a.denominator;
		a.rescale(b.denominator);
		a.numerator += b.numerator * td;

		return a.normalize();
	}

	/** @deprecated */
	addOld(b: MathInput): Fraction {
		const a = this.clone();
		if (b instanceof Fraction) {
			b = b.clone();
		} else {
			b = new Fraction(b);
		}
		const td = a.denominator;
		a.rescale(b.denominator);
		b.rescale(td);

		a.numerator += b.numerator;

		return a.normalize();
	}

	subtract(b: MathInput): Fraction {
		const a = this.clone();
		if (b instanceof Fraction) {
			b = b.clone(); // we scale our argument destructively, so clone
		} else {
			b = new Fraction(b);
		}
		const td = a.denominator;
		a.rescale(b.denominator);
		a.numerator -= b.numerator * td;

		return a.normalize();
	}

	multiply(b: MathInput): Fraction {
		const a = this.clone();
		if (b instanceof Fraction) {
			a.numerator *= b.numerator;
			a.denominator *= b.denominator;
		} else if (typeof b === 'number') {
			a.numerator *= b;
		} else {
			return a.multiply(new Fraction(b));
		}
		return a.normalize();
	}

	divide(b: MathInput): Fraction {
		const a = this.clone();
		if (b instanceof Fraction) {
			a.numerator *= b.denominator;
			a.denominator *= b.numerator;
		} else if (typeof b === 'number') {
			a.denominator *= b;
		} else {
			return a.divide(new Fraction(b));
		}
		return a.normalize();
	}

	equals(b: MathInput): boolean {
		if (!(b instanceof Fraction)) {
			b = new Fraction(b);
		}
		// fractions that are equal should have equal normalized forms
		const a = this.clone().normalize();
		const bClone = b.clone().normalize();
		return (
			a.numerator === bClone.numerator && a.denominator === bClone.denominator
		);
	}

	/* Utility functions */

	/* Destructively normalize the fraction to its smallest representation.
	 * e.g. 4/16 -> 1/4, 14/28 -> 1/2, etc.
	 * This is called after all math ops.
	 */
	normalize(): Fraction {
		const isFloat = function (n: number) {
			return (
				typeof n === 'number' &&
				((n > 0 && n % 1 > 0 && n % 1 < 1) ||
					(n < 0 && n % -1 < 0 && n % -1 > -1))
			);
		};

		const roundToPlaces = function (n: number, places: number) {
			if (!places) {
				return Math.round(n);
			} else {
				const scalar = Math.pow(10, places);
				return Math.round(n * scalar) / scalar;
			}
		};
		// added for the case where decimal is ending with .999999 ex 8.999999999
		const makeString = function (n: number) {
			const ans = n.toString();
			// no decimal point is present, then we add a decimal point
			if (ans.indexOf('.') === -1) {
				return ans + '.0';
			}
			// else return as it is
			return ans;
		};

		// XXX hackish.  Is there a better way to address this issue?
		//
		/* first check if we have decimals, and if we do eliminate them
		 * multiply by the 10 ^ number of decimal places in the number
		 * round the number to nine decimal places
		 * to avoid js floating point funnies
		 */
		if (isFloat(this.denominator)) {
			const rounded = roundToPlaces(this.denominator, 9);
			const scaleup = Math.pow(10, makeString(rounded).split('.')[1].length);
			this.denominator = Math.round(this.denominator * scaleup); // this !!! should be a whole number
			//this.numerator *= scaleup;
			this.numerator *= scaleup;
		}
		if (isFloat(this.numerator)) {
			const rounded = roundToPlaces(this.numerator, 9);
			const scaleup = Math.pow(10, makeString(rounded).split('.')[1].length);
			this.numerator = Math.round(this.numerator * scaleup); // this !!! should be a whole number
			//this.numerator *= scaleup;
			this.denominator *= scaleup;
		}
		const gcf = Fraction.gcf(this.numerator, this.denominator);
		this.numerator /= gcf;
		this.denominator /= gcf;
		if (this.denominator < 0) {
			this.numerator *= -1;
			this.denominator *= -1;
		}
		return this;
	}

	/* Takes two numbers and returns their greatest common factor. */
	//Adapted from Ratio.js
	static gcf(a: number, b: number): number {
		if (arguments.length < 2) {
			return a;
		}
		let c;
		a = Math.abs(a);
		b = Math.abs(b);
		/*  //It seems to be no need in these checks
		 // Same as isNaN() but faster
		 if (a !== a || b !== b) {
			  return NaN;
		 }
		 //Same as !isFinite() but faster
		 if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity) {
			  return Infinity;
		  }
		  // Checks if a or b are decimals
		  if ((a % 1 !== 0) || (b % 1 !== 0)) {
				throw new Error("Can only operate on integers");
		  }
	*/

		while (b) {
			c = a % b;
			a = b;
			b = c;
		}
		return a;
	}

	//Not needed now
	// Adapted from:
	// http://www.btinternet.com/~se16/js/factor.htm
	static primeFactors(n: number): number[] {
		let num = Math.abs(n);
		const factors = [];
		let _factor = 2; // first potential prime factor

		while (_factor * _factor <= num) {
			// should we keep looking for factors?
			if (num % _factor === 0) {
				// this is a factor
				factors.push(_factor); // so keep it
				num = num / _factor; // and divide our search point by it
			} else {
				_factor++; // and increment
			}
		}

		if (num !== 1) {
			// If there is anything left at the end...
			// ...this must be the last prime factor
			factors.push(num); //    so it too should be recorded
		}

		return factors; // Return the prime factors
	}

	snap(max: number, threshold: number): Fraction {
		if (!threshold) threshold = 0.0001;
		if (!max) max = 100;

		const negative = this.numerator < 0;
		const decimal = this.numerator / this.denominator;
		const fraction = Math.abs(decimal % 1);
		const remainder = negative ? Math.ceil(decimal) : Math.floor(decimal);

		for (let denominator = 1; denominator <= max; ++denominator) {
			for (let numerator = 0; numerator <= max; ++numerator) {
				const approximation = Math.abs(numerator / denominator);
				if (Math.abs(approximation - fraction) < threshold) {
					return new Fraction(
						remainder * denominator + numerator * (negative ? -1 : 1),
						denominator
					);
				}
			}
		}

		return new Fraction(this.numerator, this.denominator);
	}

	snapNearest(denominator: number) {
		const threshold = 1 / denominator;

		const negative = this.numerator < 0;
		const decimal = this.numerator / this.denominator;
		const fraction = Math.abs(decimal % 1);
		const remainder = negative ? Math.ceil(decimal) : Math.floor(decimal);

		for (let numerator = 0; numerator <= denominator; ++numerator) {
			const approximation = Math.abs(numerator / denominator);
			if (Math.abs(approximation - fraction) < threshold) {
				return new Fraction(
					remainder * denominator + numerator * (negative ? -1 : 1),
					denominator
				);
			}
		}

		return new Fraction(this.numerator, this.denominator);
	}
}
