type lookup = { [key: string]: number };

export function stacks(
	data: lookup[],
	keys: string[],
	i: ((d: lookup, i?: number) => number | undefined) | string = (d, i) => i
) {
	if (typeof i === 'string') {
		const key = i;
		i = (d) => d[key];
	}

	const stacks = data.map((d) => {
		const stack = keys.map((key) => ({
			key,
			value: d[key],
			// @ts-expect-error uncallable
			i: i(d),
			start: null as number | null,
			end: null as number | null
		}));

		let acc = 0;

		stack.forEach((d) => {
			d.start = acc;
			d.end = acc += d.value;
		});

		return stack;
	});

	return keys.map((key) => ({
		key,
		values: stacks.map((s) => {
			return s.find((d) => d.key === key);
		})
	}));
}
