export class MotionProfile {
	private readonly _maxAccel: number;
	private readonly _maxVelocity: number;
	private readonly _rampUpTime: number;
	private readonly _rampDownTime: number;
	private readonly _rampUpDistance: number;
	private readonly _rampDownDistance: number;
	private readonly _cruiseTime: number;
	private readonly _distance: number;
	private readonly _startingVelocity: number;

	constructor(maxAccel: number, maxVelocity: number, distance: number, startingVelocity = 0) {
		// let rampDistance = MotionProfile.calcRampDistance(maxAccel,maxVelocity);
		// if (distance < rampDistance * 2) {
		// 	maxVelocity = Math.sqrt((maxAccel * distance) / 2);
		// 	rampDistance = (maxVelocity * maxVelocity) / maxAccel;
		// }
		this._startingVelocity = startingVelocity;
		this._rampUpTime = MotionProfile.calcRampTime(maxAccel, maxVelocity - startingVelocity);
		this._rampDownTime = MotionProfile.calcRampTime(maxAccel, maxVelocity);
		this._rampUpDistance = MotionProfile.calcRampDistance(maxAccel, startingVelocity, maxVelocity);
		this._rampDownDistance = MotionProfile.calcRampDistance(maxAccel, maxVelocity, 0.0);
		this._maxAccel = maxAccel;
		this._maxVelocity = maxVelocity;
		this._cruiseTime = (distance - this._rampUpDistance - this._rampDownDistance) / maxVelocity;
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
				MotionProfile.trigRamp2ndIntegral(x, this._maxAccel, deltav) +
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
				MotionProfile.trigRamp1stIntegral(x, this._maxAccel, deltav) + (this._maxVelocity - deltav),
			0
		);
	}

	public profileAccel(time: number) {
		return this.rangeResult(
			time,
			0.0,
			(x, deltav) => MotionProfile.trigRamp(x, this._maxAccel, deltav),
			0
		);
	}
}
