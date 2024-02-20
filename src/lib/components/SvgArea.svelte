<script lang="ts" generics="T">
	import SvgPolygon from './SvgPolygon.svelte';
	import { type Accessor, default_x, default_y } from '../utils/accessors';

	export let data: T[];
	export let floor = 0;
	export let x: Accessor<T>;
	export let y: Accessor<T>;

	$: points = [
		{ x: x(data[0], 0), y: floor },
		...data.map((d, i) => ({ x: x(d, i), y: y(d, i) })),
		{ x: x(data[data.length - 1], data.length - 1), y: floor }
	];
</script>

<SvgPolygon data={points} x={default_x} y={default_y} let:d>
	<slot {d} />
</SvgPolygon>
