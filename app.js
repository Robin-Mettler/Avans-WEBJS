var currentStep = 0;
let freeSlots = [0, 1, 2, 3];

showStep(currentStep);

function showStep(n) {
    var tabs = document.getElementsByClassName("tab");
    tabs[n].style.display = "block";

    if (n == (tabs.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit";
    } else {
        document.getElementById("nextBtn").innerHTML = "Volgende";
    }
}

function nextStep() {
    var tabs = document.getElementsByClassName("tab");
    if (!validateForm()) return false;
    tabs[currentStep].style.display = "none";
    currentStep++;
    if (currentStep >= tabs.length) {
        createTruck(0, 
			document.getElementById("length").value,
			document.getElementById("width").value,
			document.getElementById("arrival_interval").value,
			document.getElementById("type").value,
			document.getElementById("radius").value
		);
        resetForm();
    }
    showStep(currentStep);
}

function validateForm() {
    var tabs, tab, i, valid = true;
    var tabs = document.getElementsByClassName("tab");
    var tab = tabs[currentStep].getElementsByTagName("input");

    for (i = 0; i < tab.length; i++) {
        if (currentStep == 0) {
            if (tab[i].value > 4) {
                valid = false;
            }
        }

        if (tab[i].value == "") {
            valid = false;
        }
    }
    return valid;
}

function resetForm() {
    currentStep = 0;
    document.getElementById("length").value = null;
    document.getElementById("width").value = null;
    document.getElementById("arrival_interval").value = null;
    document.getElementById("type").value = null;
    document.getElementById("radius").value = null;
}

function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
}

// HALLS //

var halls = [];
var currentHallId = 0;

class Hall {
	constructor(id) {
		this.id = id;
		this.trucks = [];
		this.packages = [];
		this.conveyers = [];
		this.startingConveyer = null;
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

function createHall() {
	halls.push(new Hall(halls.length))
}

createHall();

// PACKAGES //

var amountOfPackageIds = 0;

class Package {
	constructor(x, y) {
		this.id = amountOfPackageIds;
		this.x = x;
		this.y = y;
		
		this.width = 48;
		this.height = 48;
		this.shape = generatePackageShape();
		this.color = getRandomPackageColor();
		this.isBeingDragged = false;
		
		amountOfPackageIds++;
	}
	
	draw(ctx) {
		let packageX = this.x;
		let packageY = this.y;
		let packageWidth = this.width;
		let packageHeight = this.height;
		let packageColor = this.color;
		
		this.shape.forEach(function(vector) {
			let x = packageX - packageWidth*.5 + vector.x*packageWidth*.25;
			let y = packageY - packageHeight*.5 + vector.y*packageHeight*.25;
			
			// black outline
			ctx.fillStyle = "black";
			ctx.fillRect(x, y, packageWidth*.25, packageHeight*.25);
			
			// colored fill
			ctx.fillStyle = packageColor;
			ctx.fillRect(x + 1, y + 1, packageWidth*.25 - 2, packageHeight*.25 - 2);
		});
	}
}

var tetrominoShapes = [
	[ // straight hori
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 1, y: 3}
	],
	[ // straight vert
		{x: 0, y: 1},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 3, y: 1}
	],
	[ // square
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 2, y: 1},
		{x: 2, y: 2}
	],
	[ // T hori
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 2, y: 1}
	],
	[ // T vert
		{x: 0, y: 1},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 1, y: 2}
	],
	[ // L hori
		{x: 0, y: 1},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 2, y: 2}
	],
	[ // L vert
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 1, y: 2},
		{x: 2, y: 2}
	],
	[ // skew hori
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 2, y: 2}
	],
	[ // skew vert
		{x: 1, y: 0},
		{x: 1, y: 1},
		{x: 2, y: 1},
		{x: 2, y: 2}
	]
]

var packageColors = [
	"green",
	"red",
	"blue",
	"yellow",
	"purple",
	"orange",
	"lightblue"
]

function generatePackageShape() {
	let randomShape = tetrominoShapes[Math.floor(Math.random() * tetrominoShapes.length)];
	
	// copy shape
	let newShape = [];
	randomShape.forEach(function(vector) {
		newShape.push({x: vector.x, y: vector.y})
	});
	
	if (Math.random() <= .5) { // 50% chance
		mirrorFlipXShape(newShape);
	}
	if (Math.random() <= .5) { // 50% chance
		mirrorFlipYShape(newShape);
	}
	
	return newShape;
}

function mirrorFlipXShape(shape) {
	shape.forEach(function(vector) {
		vector.x = Math.abs(vector.x - 5) - 2;
	});
}

function mirrorFlipYShape(shape) {
	shape.forEach(function(vector) {
		vector.y = Math.abs(vector.y - 5) - 2;
	});
}

function getRandomPackageColor() {
	return packageColors[Math.floor(Math.random() * packageColors.length)];
}

// CONVEYER BELTS //

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
		}
		else {
			ctx.fillStyle = this.color;
		}
		
		ctx.fillRect(this.x - this.width*.5, this.y - this.height*.5, this.width, this.height);
	}
}

// TRUCKS //

class Truck {
	constructor(length, width, interval, type, radius) {
		this.length = length * 75;
		this.width = Math.round(width * 37.5);
		this.interval = interval;
		this.type = type;
		this.radius = radius;
		
		this.color = truckColor(this.type);
		this.slot = freeSlots.shift();
		this.y = 210;
		this.x = 240 * this.slot - this.width*.5 + 210;
		this.packages = [];
		this.packageSpeed = 2;
		this.acceptsPackages = true;
	}
	
