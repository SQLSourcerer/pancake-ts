<script lang="ts">
	import { getChartContext } from './Chart.svelte';

	const { x_scale, y_scale } = getChartContext();

	export let x: number;
	export let y: number;
</script>

<div class="pancake-point" style="left: {$x_scale(x)}%; top: {$y_scale(y)}%">
	<slot />
</div>

<style>
	.pancake-point {
		position: absolute;
		width: 0;
		height: 0;
	}
</style>
