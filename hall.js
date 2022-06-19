var halls = [];
var currentHallId = 0;

class Hall {
	constructor(id) {
		this.id = id;
		this.trucks = [];
		this.packages = [];
		this.conveyers = [];
		this.startingConveyer = null;
		this.freeSlots = [0, 1, 2, 3];
	}
	
	addTruck(truck) {
		this.trucks.push(truck);
		
		this.conveyers.forEach(function(conveyer) {
			if (conveyer.isSplitter()) {
				conveyer.increaseSplitRate();
			}
		});
		
		for (let i=0; i < 3; i++) {
			let conveyer = new ConveyerBelt(truck.slot*240 + i*60 + 30, 60);
			
			this.conveyers.push(conveyer);
			
			if (this.conveyers.length != 1) {
				this.conveyers[this.conveyers.length - 2].setNextPackageTarget(conveyer);
			}
			else {
				this.setStartingConveyer(conveyer);
			}
		}
		
		for (let i=0; i < 2; i++) {
			let conveyer = new ConveyerBelt(truck.slot*240 + 180 + 30, 120 + i*60);
			
			this.conveyers[this.conveyers.length - 1].setNextPackageTarget(conveyer);
			this.conveyers.push(conveyer);
			
			if (i == 1) {
				conveyer.setNextPackageTarget(truck);
			}
		}
		
		// splitter
		let conveyer = new ConveyerBelt(truck.slot*240 + 180 + 30, 60);
		
		this.conveyers[this.conveyers.length - 3].setNextPackageTarget(conveyer);
		conveyer.setOffShootPackageTarget(this.conveyers[this.conveyers.length - 2]);
		this.conveyers.push(conveyer);
	}
	
	addPackage() {
		if (this.startingConveyer !== null) {
			let truckPackage = new Package(
				this.startingConveyer.x - 60,
				this.startingConveyer.y
			)
			
			if (this.startingConveyer.addPackage(truckPackage)) {
				this.packages.push(truckPackage);
			}
		}
	}
	
	destroyPackage(truckPackageToDestroy) {
		let packageIndexToDestroy = -1;
		for (let i = 0; i < this.packages.length; i++) {
			let truckPackage = this.packages[i];
			
			if (truckPackage.id == truckPackageToDestroy.id) {
				packageIndexToDestroy = i;
				
				break;
			}
		}
		
		if (packageIndexToDestroy != -1) {
			this.packages.splice(packageIndexToDestroy, 1);
		}
	}
	
	setStartingConveyer(startingConveyer) {
		this.startingConveyer = startingConveyer;
	}
}

function updateHallArrowButtons() {
	let hallLeft = document.getElementById("hall-left-button");
	let hallRight = document.getElementById("hall-right-button");
	let hallText = document.getElementById("hall-identfier");
	
	hallLeft.disabled = currentHallId == 0;
	hallRight.disabled = currentHallId == halls.length - 1;
	hallText.innerHTML = "Hall " + (currentHallId + 1);
}

async function updateHallTruckButtons() {
    let currentHall = null;
    halls.forEach(function(hall) {
		if (hall.id == currentHallId) {
            currentHall = hall;
        }
    });
	
	for (let i=0; i < 4; i++) {
		let truckButton = document.getElementById("send" + i);
		
		if (i >= currentHall.trucks.length) {
			truckButton.disabled = true;
		}
		else {
			let truck = currentHall.trucks[i];
			
			if (truck.available() && await allowedToLeaveDueToWeather(truck.type, currentCity)) {
				truckButton.disabled = false;
			}
			else {
				truckButton.disabled = true;
			}
		}
	}
}

function nextHall() {
	if (currentHallId != halls.length - 1) {
		// drop left-over dragged package
		dropPackage(0, 0);
		
		currentHallId++;
		
		updateHallArrowButtons();
		updateHallTruckButtons();
	}
}

function previousHall() {
	if (currentHallId != 0) {
		// drop left-over dragged package
		dropPackage(0, 0);
		
		currentHallId--;
		
		updateHallArrowButtons();
		updateHallTruckButtons();
	}
}

function createHall() {
	halls.push(new Hall(halls.length));
	
	updateHallArrowButtons();
}

for (let i=0; i < 2; i++) { // initialize 2 halls
	createHall();
}

document.getElementById("hall-left-button").addEventListener("click", previousHall);
document.getElementById("hall-right-button").addEventListener("click", nextHall);