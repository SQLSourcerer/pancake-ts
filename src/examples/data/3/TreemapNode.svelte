<script lang="ts" context="module">
	export type NodeType = { x0: number; x1: number; y0: number; y1: number; children?: NodeType[] };
</script>

<script lang="ts" generics="T extends NodeType">
	import * as Pancake from '$lib/index';
	import { getContext } from 'svelte';

	export let node: T;
</script>

<Pancake.Box x1={node.x0} x2={node.x1} y1={node.y1} y2={node.y0}>
	<slot {node} />
</Pancake.Box>

{#each node.children || [] as child}
	<svelte:self node={child} let:node>
		<slot {node} />
	</svelte:self>
{/each}
