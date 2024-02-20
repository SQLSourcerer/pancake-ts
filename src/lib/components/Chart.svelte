<script lang="ts" context="module">
	import { getContext } from 'svelte';
	import type { Writable, Readable } from 'svelte/store';
	import linearScale from '$lib/utils/linearScale';

	export type Pointer = { x: number; y: number; left: number; top: number };
	export type LinearScaleReturn = ReturnType<typeof linearScale>;
	export type ChartContext = {
		x1: Writable<number>;
		y1: Writable<number>;
		x2: Writable<number>;
		y2: Writable<number>;
		x_scale: Readable<LinearScaleReturn>;
		y_scale: Readable<LinearScaleReturn>;
		x_scale_inverse: Readable<LinearScaleReturn>;
		y_scale_inverse: Readable<LinearScaleReturn>;
		pointer: Writable<Pointer | null>;
		width: Writable<number>;
		height: Writable<number>;
	};

	const key = {};

	export function getChartContext() {
		return getContext<ChartContext>(key);
	}
</script>

<script lang="ts">
	import { setContext, onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';

	export let x1 = 0;
	export let y1 = 0;
	export let x2 = 1;
	export let y2 = 1;
	export let clip = false;

	let chart: HTMLDivElement;

	const _x1 = writable<number>();
	const _y1 = writable<number>();
	const _x2 = writable<number>();
	const _y2 = writable<number>();

	const width = writable<number>();
	const height = writable<number>();
	const pointer = writable<Pointer | null>(null);

	const handle_mousemove = (e: MouseEvent) => {
		const bcr = chart.getBoundingClientRect();
		const left = e.clientX - bcr.left;
		const top = e.clientY - bcr.top;

		const x = $x_scale_inverse((100 * left) / (bcr.right - bcr.left));
		const y = $y_scale_inverse((100 * top) / (bcr.bottom - bcr.top));

		pointer.set({ x, y, left, top });
	};

	const handle_mouseleave = () => {
		pointer.set(null);
	};

	$: _x1.set(x1);
	$: _y1.set(y1);
	$: _x2.set(x2);
	$: _y2.set(y2);

	const x_scale = derived([_x1, _x2], ([$x1, $x2]) => {
		return linearScale([$x1, $x2], [0, 100]);
	});

	const y_scale = derived([_y1, _y2], ([$y1, $y2]) => {
		return linearScale([$y1, $y2], [100, 0]);
	});

	const x_scale_inverse = derived(x_scale, ($x_scale) => $x_scale.inverse());
	const y_scale_inverse = derived(y_scale, ($y_scale) => $y_scale.inverse());

	setContext(key, {
		x1: _x1,
		y1: _y1,
		x2: _x2,
		y2: _y2,
		x_scale,
		y_scale,
		x_scale_inverse,
		y_scale_inverse,
		pointer,
		width,
		height
	} as ChartContext);
</script>

<div
	class="pancake-chart"
	bind:this={chart}
	bind:clientWidth={$width}
	bind:clientHeight={$height}
	on:mousemove={handle_mousemove}
	on:mouseleave={handle_mouseleave}
	role="figure"
	class:clip
>
	<slot />
</div>

<style>
	.pancake-chart {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
	}

	.clip {
		overflow: hidden;
	}
</style>
