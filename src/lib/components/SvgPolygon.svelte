<script lang="ts" generics="T">
	import { getChartContext } from './Chart.svelte';
	import { type Accessor } from '../utils/accessors';

	const { x_scale, y_scale } = getChartContext();

	export let data: T[];
	export let x: Accessor<T>;
	export let y: Accessor<T>;

	$: d = `M${data.map((d, i) => `${$x_scale(x(d, i))},${$y_scale(y(d, i))}`).join('L')}`;
</script>

<slot {d} />
