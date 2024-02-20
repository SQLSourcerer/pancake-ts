<script lang="ts" generics="T">
	import { createEventDispatcher } from 'svelte';
	import { getChartContext } from './Chart.svelte';
	import Quadtree from '../utils/Quadtree.js';
	import { type Accessor } from '../utils/accessors';

	export let data: T[];
	export let x: Accessor<T>;
	export let y: Accessor<T>;
	export let radius = Infinity;

	// exposing the prop lets consumers use let: or bind:
	export let closest: T | null | undefined = undefined;

	const { pointer, x_scale, y_scale, x_scale_inverse, y_scale_inverse, width, height } =
		getChartContext();
	const dispatch = createEventDispatcher();

	$: quadtree = new Quadtree(data);
	$: quadtree.update(x, y, $x_scale, $y_scale);

	// track reference changes, to trigger updates sparingly
	let prev_closest: T | null | undefined;
	let next_closest: T | null | undefined;

	$: next_closest =
		$pointer !== null ? quadtree.find($pointer.left, $pointer.top, $width, $height, radius) : null;

	$: if (next_closest !== prev_closest) {
		closest = prev_closest = next_closest;
	}
</script>

<slot {closest} />
