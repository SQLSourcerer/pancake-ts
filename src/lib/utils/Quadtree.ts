import type { Accessor, PancakeCoords } from './accessors';
export type ScaleFunc = (d: number) => number;

type LeafType<T> = PancakeCoords & { d?: T };

class Node<T> {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	xm: number;
	ym: number;
	empty: boolean;
	leaf: LeafType<T> | null;
	children: { nw: Node<T>; ne: Node<T>; se: Node<T>; sw: Node<T> } | null;

	constructor(x0: number, y0: number, x1: number, y1: number) {
		this.x0 = x0;
		this.y0 = y0;
		this.x1 = x1;
		this.y1 = y1;
		this.xm = (x0 + x1) / 2;
		this.ym = (y0 + y1) / 2;

		this.empty = true;
		this.leaf = null;
		this.children = null;
	}

	add(p: LeafType<T>) {
		const { x0, y0, x1, y1, xm, ym, leaf } = this;

		if (this.empty) {
			this.leaf = p;
			this.empty = false;
			return;
		}

		if (leaf) {
			// discard coincident points
			if (leaf.x === p.x && leaf.y === p.y) return;

			// need to subdivide
			this.children = {
				nw: new Node(x0, y0, xm, ym),
				ne: new Node(xm, y0, x1, ym),
				sw: new Node(x0, ym, xm, y1),
				se: new Node(xm, ym, x1, y1)
			};

			this.leaf = null;
			this.add(leaf);
		}

		const child =
			p.x < xm
				? p.y < ym
					? this.children?.nw
					: this.children?.sw
				: p.y < ym
					? this.children?.ne
					: this.children?.se;

		child?.add(p);
	}
}

function build_tree<T>(
	data: T[],
	x: Accessor<T>,
	y: Accessor<T>,
	x_scale: ScaleFunc,
	y_scale: ScaleFunc
) {
	const points = data.map((d, i) => ({
		d,
		x: x_scale(x(d, i)),
		y: y_scale(y(d, i))
	}));

	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;

	for (let i = 0; i < points.length; i += 1) {
		const p = points[i];

		if (p.x < x0) x0 = p.x;
		if (p.y < y0) y0 = p.y;
		if (p.x > x1) x1 = p.x;
		if (p.y > y1) y1 = p.y;
	}

	const root = new Node<T>(x0, y0, x1, y1);

	for (let i = 0; i < points.length; i += 1) {
		const p = points[i];
		if (isNaN(p.x) || isNaN(p.y)) continue;

		root.add(p);
	}

	return root;
}

export default class Quadtree<T> {
	data: T[];
	x: Accessor<T> | null;
	y: Accessor<T> | null;
	x_scale: ScaleFunc | null;
	y_scale: ScaleFunc | null;
	root: Node<T> | null;

	constructor(data: T[]) {
		this.data = data;
		this.x = null;
		this.y = null;
		this.x_scale = null;
		this.y_scale = null;
		this.root = null;
	}

	update(x: Accessor<T>, y: Accessor<T>, x_scale: ScaleFunc, y_scale: ScaleFunc) {
		this.root = null;
		this.x = x;
		this.y = y;
		this.x_scale = x_scale;
		this.y_scale = y_scale;
	}

	find(left: number, top: number, width: number, height: number, radius: number) {
		if (!this.root)
			this.root = build_tree(this.data, this.x!, this.y!, this.x_scale!, this.y_scale!);

		const queue = [this.root];

		let node: Node<T> | undefined;
		let closest: T | undefined;
		let min_d_squared = Infinity;

		const x_to_px = (x: number) => (x * width) / 100;
		const y_to_px = (y: number) => (y * height) / 100;

		while ((node = queue.pop())) {
			if (node.empty) continue;

			const left0 = x_to_px(node.x0);
			const left1 = x_to_px(node.x1);
			const top0 = y_to_px(node.y0);
			const top1 = y_to_px(node.y1);

			const out_of_bounds =
				left < Math.min(left0, left1) - radius ||
				left > Math.max(left0, left1) + radius ||
				top < Math.min(top0, top1) - radius ||
				top > Math.max(top0, top1) + radius;

			if (out_of_bounds) continue;

			if (node.leaf) {
				const dl = x_to_px(node.leaf.x) - left;
				const dt = y_to_px(node.leaf.y) - top;

				const d_squared = dl * dl + dt * dt;

				if (d_squared < min_d_squared) {
					closest = node.leaf.d;
					min_d_squared = d_squared;
				}
			} else {
				queue.push(node.children!.nw, node.children!.ne, node.children!.sw, node.children!.se);
			}
		}

		return min_d_squared < radius * radius ? closest : null;
	}
}
