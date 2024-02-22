export interface MotionProfile {
	readonly rampUpTime: number;
	readonly rampUpDistance: number;
	readonly rampDownTime: number;
	readonly rampDownDistance: number;
	readonly totalProfileTime: number;
	profilePosition(time: number): number;
	profileVelocity(time: number): number;
	profileAccel(time: number): number;
	readonly minY: number;
	readonly maxY: number;
	readonly cruiseTime: number;
	readonly cruiseDistance: number;
}

export class ReversibleMotionProfile implements MotionProfile {
	public static Create(
		maxAccel: number,
		maxVelocity: number,
		distance: number,
		startingVelocity = 0
	) {
		return new ReversibleMotionProfile(
			maxAccel,
			maxVelocity,
			distance,
			startingVelocity
		) as MotionProfile;
	}

	private readonly _profile: MotionProfile;
	private readonly _signum: number;

	private constructor(
		maxAccel: number,
		maxVelocity: number,
		distance: number,
		startingVelocity = 0
	) {
		this._signum = Math.sign(distance);
		this._profile = new TrigMotionProfile(
			Math.abs(maxAccel),
			Math.abs(maxVelocity),
			Math.abs(distance),
			startingVelocity * this._signum
		);
	}

	public get rampUpTime() {
		return this._profile.rampUpTime;
	}
	public get rampUpDistance() {
		return this._signum * this._profile.rampUpDistance;
	}

	public get rampDownTime() {
		return this._profile.rampDownTime;
	}
	public get rampDownDistance() {
		return this._signum * this._profile.rampDownDistance;
	}

	public get totalProfileTime() {
		return this._profile.totalProfileTime;
	}

	public profilePosition(time: number) {
		return this._signum * this._profile.profilePosition(time);
	}

	public profileVelocity(time: number) {
		return this._signum * this._profile.profileVelocity(time);
	}

	public profileAccel(time: number) {
		return this._signum * this._profile.profileAccel(time);
	}

	public get minY() {
		return Math.min(this._signum * this._profile.maxY, this._signum * this._profile.minY);
	}

	public get maxY() {
		return Math.max(this._signum * this._profile.maxY, this._signum * this._profile.minY);
	}

	public get cruiseTime() {
		return this._profile.cruiseTime;
	}

	public get cruiseDistance() {
		return this._profile.cruiseDistance;
	}
}

export class TrigMotionProfile implements MotionProfile {
	private readonly _maxAccel: number;
	private readonly _maxVelocity: number;
	private readonly _rampUpTime: number;
	private readonly _rampDownTime: number;
	private readonly _rampUpDistance: number;
	private readonly _rampDownDistance: number;
	private readonly _cruiseTime: number;
	private readonly _cruiseDistance: number;
	private readonly _distance: number;
	private readonly _startingVelocity: number;

	constructor(maxAccel: number, maxVelocity: number, distance: number, startingVelocity = 0) {
		this._startingVelocity = startingVelocity;
		let rampUpDistance = TrigMotionProfile.calcRampDistance(
			maxAccel,
			startingVelocity,
			maxVelocity
		);
		let rampDownDistance = TrigMotionProfile.calcRampDistance(maxAccel, maxVelocity, 0.0);
		// let rampDistance = MotionProfile.calcRampDistance(maxAccel,maxVelocity);
		// if (distance < rampDistance * 2) {
		// 	maxVelocity = Math.sqrt((maxAccel * distance) / 2);
		// 	rampDistance = (maxVelocity * maxVelocity) / maxAccel;
		// }
		if (distance < rampUpDistance + rampDownDistance) {
			maxVelocity =
				Math.sqrt(maxAccel * distance + startingVelocity * startingVelocity) / Math.sqrt(2);
		}
		rampUpDistance = TrigMotionProfile.calcRampDistance(maxAccel, startingVelocity, maxVelocity);
		rampDownDistance = TrigMotionProfile.calcRampDistance(maxAccel, maxVelocity, 0.0);
		this._rampUpDistance = rampUpDistance;
		this._rampDownDistance = rampDownDistance;
		this._rampUpTime = TrigMotionProfile.calcRampTime(maxAccel, maxVelocity - startingVelocity);
		this._rampDownTime = TrigMotionProfile.calcRampTime(maxAccel, maxVelocity);
		this._maxAccel = maxAccel;
		this._maxVelocity = maxVelocity;
		this._cruiseDistance = distance - this._rampUpDistance - this._rampDownDistance;
		this._cruiseTime = this._cruiseDistance / maxVelocity;
		this._distance = distance;
	}

