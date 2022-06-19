class Truck {
	constructor(hallId, length, width, interval, type, radius) {
		this.length = length * 52 + 80;
		this.lengthInPackages = length;
		this.width = Math.round(width * 52) + 20;
		this.widthInPackages = width;
		this.interval = interval;
		this.type = type;
		this.radius = radius;
		
		this.color = truckColor(this.type);
		this.packageSlotColor = "white";
		this.packageSlotBorderColor = "black";
		this.slot = halls[hallId].freeSlots.shift();
		this.hallId = hallId;
		this.y = 210;
		this.x = 240 * this.slot - this.width*.5 + 210;
		this.packages = [];
		this.packageCapacity = length * width;
		this.packageSpeed = 2;
		this.acceptsPackages = true;
		
		this.truckSpeed = 10;
		this.isLeaving = false;
		this.isEntering = false;
		this.hasLeft = false;
	}
	
	update() {
		if (this.isLeaving) {
			let speed = this.truckSpeed;
			this.y += speed;
			
			this.packages.forEach(function(truckPackage) {
				truckPackage.y += speed;
			});
			
			if (this.y >= canvasHeight) {
				this.hasLeft = true;
				this.isLeaving = false;
				
				let truck = this;
				setTimeout(function() {
					truck.arrive();
				}, this.interval * 1000);
				
				this.deliverAllPackages();
			}
		}
		else if (this.isEntering) {
			let speed = Math.max(this.y - this.truckSpeed, 210) - this.y;
			this.y += speed;
			
			this.packages.forEach(function(truckPackage) {
				truckPackage.y += speed;
			});
			
			if (this.y == 210) {
				this.acceptsPackages = true;
				this.isEntering = false;
				
				updateHallTruckButtons();
			}
		}
		else {
			let target = this.getPackageTargetLocation();
			let packageSpeed = this.packageSpeed;
			
			let packagesToRemove = [];
			
			let truck = this;
			this.packages.forEach(function(truckPackage) {
				if (truckPackage.isBeingDragged) {
					packagesToRemove.push(truckPackage);
				}
				else if (!truckPackage.slottedInTruck) {
					truckPackage.x = clamp(target.x, truckPackage.x - packageSpeed, truckPackage.x + packageSpeed);
					truckPackage.y = clamp(target.y, truckPackage.y - packageSpeed, truckPackage.y + packageSpeed);
					
					if (truckPackage.x == target.x && truckPackage.y == target.y) {
						truckPackage.slottedInTruck = true;
						
						let slotPosition = truck.getPackageSlotLocation(truckPackage.slotId);
						truckPackage.x = slotPosition.x;
						truckPackage.y = slotPosition.y;
					}
				}
			});
			
			for (let i = 0; i < packagesToRemove.length; i++) {
				this.removePackage(packagesToRemove[i]);
			}
			
			if (packagesToRemove.length != 0) {
				this.updatePackageSlotIds();
			}
		}
	}
	
	addPackage(truckPackage) {
		if (this.acceptsPackages && this.packages.length < this.packageCapacity) {
			this.packages.push(truckPackage);
			
			truckPackage.slotId = this.packages.length - 1;
			
			return true;
		}

		return false;
	}
	
	removePackage(truckPackageToRemove) {
		let packageIndexToRemove = -1;
		for (let i = 0; i < this.packages.length; i++) {
			let truckPackage = this.packages[i];
			
			if (truckPackage.id == truckPackageToRemove.id) {
				packageIndexToRemove = i;
				
				break;
			}
		}
		
		if (packageIndexToRemove != -1) {
			this.packages.splice(packageIndexToRemove, 1);
			
			this.updatePackageSlotIds();
		}
	}
	
	deliverAllPackages() {
		let truckHall = null;
		let truck = this;
		halls.forEach(function(hall) {
			if (hall.id == truck.hallId) {
				truckHall = hall;
			}
		})
		
		this.packages.forEach(function(truckPackage) {
			truckHall.destroyPackage(truckPackage);
		});
		
		this.packages = [];
	}
	
	slotInAllPackages() {
		let truck = this;
		this.packages.forEach(function(truckPackage) {
			truckPackage.slottedInTruck = true;
				
			let slotPosition = truck.getPackageSlotLocation(truckPackage.slotId);
			truckPackage.x = slotPosition.x;
			truckPackage.y = slotPosition.y;
		});
	}
	
	updatePackageSlotIds() {
		for (let i = 0; i < this.packages.length; i++) {
			let truckPackage = this.packages[i];
			truckPackage.slotId = i;
			
			if (truckPackage.slottedInTruck) {
				let slotPosition = this.getPackageSlotLocation(truckPackage.slotId);
				truckPackage.x = slotPosition.x;
				truckPackage.y = slotPosition.y;
			}
		}
	}
	
	getPackageTargetLocation() {
		return {x: this.x + this.width*.5, y: this.y + 30};
	}
	
	getPackageSlotLocation(slotId) {
		let x = this.x + 36 + (slotId%this.widthInPackages)*52;
		let y = this.y + 36 + Math.floor(slotId/this.widthInPackages)*52;
		
		return {x: x, y: y};
	}
	
	leave() {
		this.acceptsPackages = false;
		this.isLeaving = true;
		
		updateHallTruckButtons();
		this.slotInAllPackages();
	}
	
	arrive() {
		this.hasLeft = false;
		this.isEntering = true;
	}
	
	available() {
		return !this.isLeaving && !this.hasLeft && !this.isEntering;
	}
	
	draw(ctx) {
		if (!this.hasLeft) {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.length);
			
			ctx.fillStyle = this.packageSlotBorderColor;
			for (let x = 0; x < this.widthInPackages; x++) {
				for (let y = 0; y < this.lengthInPackages; y++) {
					ctx.fillRect(this.x + x*52 + 11, this.y + y*52 + 11, 50, 50);
				}
			}
			
			ctx.fillStyle = this.packageSlotColor;
			for (let x = 0; x < this.widthInPackages; x++) {
				for (let y = 0; y < this.lengthInPackages; y++) {
					ctx.fillRect(this.x + x*52 + 12, this.y + y*52 + 12, 48, 48);
				}
			}
		}
	}
}

function truckColor(type) {
    let color = null;
    switch(type) {
        case 'cold':
            color = "rgb(204,255,255)";
            break;
        case 'fragile':
            color = "rgb(255,204,204)";
            break;
        case 'general':
            color = "rgb(224,224,224)";
            break;
        case 'pallets':
            color = "rgb(255,229,204)";
            break;
        case 'fastdelivery':
            color = "rgb(255,255,204)";
            break;
    }
    return color;
}

function createTruck(hallId, length, width, interval, type, radius) {
	let truck = new Truck(
		hallId,
        length,
        width,
        interval,
        type,
        radius
    );
	
	halls.forEach(function(hall) {
		if (hall.id == hallId) {
			hall.addTruck(truck);
		}
	});
	
	updateHallTruckButtons();
}

async function sendTruckAway(slot) {
    let selectedTruck = null;
    let selectedHall = null;
    halls.forEach(function(hall) {
		if (hall.id == currentHallId) {
            selectedHall = hall;
            selectedTruck = hall.trucks[slot];
        }
    });

    if (await allowedToLeaveDueToWeather(selectedTruck.type, currentCity)) {
		selectedTruck.leave();
    }
}

for (let i = 0; i < 4; i++) {
	document.getElementById("send" + i).addEventListener("click", function() {sendTruckAway(i)});
}