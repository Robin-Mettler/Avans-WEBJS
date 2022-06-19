class ConveyerBelt {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		
		this.width = 60;
		this.height = 60;
		this.package = null;
		this.packageTarget = null;
		this.packageSpeed = 2;
		this.color = "lightgrey";
		this.splitOffLineColor = "grey";
		
		this.offShootPackageTarget = null;
		this.splitterColor = "grey";
		this.splitRate = 1;
		this.splitDelay = 0;
	}
	
	update() {
		if (this.hasPackage()) {
			if (this.package.isBeingDragged) {
				this.package = null;
				
				return;
			}
			
			// move package towards next target
			this.package.x = clamp(this.x, this.package.x - this.packageSpeed, this.package.x + this.packageSpeed);
			this.package.y = clamp(this.y, this.package.y - this.packageSpeed, this.package.y + this.packageSpeed);
			
			if (this.package.x == this.x && this.package.y == this.y) {
				let packageHasBeenSplit = false;
				if (this.isSplitter()) {
					this.splitDelay = Math.max(this.splitDelay - 1, 0);
					
					if (this.splitDelay == 0) {
						if (this.offShootPackageTarget.addPackage(this.package)) {
							packageHasBeenSplit = true;
							this.package = null;
							this.splitDelay = this.splitRate;
						}
					}
				}
				
				if (!packageHasBeenSplit && !this.isDeadEnd() && this.packageTarget.addPackage(this.package)) {
					this.package = null;
				}
			}
		}
	}
	
	hasPackage() {
		return this.package !== null;
	}
	
	isDeadEnd() {
		return this.packageTarget === null;
	}
	
	isSplitter() {
		return this.offShootPackageTarget !== null;
	}
	
	addPackage(truckPackage) {
		if (!this.hasPackage()) {
			this.package = truckPackage;
			return true;
		}
		
		return false;
	}
	
	setNextPackageTarget(packageTarget) {
		this.packageTarget = packageTarget;
	}
	
	setOffShootPackageTarget(packageTarget) {
		this.offShootPackageTarget = packageTarget;
	}
	
	increaseSplitRate() {
		this.splitRate++;
		this.splitDelay = this.splitRate;
	}
	
	draw(ctx) {
		if (this.isSplitter()) {
			ctx.fillStyle = this.splitterColor;
			ctx.fillRect(this.x - this.width*.5, this.y - this.height*.5, this.width, this.height);
		}
		else {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x - this.width*.5, this.y - this.height*.5, this.width, this.height);
			
			if (!this.isDeadEnd()) {
				let x1 = Math.max(this.x - this.width*.5, this.packageTarget.x - this.packageTarget.width*.5);
				let y1 = Math.max(this.y - this.height*.5, this.packageTarget.y - this.packageTarget.height*.5);
				let x2 = Math.min(this.x + this.width*.5, this.packageTarget.x + this.packageTarget.width*.5);
				let y2 = Math.min(this.y + this.height*.5, this.packageTarget.y + this.packageTarget.height*.5);
				
				ctx.beginPath();
				ctx.strokeStyle = this.splitOffLineColor;
				ctx.lineWidth = 2;
				ctx.setLineDash([7, 4]);
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}
		}
	}
}