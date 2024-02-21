export class MotionProfile {
	private readonly maxAccel: number;
	private readonly maxVelocity: number;
	private readonly rampTime: number;
	private readonly rampDistance: number;
	private readonly cruiseTime: number;

	constructor(maxAccel: number, maxVelocity: number, distance: number, startingVelocity: number) {
		let rampDistance = (maxVelocity * maxVelocity) / maxAccel;
		if (distance < rampDistance * 2) {
			maxVelocity = Math.sqrt((maxAccel * distance) / 2);
			rampDistance = (maxVelocity * maxVelocity) / maxAccel;
		}
		this.rampDistance = rampDistance;
		this.rampTime = MotionProfile.calcRampTime(maxAccel, maxVelocity);
		this.maxAccel = maxAccel;
		this.maxVelocity = maxVelocity;
		this.cruiseTime = (distance - 2 * rampDistance) / maxVelocity;
	}

	private static calcRampTime(glimit: number, deltav: number) {
		return (2.0 * deltav) / glimit;
	}

	private static trigRamp2ndIntegral(x: number, g: number, s: number) {
		return (
			(g / 4.0) *
				(x * x + ((2.0 * s * s * Math.cos((Math.PI * g * x) / s)) / g) * g * Math.PI * Math.PI) -
			(s * s) / (2.0 * g * Math.PI * Math.PI)
		);
	}

	private static trigRamp1stIntegral(x: number, g: number, s: number) {
		const pigx = Math.PI * g * x;
		return (pigx - s * Math.sin(pigx / s)) / (2.0 * Math.PI);
	}

	private static trigRamp(x: number, g: number, t: number) {
		return (g - g * Math.cos((2.0 * Math.PI * x) / t)) / 2.0;
	}

	private rangeResult(time: number, middleValue: number, callback: (time: number) => number) {
		if (time < this.rampTime) {
			return callback(time);
		} else if (time > this.cruiseTime + this.rampTime) {
			return -callback(time - this.rampTime - this.cruiseTime - this.rampTime);
		} else {
			return middleValue;
		}
	}

	public get totalProfileTime() {
		return this.rampTime + this.cruiseTime + this.rampTime;
	}

	public profilePosition(time: number) {
		return this.rangeResult(time, this.maxVelocity * time - this.rampDistance, (x) =>
			MotionProfile.trigRamp2ndIntegral(x, this.maxAccel, this.maxVelocity)
		);
	}

	public profileVelocity(time: number) {
		return this.rangeResult(time, this.maxVelocity, (x) =>
			MotionProfile.trigRamp1stIntegral(x, this.maxAccel, this.maxVelocity)
		);
	}

	public profileAccel(time: number) {
		return this.rangeResult(time, 0.0, (x) =>
			MotionProfile.trigRamp(x, this.maxAccel, this.rampTime)
		);
	}
}
