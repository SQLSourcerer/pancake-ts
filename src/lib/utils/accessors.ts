export interface PancakeCoords {
	x: number;
	y: number;
}
export type Accessor<T> = (d: T, i?: number) => number;
export const default_x: Accessor<PancakeCoords> = (d) => d.x;
export const default_y: Accessor<PancakeCoords> = (d) => d.y;
