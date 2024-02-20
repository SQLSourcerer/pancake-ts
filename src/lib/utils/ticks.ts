// adapted from https://github.com/d3/d3-array/blob/master/src/ticks.js
// MIT License https://github.com/d3/d3-array/blob/master/LICENSE
const e10 = Math.sqrt(50);
const e5 = Math.sqrt(10);
const e2 = Math.sqrt(2);

export function get_ticks(start: number, stop: number, count = 5) {
	let i = -1;
	let n;
	let ticks: number[];
	let step: number;

	if (start === stop && count > 0) return [start];

	const reverse = stop < start;
	if (reverse) {
		[start, stop] = [stop, start];
	}

	if ((step = increment(start, stop, count)) === 0 || !isFinite(step)) {
		return [];
	}

	if (step > 0) {
		start = Math.ceil(start / step);
		stop = Math.floor(stop / step);
		ticks = new Array((n = Math.ceil(stop - start + 1)));
		while (++i < n) ticks[i] = (start + i) * step;
	} else {
		start = Math.floor(start * step);
		stop = Math.ceil(stop * step);
		ticks = new Array((n = Math.ceil(start - stop + 1)));
		while (++i < n) ticks[i] = (start - i) / step;
	}

	if (reverse) ticks.reverse();

	return ticks;
}

function increment(start: number, stop: number, count: number) {
	const step = (stop - start) / Math.max(0, count);
	const power = Math.floor(Math.log(step) / Math.LN10);
	const error = step / Math.pow(10, power);

	return power >= 0
		? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
		: -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
