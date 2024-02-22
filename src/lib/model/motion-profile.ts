export class MotionProfile {
	private readonly maxAccel: number;
	private readonly maxVelocity: number;
	private readonly rampUpTime: number;
	private readonly rampDownTime: number;
	private readonly rampUpDistance: number;
	private readonly rampDownDistance: number;
	private readonly cruiseTime: number;
	private readonly distance: number;
	private readonly startingVelocity: number;

	constructor(maxAccel: number, maxVelocity: number, distance: number, startingVelocity = 0) {
		// let rampDistance = MotionProfile.calcRampDistance(maxAccel,maxVelocity);
		// if (distance < rampDistance * 2) {
		// 	maxVelocity = Math.sqrt((maxAccel * distance) / 2);
		// 	rampDistance = (maxVelocity * maxVelocity) / maxAccel;
		// }
		this.startingVelocity = startingVelocity;
		this.rampUpTime = MotionProfile.calcRampTime(maxAccel, maxVelocity - startingVelocity);
		this.rampDownTime = MotionProfile.calcRampTime(maxAccel, maxVelocity);
		this.rampUpDistance = MotionProfile.calcRampDistance(maxAccel, maxVelocity - startingVelocity);
		this.rampDownDistance = MotionProfile.calcRampDistance(maxAccel, maxVelocity);
		this.maxAccel = maxAccel;
		this.maxVelocity = maxVelocity;
		this.cruiseTime = (distance - this.rampUpDistance - this.rampDownDistance) / maxVelocity;
		this.distance = distance;
	}

	private static calcRampDistance(glimit: number, deltav: number) {
		return (deltav * deltav) / glimit;
	}

	private static calcRampTime(glimit: number, deltav: number) {
		return (2.0 * deltav) / glimit;
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
		if (time < this.rampUpTime) {
			return callback(time, this.maxVelocity - this.startingVelocity);
		} else if (time >= this.rampUpTime && time <= this.cruiseTime + this.rampUpTime) {
			return middleValue;
		} else if (
			time > this.cruiseTime + this.rampUpTime &&
			time < this.cruiseTime + this.rampUpTime + this.rampDownTime
		) {
			return (
				-callback(time - this.rampUpTime - this.cruiseTime - this.rampDownTime, this.maxVelocity) +
				endState
			);
		} else {
			return endState;
		}
	}

	public get totalProfileTime() {
		return this.rampUpTime + this.cruiseTime + this.rampDownTime;
	}

	public profilePosition(time: number) {
		const r = this.rangeResult(
			time,
			this.maxVelocity * (time - this.rampUpTime) + this.rampUpDistance,
			(x, deltav) => MotionProfile.trigRamp2ndIntegral(x, this.maxAccel, deltav),
			this.distance
		);
		return r;
	}

	public profileVelocity(time: number) {
		return this.rangeResult(
			time,
			this.maxVelocity,
			(x, deltav) =>
				MotionProfile.trigRamp1stIntegral(x, this.maxAccel, deltav) + (this.maxVelocity - deltav),
			0
		);
	}

	public profileAccel(time: number) {
		return this.rangeResult(
			time,
			0.0,
			(x, deltav) => MotionProfile.trigRamp(x, this.maxAccel, deltav),
			0
		);
	}
}
