<script lang="ts">
	import CarbonTracker from '../examples/data/0/Ex0.svelte';
	import Examples from '../examples/data/Examples.svelte';

	import Chart from '$lib/components/Chart.svelte';
	import { MotionProfile } from '$lib/model/motion-profile';
	import SvgLine from '$lib/components/SvgLine.svelte';
	import Svg from '$lib/components/Svg.svelte';

	let maxAccel = 0.01;
	let maxVelocity = 2;
	let distance = 4300;
	let startingVelocity = 800;

	$: profile = new MotionProfile(maxAccel,maxVelocity,distance,startingVelocity);
	$: time = profile.totalProfileTime;
	$: maxy = profile.profileVelocity(time/2.0);
	$: data = [...Array(Math.round(time * 10)).keys()].map(k=>k/10.0).map(t=>({time:t,velocity:profile.profileVelocity(t)}))
</script>

<svelte:head>
	<title>Pancake • Charts for Svelte apps</title>
</svelte:head>

<!-- <header>
	<h1>
		Pancake
		<small>Responsive charts. JavaScript optional.</small>
	</h1>

	<p>
		Pancake is a charting library for <a href="https://svelte.dev">Svelte</a> applications that allows
		you to visualize data with a combination of HTML, SVG and (soon) canvas/WebGL.
	</p>

	<p>
		Unlike most charting libraries, Pancake is designed with <em>server-side rendering</em> in mind,
		meaning you can create beautiful responsive charts that may not even need JavaScript to render.
		<a
			href="https://dev.to/richharris/a-new-technique-for-making-responsive-javascript-free-charts-gmp"
			>Here's how.</a
		>
	</p>
</header> -->

<!-- <section class="hero">
	<CarbonTracker />
</section> -->

<!-- <section>
	<h2>Usage</h2>
	<p>Documentation is TODO. In the meantime, here are some examples:</p>
</section> -->

<!-- <section class="examples">
	<h2>Examples</h2>
	<div class="chart-grid">
		<Examples />
	</div>
</section> -->
<label>
	Max Accel:
	<input type="text" bind:value={maxAccel} /></label>
<br />
	<label>
		Max velocity:
		<input type="text" bind:value={maxVelocity} /></label>
		<br />
		<label>
			Distance:
			<input type="text" bind:value={distance} /></label>

			<br />
			<label>
				Starting velocity:
				<input type="text" bind:value={startingVelocity} /></label>

<div class="chart"><Chart x1={0} x2={time} y1={0} y2={maxy}>
	<Svg><SvgLine {data}
	x={p=>p.time}
	y={p=>p.velocity}
	let:d
	>
<path class="velocity" {d} />
</SvgLine></Svg>

</Chart></div>


<style>
path.velocity {
		stroke: #ff3e00;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2px;
		fill: none;
	}

	.chart {
			height: 400px;
		}

	header {
		max-width: 56rem;
		margin: 0 auto;
	}

	.hero {
		margin: 0 auto 4em auto;
		max-width: 80em;
	}

	section {
		max-width: 56em;
		margin: 0 auto 4em auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: lowercase;
		font-weight: 400;
		margin: 0 0 0.5em 0;
	}

	small {
		color: #999;
		font-size: 0.5em;
		display: block;
	}

	.examples {
		max-width: 56rem;
		margin: 0 auto;
	}

	h2 {
		font-size: 2em;
	}

	/* .chart-grid {
		display: grid;
		grid-column-gap: 3em;
		grid-row-gap: 1em;
	} */

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}

	@media (min-width: 960px) {
		/* .chart-grid {
			grid-template-columns: repeat(2, 1fr);
		} */
	}
</style>