	public get rampUpTime() {
		return this._rampUpTime;
	}
	public get rampUpDistance() {
		return this._rampUpDistance;
	}

	public get rampDownTime() {
		return this._rampDownTime;
	}
	public get rampDownDistance() {
		return this._rampDownDistance;
	}

	public get cruiseTime() {
		return this._cruiseTime;
	}

	public get cruiseDistance() {
		return this._cruiseDistance;
	}

	private static calcRampDistance(
		glimit: number,
		startingVelocity: number,
		endingVelocity: number
	) {
		const deltav = endingVelocity - startingVelocity;
		return (
			(deltav * deltav) / glimit +
			Math.min(startingVelocity, endingVelocity) * this.calcRampTime(glimit, deltav)
		);
	}

	private static calcRampTime(glimit: number, deltav: number) {
		return (2.0 * Math.abs(deltav)) / glimit;
	}

	private static trigRamp2ndIntegral(x: number, g: number, s: number) {
		const r =
			(g / 4.0) *
				(x * x + (2.0 * s * s * Math.cos((Math.PI * g * x) / s)) / (g * g * Math.PI * Math.PI)) -
			(s * s) / (2.0 * g * Math.PI * Math.PI);

		return r;
	}

	private static trigRamp1stIntegral(x: number, g: number, s: number) {
		const pigx = Math.PI * g * x;
		return (pigx - s * Math.sin(pigx / s)) / (2.0 * Math.PI);
	}

	private static trigRamp(x: number, g: number, s: number) {
		return (g - g * Math.cos((Math.PI * g * x) / s)) / 2.0;
	}

	private rangeResult(
		time: number,
		middleValue: number,
		callback: (time: number, deltav: number) => number,
		endState: number
	) {
		if (time < this._rampUpTime) {
			return callback(time, this._maxVelocity - this._startingVelocity);
		} else if (time >= this._rampUpTime && time <= this._cruiseTime + this._rampUpTime) {
			return middleValue;
		} else if (
			time > this._cruiseTime + this._rampUpTime &&
			time < this._cruiseTime + this._rampUpTime + this._rampDownTime
		) {
			return (
				-callback(
					time - this._rampUpTime - this._cruiseTime - this._rampDownTime,
					this._maxVelocity
				) + endState
			);
		} else {
			return endState;
		}
	}

	public get totalProfileTime() {
		return this._rampUpTime + this._cruiseTime + this._rampDownTime;
	}

	public profilePosition(time: number) {
		const r = this.rangeResult(
			time,
			this._maxVelocity * (time - this._rampUpTime) + this._rampUpDistance,
			(x, deltav) =>
				TrigMotionProfile.trigRamp2ndIntegral(x, this._maxAccel, deltav) +
				(this._maxVelocity - deltav) * x,
			this._distance
		);
		return r;
	}

	public profileVelocity(time: number) {
		return this.rangeResult(
			time,
			this._maxVelocity,
			(x, deltav) =>
				TrigMotionProfile.trigRamp1stIntegral(x, this._maxAccel, deltav) +
				(this._maxVelocity - deltav),
			0
		);
	}

	public profileAccel(time: number) {
		return this.rangeResult(
			time,
			0.0,
			(x, deltav) => TrigMotionProfile.trigRamp(x, this._maxAccel, deltav),
			0
		);
	}

	private keyPoints() {
		return [
			this.profileVelocity(this.totalProfileTime / 2.0) * 3,
			this.profileVelocity(0),
			this.profileVelocity(this.totalProfileTime),
			this.profileAccel(this.rampUpTime / 2.0),
			this.profileAccel(this.totalProfileTime - this.rampDownTime / 2.0)
		];
	}

	public get minY() {
		return Math.min(...this.keyPoints());
	}

	public get maxY() {
		return Math.max(...this.keyPoints());
	}
}
