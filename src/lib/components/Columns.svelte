<script lang="ts" generics="T">
	import Box from './Box.svelte';
	import type { Accessor } from '../utils/accessors';

	export let data: T[];
	export let width = 1;
	export let x: Accessor<T>;
	export let y: Accessor<T>;
</script>

{#each data as d, i}
	<Box x1={x(d, i) - width / 2} x2={x(d, i) + width / 2} y1={0} y2={y(d, i)}>
		<slot value={d} first={i === 0} last={i === data.length - 1} />
	</Box>
{/each}
