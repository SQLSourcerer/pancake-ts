<script lang="ts" generics="T ">
	import Box from './Box.svelte';
	import { type Accessor } from '../utils/accessors.js';

	export let data: T[];
	export let height = 1;
	export let x: Accessor<T>;
	export let y: Accessor<T>;
</script>

{#each data as d, i}
	<Box y1={y(d, i) - height / 2} y2={y(d, i) + height / 2} x1={0} x2={x(d, i)}>
		<slot value={d} first={i === 0} last={i === data.length - 1} />
	</Box>
{/each}
