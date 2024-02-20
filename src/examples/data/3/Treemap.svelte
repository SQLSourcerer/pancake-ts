<script lang="ts" generics="T extends NodeType">
	import TreemapNode, { type NodeType } from './TreemapNode.svelte';

	export let root: T;
</script>

<pancake-treemap>
	<TreemapNode node={root} let:node>
		<slot {node} />
	</TreemapNode>
</pancake-treemap>

<style>
	pancake-treemap {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
