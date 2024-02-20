<script lang="ts" generics="T">
	import { getChartContext } from './Chart.svelte';
	import { type Accessor } from '../utils/accessors';

	const { x_scale, y_scale } = getChartContext();

	export let data: T[];
	export let x: Accessor<T>;
	export let y: Accessor<T>;

	$: d = data
		.map((d, i) => {
			const _x = $x_scale(x(d, i));
			const _y = $y_scale(y(d, i));

			return `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`;
		})
		.join(' ');
</script>

<slot {d} />