	update() {		
		let target = this.getPackageTargetLocation();
		let packageSpeed = this.packageSpeed;
		
		let packagesToRemove = [];
		
		this.packages.forEach(function(truckPackage) {
			if (truckPackage.isBeingDragged) {
				packagesToRemove.push(truckPackage);
			}
			else {
				truckPackage.x = clamp(target.x, truckPackage.x - packageSpeed, truckPackage.x + packageSpeed);
				truckPackage.y = clamp(target.y, truckPackage.y - packageSpeed, truckPackage.y + packageSpeed);
			}
		});
		
		for (let i = 0; i < packagesToRemove.length; i++) {
			this.removePackage(packagesToRemove[i]);
		}
	}
	
	addPackage(truckPackage) {
		if (this.acceptsPackages) {
			this.packages.push(truckPackage);
			
			return true;
		}

		return false;
	}
	
	removePackage(truckPackageToDestroy) {
		let packageIndexToRemove = -1;
		for (let i = 0; i < this.packages.length; i++) {
			let truckPackage = this.packages[i];
			
			if (truckPackage.id == truckPackageToDestroy.id) {
				packageIndexToRemove = i;
				
				break;
			}
		}
		
		if (packageIndexToRemove != -1) {
			this.packages.splice(packageIndexToRemove, 1);
		}
	}
	
	getPackageTargetLocation() {
		return {x: this.x + this.width*.5, y: this.y + 30}
	}
	
	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.length);
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
}

// UPDATE LOGIC //

let updateRate = 20;

function update() {
	halls.forEach(function(hall) {
		if (hall.id == currentHallId) {
			hall.addPackage();
			
			hall.conveyers.forEach(function(conveyer) {
				conveyer.update();
			});
			hall.trucks.forEach(function(truck) {
				truck.update();
			});
		}
	});
	
	draw(currentHallId);
}

// CANVAS //

let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
let canvasWidth = 1200;
let canvasHeight = 1020;

function draw(hallId) {
	halls.forEach(function(hall) {
		if (hall.id == hallId) {
			clearCanvas()
			
			hall.trucks.forEach(function(truck) {
				truck.draw(ctx);
			});
			hall.conveyers.forEach(function(conveyer) {
				conveyer.draw(ctx);
			});
			hall.packages.forEach(function(truckPackage) {
				truckPackage.draw(ctx);
			});
		}
	});
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// DRAG AND DROP PACKAGES //

var pickedUpPackage = null;

function onMouseDown(e) {
	if (pickedUpPackage === null) {
		let canvasBoundingClientRect = canvas.getBoundingClientRect();
		let mouseX = parseInt(e.clientX - canvasBoundingClientRect.left);
		let mouseY = parseInt(e.clientY - canvasBoundingClientRect.top);
		
		halls.forEach(function(hall) {
			if (hall.id == currentHallId) {
				hall.packages.forEach(function(truckPackage) {
					// if mouse position is on top of a package pick it up
					if (pickedUpPackage === null && Math.abs(mouseX - truckPackage.x) <= truckPackage.width*.5 
							&& Math.abs(mouseY - truckPackage.y) <= truckPackage.height*.5 ) {
						e.preventDefault();
						e.stopPropagation();
						
						pickedUpPackage = truckPackage;
						
						truckPackage.x = mouseX;
						truckPackage.y = mouseY;
						truckPackage.isBeingDragged = true;
					}
				});
			}
		});
	}
}

function onMouseMove(e) {
	// move package if it is picked up
	if (pickedUpPackage !== null) {
		e.preventDefault();
        e.stopPropagation();
		
		let canvasBoundingClientRect = canvas.getBoundingClientRect();
		let mouseX = parseInt(e.clientX - canvasBoundingClientRect.left);
		let mouseY = parseInt(e.clientY - canvasBoundingClientRect.top);
		
		pickedUpPackage.x = mouseX;
		pickedUpPackage.y = mouseY;
	}
}

function onMouseUp(e) {
	// drop package on mouse up
	if (pickedUpPackage !== null) {
		e.preventDefault();
        e.stopPropagation();
		
		let canvasBoundingClientRect = canvas.getBoundingClientRect();
		let mouseX = parseInt(e.clientX - canvasBoundingClientRect.left);
		let mouseY = parseInt(e.clientY - canvasBoundingClientRect.top);
		
		halls.forEach(function(hall) {
			if (hall.id == currentHallId) {
				let packageInTruck = false;
				
				hall.trucks.forEach(function(truck) {
					if (mouseX >= truck.x && mouseX <= truck.x + truck.width
							&& mouseY >= truck.y && mouseY <= truck.y + truck.length) {
						
						let target = truck.getPackageTargetLocation();
						pickedUpPackage.x = target.x;
						pickedUpPackage.y = target.y;
						pickedUpPackage.isBeingDragged = false;
						
						truck.addPackage(pickedUpPackage);
						
						packageInTruck = true;
					}
				});
				
				if (!packageInTruck) {
					hall.destroyPackage(pickedUpPackage);
				}
				
				
				pickedUpPackage = null;
			}
		});
	}
}

canvas.onmousedown = onMouseDown;
canvas.onmousemove = onMouseMove;
canvas.onmouseup = onMouseUp;

setInterval(update, updateRate)