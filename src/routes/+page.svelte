<script lang="ts">
	import Chart, { getChartContext } from '$lib/components/Chart.svelte';
	import {
		TrigMotionProfile,
		type MotionProfile,
		ReversibleMotionProfile
	} from '$lib/model/motion-profile';
	import SvgLine from '$lib/components/SvgLine.svelte';
	import Svg from '$lib/components/Svg.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import Quadtree from '$lib/components/Quadtree.svelte';
	import Point from '$lib/components/Point.svelte';

	let maxStartAccel = 300;
	let maxEndAccel = 300;
	let maxVelocity = 400;
	let distance = 6000;
	let startingVelocity = -400;
	let startingAccel = 0;

	const minx = 0;

	$: profile = ReversibleMotionProfile.Create(
		maxStartAccel,
		maxEndAccel,
		maxVelocity,
		distance,
		startingVelocity,
		startingAccel
	);
	$: time = Math.ceil(profile.totalProfileTime);
	$: samples = Math.ceil(Math.ceil(600 / time) / 5) * 5 * time;
	$: maxx = time;
	$: miny = profile.minY;
	$: maxy = profile.maxY;
	$: posfactor =
		(3 * profile.profileVelocity(time / 2.0)) / profile.profilePosition(profile.totalProfileTime);
	//$: maxy = profile.profilePosition(profile.totalProfileTime);
	//$: data = [...Array(Math.round(time * 10)).keys()].map(k=>k/10.0).map(t=>({time:t,velocity:profile.profileVelocity(t)}))

	$: data = [...Array(Number.isNaN(samples) ? 0 : samples).keys()]
		.map((k) => (Math.ceil(time) * k) / samples)
		.map((t) => ({
			time: t,
			velocity: profile.profileVelocity(t),
			position: profile.profilePosition(t),
			acceleration: profile.profileAccel(t)
		}));

	const pc = (x: number) => {
		return (100 * (x - minx)) / (maxx - minx);
	};

	$: points = [
		...data.map((a) => ({
			time: a.time,
			y: a.acceleration,
			value: +a.acceleration.toFixed(1),
			units: 'ticks/s²',
			color: '#000088'
		})),
		...data.map((v) => ({
			time: v.time,
			y: v.velocity,
			value: +v.velocity.toFixed(1),
			units: 'ticks/s',
			color: '#880000'
		})),
		...data.map((p) => ({
			time: p.time,
			y: p.position * posfactor,
			value: +p.position.toFixed(0),
			units: 'ticks',
			color: '#008800'
		}))
	];
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
	Max Start Accel:
	<input type="text" bind:value={maxStartAccel} /></label
>
<br />
<label>
	Max End Accel:
	<input type="text" bind:value={maxEndAccel} /></label
>
<br />
<label>
	Max velocity:
	<input type="text" bind:value={maxVelocity} /></label
>
<br />
<label>
	Distance:
	<input type="text" bind:value={distance} /></label
>

<br />
<label>
	Starting velocity:
	<input type="text" bind:value={startingVelocity} /></label
>
<br />
<label>
	Starting acceleration:
	<input type="text" bind:value={startingAccel} /></label
>
<br />
<br />

Total time: {+profile.totalProfileTime.toFixed(4)}<br />
Samples: {samples} <br />
Samples/sec: {samples / time} <br />
Ramp up time: {+profile.rampUpTime.toFixed(3)} <br />
Ramp up distance: {+profile.rampUpDistance.toFixed(3)} <br />
Ramp down time: {+profile.rampDownTime.toFixed(3)} <br />
Ramp down distance: {+profile.rampDownDistance.toFixed(3)} <br />
Min Y: {miny} <br />
Max Y: {maxy} <br />
Cruise time: {+profile.cruiseTime.toFixed(2)}<br />
Cruise distance: {+profile.cruiseDistance.toFixed(1)}<br />
Profile max vel: {profile.maxVelocity}<br />
<br />

<div class="chart">
	<Chart x1={minx} x2={time} y1={miny} y2={maxy}>
		<Grid horizontal count={6} let:value let:last>
			<div class="grid-line horizontal" style="display:flex;justify-content:space-between">
				<span>{value}{last ? ' ticks/sec' : ''}</span>
				<span style="left:92%">
					{+(value / posfactor).toFixed(0)}{last ? ' ticks' : ''}
				</span>
			</div>
		</Grid>

		<Grid vertical count={5} let:value let:last>
			<div class="grid-line vertical"></div>
			<span class="time-label">{value}</span>
		</Grid>

		<Svg>
			<SvgLine {data} x={(p) => p.time} y={(p) => p.velocity} let:d>
				<path class="velocity" {d} />
			</SvgLine>

			<SvgLine {data} x={(p) => p.time} y={(p) => p.position * posfactor} let:d>
				<path class="position" {d} />
			</SvgLine>

			<SvgLine {data} x={(p) => p.time} y={(p) => p.acceleration} let:d>
				<path class="acceleration" {d} />
			</SvgLine>
		</Svg>

		<Quadtree data={points} x={(d) => d.time} y={(d) => d.y} let:closest>
			{#if closest}
				<Point x={closest.time} y={closest.y}>
					<div class="focus"></div>
					<div
						class="tooltip"
						style="transform: translate(-{pc(closest.time)}%,0);color:{closest.color}"
					>
						<strong style="text-wrap: nowrap">{+closest.time.toFixed(3)} s</strong>
						<span style="text-wrap: nowrap">{closest.value} {closest.units}</span>
					</div>
				</Point>
			{/if}
		</Quadtree>
	</Chart>
</div>

<style>
	path.velocity {
		stroke: #009900;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2px;
		fill: none;
	}

	path.position {
		stroke: #0000b6;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2px;
		fill: none;
	}

	path.acceleration {
		stroke: #bc0000;
		stroke-linejoin: round;
		stroke-linecap: round;
		stroke-width: 2px;
		fill: none;
	}

	.chart {
		height: 400px;
	}

	.grid-line {
		position: relative;
		display: block;
	}

	.grid-line.horizontal {
		width: calc(100% + 2em);
		left: -2em;
		border-bottom: 1px dashed #ccc;
	}

	.grid-line.vertical {
		height: 100%;
		border-left: 1px dashed #ccc;
	}

	.grid-line span {
		position: absolute;
		left: 0;
		bottom: 2px;
		line-height: 1;
		font-family: sans-serif;
		font-size: 14px;
		color: #999;
	}

	.time-label {
		position: absolute;
		width: 4em;
		left: -2em;
		bottom: -30px;
		font-family: sans-serif;
		font-size: 14px;
		color: #999;
		text-align: center;
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
