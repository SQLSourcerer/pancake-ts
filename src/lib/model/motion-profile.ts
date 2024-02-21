export class MotionProfile {
    private readonly maxAccel:number;
    private readonly maxVelocity:number;
    private readonly rampTime:number;
    private readonly rampDistance:number;
    private readonly cruiseTime:number;

    constructor(maxAccel:number,maxVelocity:number, distance:number,startingVelocity:number) {
        var rampDistance = maxVelocity * maxVelocity / maxAccel;
        if (distance<rampDistance*2){
            maxVelocity = Math.sqrt(maxAccel * distance / 2);
            rampDistance = maxVelocity * maxVelocity / maxAccel;
        }
        this.rampDistance = rampDistance;
        this.rampTime = 2.0*maxVelocity/maxAccel;
        this.maxAccel = maxAccel;
        this.maxVelocity = maxVelocity;
        this.cruiseTime = (distance - 2 * rampDistance) / maxVelocity;
    }

    private static  trigRamp2ndIntegral( x:number,  g:number,  s:number) {
        return (g / 4.0) * (x * x + (2.0 * s * s * Math.cos(Math.PI * g * x / s) / g * g * Math.PI * Math.PI)) - (s * s / (2.0 * g * Math.PI * Math.PI));
    }

    private  trigRamp2ndIntegral( x:number) {
        return MotionProfile.trigRamp2ndIntegral(x, this.maxAccel, this.maxVelocity);
    }

    private  trigRamp1stIntegral( x:number) {
        const pigx = Math.PI * this.maxAccel * x;
        return (pigx - this.maxVelocity * Math.sin(pigx / this.maxVelocity)) / (2.0 * Math.PI);
    }

    private  trigRamp( x:number) {
        return (this.maxAccel - this.maxAccel * Math.cos(2.0 * Math.PI * x / this.rampTime)) / 2.0;
    }

    private  rangeResult( time:number,  middleValue:number,  callback: ((time:number) => number)) {
        if (time < this.rampTime) {
            return callback(time);
        } else if (time > (this.cruiseTime + this.rampTime)) {
            return -callback(time - this.rampTime - this.cruiseTime - this.rampTime);
        } else {
            return middleValue;
        }
    }


    public get totalProfileTime() {
        return this.rampTime + this.cruiseTime + this.rampTime;
    }


    public  profilePosition(time:number) {
        return this.rangeResult(time, this.maxVelocity * time - this.rampDistance, x => this.trigRamp2ndIntegral(x));
    }


    public  profileVelocity( time:number) {
        return this.rangeResult(time, this.maxVelocity, x => this.trigRamp1stIntegral(x));
    }

    public  profileAccel( time:number) {
        return this.rangeResult(time, 0.0, x => this.trigRamp(x));
    }
}
