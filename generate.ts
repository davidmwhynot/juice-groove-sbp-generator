import { mkdirSync, rmSync, writeFileSync } from 'fs';

import { Fraction } from './utils/fraction';

const ZERO = new Fraction(0);
const THREE_QUARTERS = new Fraction('3/4');

const fOut = (fraction: Fraction) => fraction.toDecimal().toFixed(6);

const M3 = (x: Fraction, y: Fraction, z: Fraction) => {
	const xOut = fOut(x);
	const yOut = fOut(y);
	const zOut = fOut(z);

	return `M3,${xOut},${yOut},${zOut}`;
};

const pass = (
	boardX: Fraction,
	boardY: Fraction,
	offset: Fraction,
	depth: Fraction,
	startDepth: Fraction
) => {
	const x = boardX.subtract(offset);
	const y = boardY.subtract(offset);
	const yHalf = y.divide(2);
	const y75 = y.multiply(THREE_QUARTERS);

	const offsetOut = fOut(offset);

	return `'
JZ,0.800000
J2,${offsetOut},${offsetOut}
${M3(offset, offset, startDepth)}
${M3(offset, yHalf, depth)}
${M3(offset, y, depth)}
${M3(x, y, depth)}
${M3(x, offset, depth)}
${M3(offset, offset, depth)}
${M3(offset, y75, depth)}
${M3(offset, y, ZERO)}
'`;
};

const wrapper = (body: string) =>
	`
'Home Position Information = Bottom Left Corner, Material Surface 
'Home X = 0.000000 Home Y = 0.000000 Home Z = 0.800000
'Rapid clearance gap or Safe Z = 0.200
'UNITS:Inches
'
IF %(25)=1 THEN GOTO UNIT_ERROR	'check to see software is set to standard
SA                             	'Set program to absolute coordinate mode
CN, 90
'New Path
'Toolpath Name = Profile 1 [1]
'Tool Name   = Ball Nose (1/2")

&PWSafeZ = 0.200
&PWZorigin = Material Surface
&PWMaterial = 1.000
'&ToolName = "Ball Nose (1/2")"
&Tool =8           'Tool number to change to
C9                   'Change tool
TR,11000               'Set spindle RPM
'
MS,0.7,0.125
JZ,0.800000
C6                   'Spindle on
PAUSE 2
'
${body}
JZ,0.800000
'Turning router OFF
C7
J2,0.000000,0.000000
J3,42.000000,0.000000,0.800000
'
END
'
'
UNIT_ERROR:
CN, 91                            'Run file explaining unit error
END


`;

const board = (x: Fraction, y: Fraction, offset: Fraction) => {
	const depth1 = new Fraction('1/16').multiply(-1);
	const depth2 = new Fraction('2/16').multiply(-1);
	const depth3 = new Fraction('3/16').multiply(-1);

	const body = `'
${pass(x, y, offset, depth1, ZERO)}
${pass(x, y, offset, depth2, depth1)}
${pass(x, y, offset, depth3, depth2)}
'`;

	return wrapper(body);
};

type Val = [name: string, coords: [x: string, y: string], offset?: string];

const vals: Val[] = [
	// ['a', ['20 1/16', '12'], '3/4'],
	['a', ['15 15/16', '12']],
	['b', ['15 15/16', '12']],
	['c', ['15 15/16', '11 15/16']],
	['test', ['16', '12']],
];
const group = 'j';

rmSync(`./group-${group}`, { recursive: true, force: true });
mkdirSync(`./group-${group}`);

for (const [label, [x, y], offset = '1'] of vals) {
	const output = board(
		new Fraction(x),
		new Fraction(y),
		new Fraction(offset)
	);

	writeFileSync(`./group-${group}/${label}.sbp`, output, {
		encoding: 'utf8',
	});
}
